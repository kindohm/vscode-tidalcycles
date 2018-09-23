import { ILogger } from "./logging";
import { Config } from "./config";
import { IGhci } from "./ghci";
import * as vscode from 'vscode';

export interface ITidal {
    sendTidalExpression(expression: string): Promise<void>;
}

export class Tidal implements ITidal {
    logger: ILogger;
    config: Config;
    ghci: IGhci;
    tidalBooted: boolean = false;
    lineEnding = vscode.workspace.getConfiguration('files', null).get('eol', '\n');

    constructor(logger: ILogger, config: Config, ghci: IGhci) {
        this.logger = logger;
        this.config = config;
        this.ghci = ghci;
    }

    private async bootTidal(): Promise<boolean> {
        if (this.tidalBooted) {
            return true;
        }

        // Use a custom boot file if the user has specified it. If it cannot be loaded, perform the
        // default Tidal boot sequence.
        const bootTidalPath = this.config.bootTidalPath();
        const useBootFileInCurrentDirectory = this.config.useBootFileInCurrentDirectory();

        let uri: vscode.Uri | null = null;

        if (useBootFileInCurrentDirectory) {
            const folders = vscode.workspace.workspaceFolders;

            if (folders !== undefined && folders.length > 0) {
                uri = vscode.Uri.parse(`file:///${folders[0]}/BootTidal.hs`);
            } else {
                this.logger.warning('You must open a folder or workspace in order to use the Tidal useBootFileInCurrentDirectory setting.');
            }
        } else if (bootTidalPath) {
            uri = vscode.Uri.parse(`file:///${bootTidalPath}`);
        }

        let bootCommands: string[] = this.bootCommands;

        if (uri !== null) {
            let maybeBootCommands = await this.getBootCommandsFromFile(uri);
            if (maybeBootCommands !== null) {
                bootCommands = maybeBootCommands;
            }
        }

        for (const command of bootCommands) {
            await this.ghci.writeLn(command);
        }
        this.tidalBooted = true;
        return true;
    }

    public async sendTidalExpression(expression: string) {
        if (!await this.bootTidal()) {
            this.logger.error('Could not boot Tidal');
            return;
        }

        this.ghci.writeLn(':{');
        const splits = expression.split(this.lineEnding);
        for (let i = 0; i < splits.length; i++) {
            this.ghci.writeLn(splits[i]);
        }
        this.ghci.writeLn(':}');
    }

    private async getBootCommandsFromFile(uri: vscode.Uri): Promise<string[] | null> {

        this.logger.log(`Using Tidal boot file on disk at ${uri.fsPath}`);

        let doc: vscode.TextDocument;
        try {
            doc = await vscode.workspace.openTextDocument(uri);
            return doc.getText().split(this.lineEnding);
        } catch (e) {
            this.logger.error(`Failed to load boot commands from ${uri}`);
            return null;
        } finally {
            return null;
        }
    }

    bootCommands: string[] =
        [
            ':set prompt ""',
            ':module Sound.Tidal.Context',
            '(cps, getNow) <- bpsUtils',
            '(c1,ct1) <- dirtSetters getNow',
            '(c2,ct2) <- dirtSetters getNow',
            '(c3,ct3) <- dirtSetters getNow',
            '(c4,ct4) <- dirtSetters getNow',
            '(c5,ct5) <- dirtSetters getNow',
            '(c6,ct6) <- dirtSetters getNow',
            '(c7,ct7) <- dirtSetters getNow',
            '(c8,ct8) <- dirtSetters getNow',
            '(c9,ct9) <- dirtSetters getNow',
            '(d1,t1) <- superDirtSetters getNow',
            '(d2,t2) <- superDirtSetters getNow',
            '(d3,t3) <- superDirtSetters getNow',
            '(d4,t4) <- superDirtSetters getNow',
            '(d5,t5) <- superDirtSetters getNow',
            '(d6,t6) <- superDirtSetters getNow',
            '(d7,t7) <- superDirtSetters getNow',
            '(d8,t8) <- superDirtSetters getNow',
            '(d9,t9) <- superDirtSetters getNow',
            'let bps x = cps (x/2)',
            'let hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,c1,c2,c3,c4,c5,c6,c7,c8,c9]',
            'let solo = (>>) hush',
            'let replicator text1 = [putStr (text1) | x <- replicate 3000 text1]',
            'let flood text2 = sequence_(replicator text2)',
            ':set prompt "tidal> "'
        ];
}