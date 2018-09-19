'use strict';
import * as vscode from 'vscode';
import { Repl } from './repl';
import { Logger } from './logging';
import { Config } from './config';
import { Ghci } from './ghci';

export function activate(context: any) {

    let logger = new Logger("TidalCycles");
    let config = new Config();
    let ghci = new Ghci(logger, config);
    let repl_: Repl = new Repl(logger, config, ghci);

    var evalSingle = vscode.commands.registerCommand('tidal.eval', function () {
        repl_.evaluate(false);
    });

    var evalMulti = vscode.commands.registerCommand('tidal.evalMulti', function () {
        repl_.evaluate(true);
    });

    var hush = vscode.commands.registerCommand('tidal.hush', function () {
        repl_.hush();
    });

    context.subscriptions.push(evalSingle, evalMulti, hush);
}

export function deactivate() { }