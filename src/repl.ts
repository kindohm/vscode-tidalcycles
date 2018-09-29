import * as vscode from 'vscode';
import { ILogger } from './logging';
import { IGhci } from './ghci';
import { ITidal } from './tidal';
import { TidalEditor } from './editor';

/**
 * Provides the UI commands for an interactive Tidal session.
 */
export interface IRepl {
    hush(): Promise<void>;
    evaluate(isMultiline: boolean): Promise<void>;
}

export class Repl implements IRepl {
    postChannel: vscode.OutputChannel | null = null;
    evalCount = 0;

    constructor(private logger: ILogger, private tidal: ITidal, 
        private showEvalCount: boolean, private feedbackColor: string) {
    }

    private static editingTidalFile(): boolean {
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            return false;
        }
        return editor.document.fileName.endsWith('.tidal');
    }

    public async hush() {
        if (!Repl.editingTidalFile()) {
            return;
        }

        await this.tidal.sendTidalExpression('hush');
        this.logger.log('hush');
    }

    public async evaluate(isMultiline: boolean) {
        if (!Repl.editingTidalFile()) { 
            return; 
        }

        if (vscode.window.activeTextEditor === undefined) {
            return;
        }

        const block = new TidalEditor(vscode.window.activeTextEditor).getTidalExpressionUnderCursor(isMultiline);
        if (block) {
            await this.tidal.sendTidalExpression(block.expression);
            this.feedback(block.range);
        }
        this.incrementEvalCount();
    }

    private incrementEvalCount() {
        this.evalCount++;
        if (this.showEvalCount) { this.logger.log(`Evals: ${this.evalCount} `); }
    }

    private feedback(range: vscode.Range): void {
        const flashDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: this.feedbackColor
        });

        if (vscode.window.activeTextEditor === undefined) {
            return;
        }
        vscode.window.activeTextEditor.setDecorations(flashDecorationType, [range]);
        setTimeout(function () {
            flashDecorationType.dispose();
        }, 250);
    }

}