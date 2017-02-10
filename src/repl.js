var vscode = require('vscode');
var Selection = vscode.Selection;
var procspawn = require('child_process').spawn;
var Range = vscode.Range;
var expression = require('./expression');
var config = require('./config');

var repl, postWindow, postWindowPane, postUri, postEditor;

function init(postWindowProvider) {
    postWindowPane = postWindowProvider;
    postUri = vscode.Uri.parse('tidalcycles://authority/tidalcycles');

    vscode.workspace.onDidChangeTextDocument(function(evt) {
        var doc = evt.document;
        if (postEditor && doc.uri.scheme == "tidalcycles") {
            var lastLine = doc.lineAt(doc.lineCount - 1);
            var range = new Range(lastLine.lineNumber, lastLine.text.length - 1, lastLine.lineNumber, lastLine.text.length - 1);
            postEditor.revealRange(range);
        }
    });
}

function getEditor() {
    return vscode.window.activeTextEditor;
}

// function getGhciPath() {
//     var ghciPath = vscode.workspace.getConfiguration('tidalcycles').get('ghciPath');
//     return ghciPath || 'ghci';
// }

function start() {
    ensurePostWindow();
    doSpawn();
    bootTidal();
}

function ensurePostWindow() {
    if (!postWindow) {
        postWindow = vscode.window.createOutputChannel('tidalcycles');
        postWindow.show(true);
    }

    var editors = vscode.window.visibleTextEditors;
    var needToShowPostWindow = true;
    for (var i = 0; i < editors.length; i++) {
        var doc = editors[i].document;
        if (doc.uri.scheme == 'tidalcycles') needToShowPostWindow = false;
    }

    if (needToShowPostWindow) {
        vscode.workspace.openTextDocument(postUri)
            .then(function(doc) {
                return vscode.window.showTextDocument(doc, vscode.ViewColumn.Two, true);
            }).then(function(editor) {
                postEditor = editor;
            });
    }
}

function doSpawn() {

    repl = procspawn(config.ghciPath(), ['-XOverloadedStrings']);
    repl.stderr.on('data', (data) => {
        console.error(data.toString('utf8'));
        post(data.toString('utf8'));
    });
    repl.stdout.on('data', (data) => post(data.toString('utf8')));
}

function editorIsTidal() {
    var editor = getEditor();
    var fileName = editor.document.fileName;
    var result = fileName.endsWith('.tidal');
    return result;
}

function eval(isMultiline) {
    if (!editorIsTidal()) return;
    if (!repl) start();

    var block = expression.getBlock(isMultiline);
    tidalSendExpression(block.expression);
    feedback(block.range);
}

function feedback(range) {

    // var feedbackColor = vscode.workspace.getConfiguration('tidalcycles').get('feedbackColor');
    // feedbackColor = feedbackColor || 'rgba(100,250,100,0.25)';

    var flashDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: config.feedbackColor()
    });

    getEditor().setDecorations(flashDecorationType, [range]);
    setTimeout(function() {
        flashDecorationType.dispose();
    }, 250);
}

function tidalSendExpression(expression) {
    tidalSendLine(':{');
    var splits = expression.split('\n');
    for (var i = 0; i < splits.length; i++) {
        tidalSendLine(splits[i]);
    }
    tidalSendLine(':}');
}

function stdinWrite(command) {
    repl.stdin.write(command);
}

function tidalSendLine(command) {
    stdinWrite(command);
    stdinWrite('\n');
}

function log(message) {
    postWindow.append(`${message}\n`);
}

function post(message) {
    ensurePostWindow();
    postWindow.append(`${message} `);
    postWindowPane.update(postUri, message);
}

function bootTidal() {

    // use a custom boot file if the user has specified it.
    // NOTE: if the custom boot file does not exist, Tidal will
    // not get booted. Unsure of a way to check if the file exists first
    // before opening. openTextDocument() does not return an error. not
    // sure how to cleanly check for this.
    var bootTidalPath = config.bootTidalPath();

    if (bootTidalPath) {
        var uri = vscode.Uri.parse('file:///' + bootTidalPath);
        vscode.workspace.openTextDocument(uri)
            .then(doc => {
                // only gets called if file was found.
                var commands = doc.getText().split('\n');
                for (var i = 0; i < commands.length; i++) {
                    tidalSendLine(commands[i]);
                }
            });
        return;
    }

    bootDefault();
}

function bootDefault() {
    tidalSendLine(':set prompt ""');
    tidalSendLine(':module Sound.Tidal.Context');

    tidalSendLine('(cps, getNow) <- bpsUtils');

    tidalSendLine('(c1,ct1) <- dirtSetters getNow');
    tidalSendLine('(c2,ct2) <- dirtSetters getNow');
    tidalSendLine('(c3,ct3) <- dirtSetters getNow');
    tidalSendLine('(c4,ct4) <- dirtSetters getNow');
    tidalSendLine('(c5,ct5) <- dirtSetters getNow');
    tidalSendLine('(c6,ct6) <- dirtSetters getNow');
    tidalSendLine('(c7,ct7) <- dirtSetters getNow');
    tidalSendLine('(c8,ct8) <- dirtSetters getNow');
    tidalSendLine('(c9,ct9) <- dirtSetters getNow');

    tidalSendLine('(d1,t1) <- superDirtSetters getNow');
    tidalSendLine('(d2,t2) <- superDirtSetters getNow');
    tidalSendLine('(d3,t3) <- superDirtSetters getNow');
    tidalSendLine('(d4,t4) <- superDirtSetters getNow');
    tidalSendLine('(d5,t5) <- superDirtSetters getNow');
    tidalSendLine('(d6,t6) <- superDirtSetters getNow');
    tidalSendLine('(d7,t7) <- superDirtSetters getNow');
    tidalSendLine('(d8,t8) <- superDirtSetters getNow');
    tidalSendLine('(d9,t9) <- superDirtSetters getNow');

    tidalSendLine('let bps x = cps (x/2)');
    tidalSendLine('let hush = mapM_ ($ silence) [d1,d2,d3,d4,d5,d6,d7,d8,d9,c1,c2,c3,c4,c5,c6,c7,c8,c9]');
    tidalSendLine('let solo = (>>) hush');

    tidalSendLine(':set prompt "tidal> "');
}

exports.eval = eval;
exports.init = init;