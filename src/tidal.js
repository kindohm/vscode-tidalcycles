var vscode = require('vscode');
var repl = require('./repl');

function activate(context) {
    var evalSingle = vscode.commands.registerCommand('tidal.eval', function() {
        repl.eval(false);
    });

    var evalMulti = vscode.commands.registerCommand('tidal.evalMulti', function() {
        repl.eval(true);
    });

    var hush = vscode.commands.registerCommand('tidal.hush', function() {
        repl.hush();
    });

    context.subscriptions.push(evalSingle, evalMulti, hush);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;