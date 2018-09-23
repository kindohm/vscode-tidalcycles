import * as vscode from 'vscode';
import * as expression from './expression';
import { Config } from './config';
import { Logger } from './logging';
import { IGhci } from './ghci';
import { ITidal } from './tidal';

export class Repl {

    logger: Logger;
    config: Config;
    ghci: IGhci;
    tidal: ITidal;
    postChannel: vscode.OutputChannel | null = null;
    evalCount = 0;

    constructor(logger: Logger, config: Config, ghci: IGhci, tidal: ITidal) {
        this.logger = logger;
        this.config = config;
        this.ghci = ghci;
        this.tidal = tidal;
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

    public async evaluate(isMultiline: any) {
        if (!Repl.editingTidalFile()) { 
            return; 
        }

        const block = expression.getBlock(isMultiline);
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

    private getRandomIntInclusive(min: any, max: any) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private feedback(range: any): void {
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