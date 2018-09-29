import * as vscode from 'vscode';
import { ILogger } from './logging';
import { ITidal } from './tidal';
import { TidalEditor } from './editor';
import { IHistory } from './history';

/**
 * Provides the UI commands for an interactive Tidal session.
 */
export interface IRepl {
    hush(): Promise<void>;
    evaluate(isMultiline: boolean): Promise<void>;
}

export class Repl implements IRepl {
    public readonly postChannel: vscode.OutputChannel | null = null;

    constructor(private logger: ILogger, private tidal: ITidal, 
        private textEditor: vscode.TextEditor, private history: IHistory, 
        private feedbackColor: string) {
    }

    private editingTidalFile(): boolean {
        return this.textEditor.document.fileName.endsWith('.tidal');
    }

    public async hush() {
        if (!this.editingTidalFile()) {
            return;
        }

        await this.tidal.sendTidalExpression('hush');
        this.logger.log('hush');
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
        const flashDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: this.feedbackColor
        });
        this.textEditor.setDecorations(flashDecorationType, [range]);
        setTimeout(function () {
            flashDecorationType.dispose();
        }, 250);
    }

}