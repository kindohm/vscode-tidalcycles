var vscode = require('vscode');
var repl = require('./repl');
var PostWindowContentProvider = require('./postWindow').PostWindowContentProvider;

function activate(context) {
    var registration;
    var postWindowProvider = new PostWindowContentProvider();
    registration = vscode.workspace.registerTextDocumentContentProvider('tidalcycles', postWindowProvider);

    repl.init(postWindowProvider);

    var evalSingle = vscode.commands.registerCommand('tidal.eval', function() {
        repl.eval(false);
    });

    var evalMulti = vscode.commands.registerCommand('tidal.evalMulti', function() {
        repl.eval(true);
    });

    context.subscriptions.push(evalSingle, evalMulti, registration);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;