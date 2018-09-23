import * as vscode from 'vscode';
import { Repl } from './repl';
import { Logger } from './logging';
import { Config } from './config';
import { Ghci } from './ghci';
import { Tidal } from './tidal';

export function activate(context: any) {

    let logger = new Logger(vscode.window.createOutputChannel('TidalCycles'));
    let config = new Config();
    let ghci = new Ghci(logger, config);
    // let ghci = new FakeGhci(logger);
    let tidal = new Tidal(logger, config, ghci);
    let repl: Repl = new Repl(logger, config, ghci, tidal);

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