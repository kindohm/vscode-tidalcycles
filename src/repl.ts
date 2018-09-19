'use strict';
import * as vscode from 'vscode';
import * as expression from './expression';
import { Config } from './config';
import { Logger } from './logging';
import { Ghci } from './ghci';

export class Repl {

    logger: Logger;
    config: Config;
    ghci: Ghci;
    postChannel: vscode.OutputChannel | null = null;
    evalCount = 0;
    tidalBooted = false;

    constructor(logger: Logger, config: Config, ghci: Ghci) {
        this.logger = logger;
        this.config = config;
        this.ghci = ghci;
    }

    private ensureTidalBooted() {
        return this.bootTidal()
            .catch((err: any) => {
                this.logger.error(err.message);
            });
    }

    private static editingTidalFile() {
        return vscode.window.activeTextEditor.document.fileName.endsWith('.tidal');
    }

    public hush() {
        if (!Repl.editingTidalFile()) { return Promise.resolve(); }
        return this.ensureTidalBooted()
            .then(() => {
                this.sendTidalExpression('hush');
                this.logger.log('hush');
            });
    }

    public evaluate(isMultiline: any): Promise<void> {
        if (!Repl.editingTidalFile()) { return Promise.resolve(); }

        return this.ensureTidalBooted()
            .then(() => {
                const block = expression.getBlock(isMultiline);
                if (block) {
                    this.sendTidalExpression(block.expression);
                    this.feedback(block.range);
                }
                this.incrementEvalCount();
                this.showRandomMessage();
            });
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

    private feedback(range: any) {
        const flashDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: this.config.feedbackColor()
        });

        vscode.window.activeTextEditor.setDecorations(flashDecorationType, [range]);
        setTimeout(function () {
            flashDecorationType.dispose();
        }, 250);
    }

    private sendTidalExpression(expression: any) {
        this.ghci.writeLn(':{');
        const splits = expression.split('\n');
        for (let i = 0; i < splits.length; i++) {
            this.ghci.writeLn(splits[i]);
        }
        this.ghci.writeLn(':}');
    }

    private bootTidal(): Promise<void> {
        return new Promise((resolve, reject) => {
            // If already booted, don't try again
            if (this.tidalBooted) {
                resolve();
                return;
            }

            // Use a custom boot file if the user has specified it.
            // The promise is rejected if the file cannot be found. User can
            // re-configure their settings and retry as `booted = false` still. 

            const bootTidalPath = this.config.bootTidalPath();
            const useBootFileInCurrentDirectory = this.config.useBootFileInCurrentDirectory();
            let uri: any;

            if (useBootFileInCurrentDirectory) {
                // TODO: fix this - vscode.workspace.workspaceFolders doesn't exist
                let folders: any;
                //const folders = vscode.workspace.workspaceFolders;

                // user has configured to use a BootTidal.hs file in the current VS Code folder,
                // but there is no folder opened.
                if (!folders) {
                    const message = 'You must open a folder or workspace in order to use the Tidal useBootFileInCurrentDirectory setting.';
                    this.logger.log(message);
                    vscode.window.showErrorMessage(message);
                    return reject();
                }

                if (folders && folders.length === 0) {
                    const message = 'You must have at least one folder in your workspace in order to use the Tidal useBootFileInCurrentDirectory setting.';
                    this.logger.log(message);
                    vscode.window.showErrorMessage(message);
                    return reject();
                }

                const dir = folders[0].uri.fsPath;
                uri = vscode.Uri.parse(`file:///${dir}/BootTidal.hs`);
            } else if (bootTidalPath) {
                uri = vscode.Uri.parse('file:///' + bootTidalPath);
            }

            if (uri) {
                this.logger.log('Using Tidal boot file on disk at ' + uri.fsPath);
                const p = vscode.workspace.openTextDocument(uri);

                return p.then((doc: any) => {
                    // only gets called if file was found.
                    const commands = doc.getText().split('\n');
                    for (let i = 0; i < commands.length; i++) {
                        this.ghci.writeLn(commands[i]);
                    }
                    this.tidalBooted = true;
                    resolve();
                }, (reason: any) => {
                    const message = `Could not open boot file located at ${uri.fsPath}. User Settings: { bootTidalPath: ${bootTidalPath}, useBootFileInCurrentDirectory: ${useBootFileInCurrentDirectory} }.`;
                    this.logger.log(message);
                    vscode.window.showErrorMessage(message);
                    reject();
                });
            }

            this.logger.log('Using default Tidal package boot.');
            this.bootDefault();
            this.tidalBooted = true;
            resolve();

        });
    }

    bootDefault() {
        this.ghci.writeLn(':set prompt ""');
        this.ghci.writeLn(':module Sound.Tidal.Context');

        this.ghci.writeLn('(cps, getNow) <- bpsUtils');

        this.ghci.writeLn('(c1,ct1) <- dirtSetters getNow');
        this.ghci.writeLn('(c2,ct2) <- dirtSetters getNow');
        this.ghci.writeLn('(c3,ct3) <- dirtSetters getNow');
        this.ghci.writeLn('(c4,ct4) <- dirtSetters getNow');
        this.ghci.writeLn('(c5,ct5) <- dirtSetters getNow');
        this.ghci.writeLn('(c6,ct6) <- dirtSetters getNow');
        this.ghci.writeLn('(c7,ct7) <- dirtSetters getNow');
        this.ghci.writeLn('(c8,ct8) <- dirtSetters getNow');
        this.ghci.writeLn('(c9,ct9) <- dirtSetters getNow');

        this.ghci.writeLn('(d1,t1) <- superDirtSetters getNow');
        this.ghci.writeLn('(d2,t2) <- superDirtSetters getNow');
        this.ghci.writeLn('(d3,t3) <- superDirtSetters getNow');
        this.ghci.writeLn('(d4,t4) <- superDirtSetters getNow');
        this.ghci.writeLn('(d5,t5) <- superDirtSetters getNow');
        this.ghci.writeLn('(d6,t6) <- superDirtSetters getNow');
        this.ghci.writeLn('(d7,t7) <- superDirtSetters getNow');
        this.ghci.writeLn('(d8,t8) <- superDirtSetters getNow');
        this.ghci.writeLn('(d9,t9) <- superDirtSetters getNow');

        this.ghci.writeLn('let bps x = cps (x/2)');
        this.ghci.writeLn('let hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,c1,c2,c3,c4,c5,c6,c7,c8,c9]');
        this.ghci.writeLn('let solo = (>>) hush');

        this.ghci.writeLn('let replicator text1 = [putStr (text1) | x <- replicate 3000 text1]');
        this.ghci.writeLn('let flood text2 = sequence_(replicator text2)');

        this.ghci.writeLn(':set prompt "tidal> "');
    }
}