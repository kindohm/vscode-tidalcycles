import * as vscode from 'vscode';
import { ITidal } from './tidal';
import { TidalEditor, TidalExpression } from './editor';
import { IHistory } from './history';
import { DecorationRenderOptions, TextEditorDecorationType } from 'vscode';

/**
 * Provides the UI commands for an interactive Tidal session.
 */
export interface IRepl {
    hush(): Promise<void>;
    evaluate(isMultiline: boolean): Promise<void>;
}

export class Repl implements IRepl {
    public readonly postChannel: vscode.OutputChannel | null = null;

    constructor(private tidal: ITidal, 
        private textEditor: vscode.TextEditor, private history: IHistory, 
        private feedbackColor: string, 
        private createTextEditorDecorationType: (_: DecorationRenderOptions) => TextEditorDecorationType) {
    }

    private editingTidalFile(): boolean {
        return this.textEditor.document.fileName.endsWith('.tidal');
    }

    public async hush() {
        if (!this.editingTidalFile()) {
            return;
        }

        await this.tidal.sendTidalExpression('hush');
        this.history.log(new TidalExpression('hush', new vscode.Range(0, 0, 0, 0)));
    }

    public async evaluate(isMultiline: boolean) {
        if (!this.editingTidalFile()) { 
            return; 
        }

        const block = new TidalEditor(this.textEditor).getTidalExpressionUnderCursor(isMultiline);
        if (block) {
            await this.tidal.sendTidalExpression(block.expression);
            this.feedback(block.range);
            this.history.log(block);
        }
    }

    private feedback(range: vscode.Range): void {
        const flashDecorationType = this.createTextEditorDecorationType({
            backgroundColor: this.feedbackColor
        });
        this.textEditor.setDecorations(flashDecorationType, [range]);
        setTimeout(function () {
            flashDecorationType.dispose();
        }, 250);
    }

}