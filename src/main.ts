import { TextEditor, ExtensionContext, window, commands } from 'vscode';
import { Repl } from './repl';
import { Logger } from './logging';
import { Config } from './config';
import { Ghci } from './ghci';
import { Tidal } from './tidal';
import { History } from './history';


export function activate(context: ExtensionContext) {

    const logger = new Logger(window.createOutputChannel('TidalCycles'));
    const config = new Config();
    const ghci = new Ghci(logger, config.useStackGhci(), config.ghciPath(), config.showGhciOutput());
    const tidal = new Tidal(logger, ghci, config.bootTidalPath(), config.useBootFileInCurrentDirectory());
    const history = new History(logger, config);

    function getRepl(repls: Map<TextEditor, Repl>, textEditor: TextEditor | undefined): Repl | undefined {
        if (textEditor === undefined) { return undefined; }
        if (!repls.has(textEditor)) {
            repls.set(textEditor,
                new Repl(tidal, textEditor, history, config, window.createTextEditorDecorationType));
        }
        return repls.get(textEditor);
    }

    const repls = new Map<TextEditor, Repl>();

    if (config.showGhciOutput()) {
        ghci.stdout.on('data', (data: any) => {
            logger.log(`${data}`, false);
        });
    }
    ghci.stderr.on('data', (data: any) => {
        logger.warning(`GHCi | ${data}`);
    });

    const evalSingleCommand = commands.registerCommand('tidal.eval', function () {
        const repl = getRepl(repls, window.activeTextEditor);
        if (repl !== undefined) {
            repl.evaluate(false);
        }
    });

    const evalMultiCommand = commands.registerCommand('tidal.evalMulti', function () {
        const repl = getRepl(repls, window.activeTextEditor);
        if (repl !== undefined) {
            repl.evaluate(true);
        }
    });

    const hushCommand = commands.registerCommand('tidal.hush', function () {
        const repl = getRepl(repls, window.activeTextEditor);
        if (repl !== undefined) {
            repl.hush();
        }
    });

    context.subscriptions.push(evalSingleCommand, evalMultiCommand, hushCommand);
}

export function deactivate() { }