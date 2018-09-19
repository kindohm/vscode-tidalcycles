'use strict';
import * as vscode from 'vscode';
import * as repl from './repl';

export function activate(context: any) {
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