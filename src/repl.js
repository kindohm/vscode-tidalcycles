const vscode = require('vscode');
const Selection = vscode.Selection;
const procspawn = require('child_process').spawn;
const Range = vscode.Range;
const expression = require('./expression');
const config = require('./config');
const postUriScheme = "tidalcycles";

let repl, postChannel;

function getEditor() {
    return vscode.window.activeTextEditor;
}

function ensureStart() {

    if (repl) return Promise.resolve();

    return ensurePostWindows()
        .then(doSpawn)
        .then(bootTidal);
}

function ensurePostWindows() {
    return ensurePostChannel();
}

function ensurePostChannel() {
    return new Promise(function (resolve, reject) {
        if (!postChannel && config.showOutputInConsoleChannel()) {
            postChannel = vscode.window.createOutputChannel(postUriScheme);
            postChannel.show(true);
        }
        resolve();
    });
}

function doSpawn() {
    return new Promise((resolve, reject) => {
        repl = procspawn(config.ghciPath(), ['-XOverloadedStrings']);
        repl.stderr.on('data', (data) => {
            const msg = data.toString('utf8');
            console.error(msg);
            post(msg);
        });
        repl.stdout.on('data', (data) => post(data.toString('utf8')));
        resolve();
    });
}

function editorIsTidal() {
    const editor = getEditor();
    const fileName = editor.document.fileName;
    const result = fileName.endsWith('.tidal');
    return result;
}

function hush() {
    if (!editorIsTidal()) return Promise.resolve();
    return ensureStart()
        .then(() => {
            tidalSendExpression('hush');
            post('hush');
        });
}

function eval(isMultiline) {
    if (!editorIsTidal()) return Promise.resolve();

    return ensureStart()
        .then(() => {
            const block = expression.getBlock(isMultiline);
            tidalSendExpression(block.expression);
            feedback(block.range);
        });
}

function feedback(range) {

    const flashDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: config.feedbackColor()
    });

    getEditor().setDecorations(flashDecorationType, [range]);
    setTimeout(function () {
        flashDecorationType.dispose();
    }, 250);
}

function tidalSendExpression(expression) {
    tidalSendLine(':{');
    const splits = expression.split('\n');
    for (let i = 0; i < splits.length; i++) {
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
    postChannel.append(`${message}\n`);
}

function post(message) {
    if (postChannel) {
        postChannel.append(`${message} `);
    }
}

function bootTidal() {
    return new Promise((resolve, reject) => {

        // use a custom boot file if the user has specified it.
        // NOTE: if the custom boot file does not exist, Tidal will
        // not get booted. Unsure of a way to check if the file exists first
        // before opening. openTextDocument() does not return an error. not
        // sure how to cleanly check for this.
        var bootTidalPath = config.bootTidalPath();

        if (bootTidalPath) {
            const uri = vscode.Uri.parse('file:///' + bootTidalPath);
            return vscode.workspace.openTextDocument(uri)
                .then(doc => {
                    // only gets called if file was found.
                    const commands = doc.getText().split('\n');
                    for (let i = 0; i < commands.length; i++) {
                        tidalSendLine(commands[i]);
                    }
                    resolve();
                });
        } else {
            bootDefault();
            resolve();
        }
    });
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

    tidalSendLine('let replicator text1 = [putStr (text1) | x <- replicate 3000 text1]');
    tidalSendLine('let flood text2 = sequence_(replicator text2)');


    tidalSendLine(':set prompt "tidal> "');
}

exports.eval = eval;
exports.hush = hush;