import * as vscode from 'vscode';
import { Repl } from './repl';
import { Logger } from './logging';
import { Config } from './config';
import { Ghci } from './ghci';
import { Tidal } from './tidal';

export function activate(context: any) {

    const logger = new Logger(vscode.window.createOutputChannel('TidalCycles'));
    const config = new Config();
    const ghci = new Ghci(logger, config);
    const tidal = new Tidal(logger, config, ghci);
    const repl = new Repl(logger, config, ghci, tidal);

    var evalSingle = vscode.commands.registerCommand('tidal.eval', function () {
        repl.evaluate(false);
    });

    var evalMulti = vscode.commands.registerCommand('tidal.evalMulti', function () {
        repl.evaluate(true);
    });

    var hush = vscode.commands.registerCommand('tidal.hush', function () {
        repl.hush();
    });

    context.subscriptions.push(evalSingle, evalMulti, hush);
}

export function deactivate() { }