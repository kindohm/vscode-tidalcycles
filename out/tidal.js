'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const repl = require("./repl");
function activate(context) {
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
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=tidal.js.map