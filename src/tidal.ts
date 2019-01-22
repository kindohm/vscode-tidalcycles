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
            'let xfade i = transition tidal (Sound.Tidal.Transition.xfadeIn 4) i',
            'let xfadeIn i t = transition tidal (Sound.Tidal.Transition.xfadeIn t) i',
            'let histpan i t = transition tidal (Sound.Tidal.Transition.histpan t) i',
            'let wait i t = transition tidal (Sound.Tidal.Transition.wait t) i',
            'let waitT i f t = transition tidal (Sound.Tidal.Transition.waitT f t) i',
            'let jump i = transition tidal (Sound.Tidal.Transition.jump) i',
            'let jumpIn i t = transition tidal (Sound.Tidal.Transition.jumpIn t) i',
            'let jumpIn\' i t = transition tidal (Sound.Tidal.Transition.jumpIn\' t) i',
            'let jumpMod i t = transition tidal (Sound.Tidal.Transition.jumpMod t) i',
            'let mortal i lifespan release = transition tidal (Sound.Tidal.Transition.mortal lifespan release) i',
            'let interpolate i = transition tidal (Sound.Tidal.Transition.interpolate) i',
            'let interpolateIn i t = transition tidal (Sound.Tidal.Transition.interpolateIn t) i',
            'let clutch i = transition tidal (Sound.Tidal.Transition.clutch) i',
            'let clutchIn i t = transition tidal (Sound.Tidal.Transition.clutchIn t) i',
            'let anticipate i = transition tidal (Sound.Tidal.Transition.anticipate) i',
            'let anticipateIn i t = transition tidal (Sound.Tidal.Transition.anticipateIn t) i',
            'let d1 = p 1',
            'let d2 = p 2',
            'let d3 = p 3',
            'let d4 = p 4',
            'let d5 = p 5',
            'let d6 = p 6',
            'let d7 = p 7',
            'let d8 = p 8',
            'let d9 = p 9',
            'let d10 = p 10',
            'let d11 = p 11',
            'let d12 = p 12',
            'let d13 = p 13',
            'let d14 = p 14',
            'let d15 = p 15',
            'let d16 = p 16',
            ':set prompt "tidal> "'        ];
}