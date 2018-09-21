import { Logger } from "./logging";
import { Config } from "./config";
import { IGhci } from "./ghci";
import * as vscode from 'vscode';

export interface ITidal {
    sendTidalExpression(expression: string): Promise<void>;
}

export class Tidal implements ITidal {
    logger: Logger;
    config: Config;
    ghci: IGhci;
    tidalBooted: boolean = false;
    
    constructor(logger: Logger, config: Config, ghci: IGhci) {
        this.logger = logger;
        this.config = config;
        this.ghci = ghci;
    }
    
    private async bootTidal() {
        // TODO: re-enable boot files
        if (this.tidalBooted) {
            return;
        }

        for (const command of this.bootCommands) {
            await this.ghci.writeLn(command);
        }
        this.tidalBooted = true;
    }

    public async sendTidalExpression(expression: string) {
        await this.bootTidal();

        this.ghci.writeLn(':{');
        let lineEnding = vscode.workspace.getConfiguration('files').get('eol', '\n');
        const splits = expression.split(lineEnding);
        for (let i = 0; i < splits.length; i++) {
            this.ghci.writeLn(splits[i]);
        }
        this.ghci.writeLn(':}');
    }

    // private ensureTidalBooted(): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         // If already booted, don't try again
    //         if (this.tidalBooted) {
    //             resolve();
    //             return;
    //         }

    //         // Use a custom boot file if the user has specified it.
    //         // The promise is rejected if the file cannot be found. User can
    //         // re-configure their settings and retry as `booted = false` still. 
    //         const bootTidalPath = this.config.bootTidalPath();
    //         const useBootFileInCurrentDirectory = this.config.useBootFileInCurrentDirectory();
    //         let uri: any;

    //         if (useBootFileInCurrentDirectory) {
    //             // TODO: fix this - vscode.workspace.workspaceFolders doesn't exist
    //             let folder: string = vscode.workspace.rootPath;

    //             // user has configured to use a BootTidal.hs file in the current VS Code folder,
    //             // but there is no folder opened.
    //             if (folder) {
    //                 uri = vscode.Uri.parse(`file:///${folder}/BootTidal.hs`);
    //             } else {
    //                 const message = 'You must open a folder or workspace in order to use the Tidal useBootFileInCurrentDirectory setting.';
    //                 this.logger.error(message);
    //                 return reject();
    //             }

    //         } else if (bootTidalPath) {
    //             uri = vscode.Uri.parse(`file:///${bootTidalPath}`);
    //         }

    //         if (uri) {
    //             this.logger.log(`Using Tidal boot file on disk at ${uri.fsPath}`);
    //             const p = vscode.workspace.openTextDocument(uri);

    //             return p.then((doc: any) => {
    //                 // only gets called if file was found.
    //                 const commands = doc.getText().split('\n');
    //                 for (let i = 0; i < commands.length; i++) {
    //                     this.ghci.writeLn(commands[i]);
    //                 }
    //                 this.tidalBooted = true;
    //                 resolve();
    //                 return;
    //             }, (reason: any) => {
    //                 const message = `Could not open boot file located at ${uri.fsPath}. User Settings: { bootTidalPath: ${bootTidalPath}, useBootFileInCurrentDirectory: ${useBootFileInCurrentDirectory} }.`;
    //                 this.logger.error(message);
    //                 reject();
    //                 return;
    //             });
    //         }

    //         this.logger.log('Using default Tidal package boot.');
    //         return Promise.all(this.bootCommands.map(this.ghci.writeLn))
    //             .then(() => {
    //                 this.tidalBooted = true;
    //                 resolve();
    //                 return;
    //             })
    //             .catch((err) => {
    //                 this.logger.error(err);
    //                 reject();
    //                 return;
    //             });
    //     });
    // }

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