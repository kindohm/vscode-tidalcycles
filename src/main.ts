import * as vscode from 'vscode';
import { Repl } from './repl';
import { Logger } from './logging';
import { Config } from './config';
import { Ghci } from './ghci';
import { Tidal } from './tidal';

export function activate(context: vscode.ExtensionContext) {

    const logger = new Logger(vscode.window.createOutputChannel('TidalCycles'));
    const config = new Config();
    const ghci = new Ghci(logger, config.useStackGhci(), config.ghciPath());
    const tidal = new Tidal(logger, ghci, config.bootTidalPath(), config.useBootFileInCurrentDirectory());
    const repl = new Repl(logger, tidal, config.showEvalCount(), config.feedbackColor());

    if (config.showGhciOutput()) {
        ghci.stdout.on('data', (data: any) => {
            logger.log(data);
        });
    }
    ghci.stderr.on('data', (data: any) => {
        logger.warning(`GHCi | ${data}`);
    });

    const evalSingle = vscode.commands.registerCommand('tidal.eval', function () {
        repl.evaluate(false);
    });

    const evalMulti = vscode.commands.registerCommand('tidal.evalMulti', function () {
        repl.evaluate(true);
    });

    const hush = vscode.commands.registerCommand('tidal.hush', function () {
        repl.hush();
    });

    context.subscriptions.push(evalSingle, evalMulti, hush);
}

export function deactivate() { }