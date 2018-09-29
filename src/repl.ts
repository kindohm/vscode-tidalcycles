import * as vscode from 'vscode';
import { Config } from './config';
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

    constructor(private logger: ILogger, private config: Config, private ghci: IGhci, private tidal: ITidal) {
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
        this.showRandomMessage();
    }

    private incrementEvalCount() {
        this.evalCount++;
        if (this.config.showEvalCount()) { this.logger.log(`${this.config.evalCountPrefix()}${this.evalCount} `); }
    }

    private showRandomMessage() {
        const messages = this.config.randomMessages();
        if (messages.length > 0 && this.config.randomMessageProbability() > Math.random()) {
            this.logger.log(`${messages[this.getRandomIntInclusive(0, messages.length - 1)]} `);
        }
    }

    private getRandomIntInclusive(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private feedback(range: vscode.Range): void {
        const flashDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: this.config.feedbackColor()
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