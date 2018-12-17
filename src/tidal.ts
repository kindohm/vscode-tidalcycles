import { ILogger } from "./logging";
import { IGhci } from "./ghci";
import * as vscode from 'vscode';


/**
 * Provides an interface to send instructions to the current Tidal instance.
 */
export interface ITidal {
    sendTidalExpression(expression: string): Promise<void>;
}

export class Tidal implements ITidal {
    tidalBooted: boolean = false;
    lineEnding = vscode.workspace.getConfiguration('files', null).get('eol', '\n');

    constructor(private logger: ILogger, private ghci: IGhci,
        private bootTidalPath: string | null, private useBootFileInCurrentDirectory: boolean) {
    }

    private async bootTidal(): Promise<boolean> {
        if (this.tidalBooted) {
            return true;
        }

        // Use a custom boot file if the user has specified it. If it cannot be loaded, perform the
        // default Tidal boot sequence.
        const bootTidalPath = this.bootTidalPath;
        const useBootFileInCurrentDirectory = this.useBootFileInCurrentDirectory;

        let uri: vscode.Uri | null = null;

        if (useBootFileInCurrentDirectory) {
            const folders = vscode.workspace.workspaceFolders;

            if (folders !== undefined && folders.length > 0) {
                uri = vscode.Uri.parse(`file://${folders[0].uri.path}/BootTidal.hs`);
            } else {
                this.logger.warning('You must open a folder or workspace in order to use the Tidal \
                useBootFileInCurrentDirectory setting.');
            }
        } else if (bootTidalPath) {
            uri = vscode.Uri.file(`${bootTidalPath}`);
        }

        let bootCommands: string[] = this.bootCommands;

        if (uri !== null) {
            let maybeBootCommands = await this.getBootCommandsFromFile(uri);
            if (maybeBootCommands !== null) {
                bootCommands = maybeBootCommands;
            }
        }

        for (const command of bootCommands) {
            this.ghci.writeLn(command);
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
        const splits = expression.split(/[\r\n]+/);
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
            return doc.getText().split(/[\r\n]+/);
        } catch (e) {
            this.logger.error(`Failed to load boot commands from ${uri.fsPath}`);
            return null;
        }
    }

    bootCommands: string[] =
        [
            ':set -XOverloadedStrings',
            ':set prompt ""',
            ':set prompt-cont ""',
            'import Sound.Tidal.Context',
            'tidal <- startTidal (superdirtTarget {oLatency = 0.1, oAddress = "127.0.0.1", oPort = 57120}) (defaultConfig {cFrameTimespan = 1/20})',
            'let p = streamReplace tidal',
            'let hush = streamHush tidal',
            'let list = streamList tidal',
            'let mute = streamMute tidal',
            'let unmute = streamUnmute tidal',
            'let solo = streamSolo tidal',
            'let unsolo = streamUnsolo tidal',
            'let once = streamOnce tidal False',
            'let asap = streamOnce tidal True',
            'let nudgeAll = streamNudgeAll tidal',
            'let setcps = asap . cps',
            'let xfade = transition tidal (Sound.Tidal.Transition.xfadeIn 4)',
            'let xfadeIn t = transition tidal (Sound.Tidal.Transition.xfadeIn t)',
            'let histpan t = transition tidal (Sound.Tidal.Transition.histpan t)',
            'let wait t = transition tidal (Sound.Tidal.Transition.wait t)',
            'let waitT f t = transition tidal (Sound.Tidal.Transition.waitT f t)',
            'let jump = transition tidal (Sound.Tidal.Transition.jump)',
            'let jumpIn t = transition tidal (Sound.Tidal.Transition.jumpIn t)',
            'let jumpIn\' t = transition tidal (Sound.Tidal.Transition.jumpIn\' t)',
            'let jumpMod t = transition tidal (Sound.Tidal.Transition.jumpMod t)',
            'let mortal lifespan release = transition tidal (Sound.Tidal.Transition.mortal lifespan release)',
            'let interpolate = transition tidal (Sound.Tidal.Transition.interpolate)',
            'let interpolateIn t = transition tidal (Sound.Tidal.Transition.interpolateIn t)',
            'let clutch = transition tidal (Sound.Tidal.Transition.clutch)',
            'let clutchIn t = transition tidal (Sound.Tidal.Transition.clutchIn t)',
            'let anticipate = transition tidal (Sound.Tidal.Transition.anticipate)',
            'let anticipateIn t = transition tidal (Sound.Tidal.Transition.anticipateIn t)',
            'let d1 = p "1"',
            'let d2 = p "2"',
            'let d3 = p "3"',
            'let d4 = p "4"',
            'let d5 = p "5"',
            'let d6 = p "6"',
            'let d7 = p "7"',
            'let d8 = p "8"',
            'let d9 = p "9"',
            'let d10 = p "10"',
            'let d11 = p "11"',
            'let d12 = p "12"',
            'let d13 = p "13"',
            'let d14 = p "14"',
            'let d15 = p "15"',
            'let d16 = p "16"',
            ':set prompt "tidal> "'
            
        ];
}