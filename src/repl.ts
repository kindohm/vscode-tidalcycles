'use strict';
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as expression from './expression';
import * as config from './config';

const postUriScheme = "tidalcycles";

let repl: any, postChannel: any, evalCount = 0, booted = false;

function getEditor() {
    return vscode.window.activeTextEditor;
}

function ensureStart() {

    // everything is booted up already.
    if (repl && booted) return Promise.resolve();

    // GHCI repl started, but Tidal was never started.
    if (repl && !booted) {
        return bootTidal()
            .catch(err => {
                post(`error: ${err.message}`);
            });
    }

    // nothing has started.
    return ensurePostWindows()
        .then(doSpawn)
        .then(bootTidal)
        .catch(err => {
            post(`error: ${err.message}`);
        });
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
        repl = cp.spawn(config.ghciPath(), ['-XOverloadedStrings']);
        repl.stderr.on('data', (data: any) => {
            const msg = data.toString('utf8');
            console.error(msg);
            post(msg);
        });
        repl.stdout.on('data', (data: any) => {
            if (config.showGhciOutput()) post(data.toString('utf8'));
        });
        resolve();
    });
}

function editorIsTidal() {
    const editor = getEditor();
    const fileName = editor.document.fileName;
    const result = fileName.endsWith('.tidal');
    return result;
}

export function hush() {
    if (!editorIsTidal()) return Promise.resolve();
    return ensureStart()
        .then(() => {
            tidalSendExpression('hush');
            post('hush');
        });
}

export function evaluate(isMultiline: any): any {
    if (!editorIsTidal()) return Promise.resolve();

    return ensureStart()
        .then(() => {
            const block = expression.getBlock(isMultiline);
            if (block) {
                tidalSendExpression(block.expression);
                feedback(block.range);
            }
            incrementEvalCount();
            showRandomMessage();
        });
}

function incrementEvalCount() {
    evalCount++;
    if (config.showEvalCount()) post(`${config.evalCountPrefix()}${evalCount} `);
}

function showRandomMessage() {
    const messages = config.randomMessages();
    if (messages.length > 0 && config.randomMessageProbability() > Math.random()) {
        post(`${messages[getRandomIntInclusive(0, messages.length - 1)]} `);
    }
}

function getRandomIntInclusive(min: any, max: any) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function feedback(range: any) {
    const flashDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: config.feedbackColor()
    });

    getEditor().setDecorations(flashDecorationType, [range]);
    setTimeout(function () {
        flashDecorationType.dispose();
    }, 250);
}

function tidalSendExpression(expression: any) {
    tidalSendLine(':{');
    const splits = expression.split('\n');
    for (let i = 0; i < splits.length; i++) {
        tidalSendLine(splits[i]);
    }
    tidalSendLine(':}');
}

function stdinWrite(command: any) {
    repl.stdin.write(command);
}

function tidalSendLine(command: any) {
    stdinWrite(command);
    stdinWrite('\n');
}

function post(message: any) {
    if (postChannel) {
        postChannel.append(`${message}`);
    }
}

function bootTidal() {
    return new Promise((resolve, reject) => {

        // Use a custom boot file if the user has specified it.
        // The promise is rejected if the file cannot be found. User can
        // re-configure their settings and retry as `booted = false` still. 

        const bootTidalPath = config.bootTidalPath();
        const useBootFileInCurrentDirectory = config.useBootFileInCurrentDirectory();
        let uri : any;

        if (useBootFileInCurrentDirectory) {
            // TODO: fix this - vscode.workspace.workspaceFolders doesn't exist
            let folders : any;
            //const folders = vscode.workspace.workspaceFolders;

            // user has configured to use a BootTidal.hs file in the current VS Code folder,
            // but there is no folder opened.
            if (!folders) {
                const message = 'You must open a folder or workspace in order to use the Tidal useBootFileInCurrentDirectory setting.';
                post(message);
                vscode.window.showErrorMessage(message)
                return reject();
            }

            if (folders && folders.length === 0) {
                const message = 'You must have at least one folder in your workspace in order to use the Tidal useBootFileInCurrentDirectory setting.';
                post(message);
                vscode.window.showErrorMessage(message)
                return reject();
            }

            const dir = folders[0].uri.fsPath;
            uri = vscode.Uri.parse(`file:///${dir}/BootTidal.hs`);
        } else if (bootTidalPath) {
            uri = vscode.Uri.parse('file:///' + bootTidalPath);
        }

        if (uri) {
            post('Using Tidal boot file on disk at ' + uri.fsPath);
            const p = vscode.workspace.openTextDocument(uri);

            return p.then((doc: any) => {
                // only gets called if file was found.
                const commands = doc.getText().split('\n');
                for (let i = 0; i < commands.length; i++) {
                    tidalSendLine(commands[i]);
                }
                booted = true;
                resolve();
            }, (reason: any) => {
                const message = `Could not open boot file located at ${uri.fsPath}. User Settings: { bootTidalPath: ${bootTidalPath}, useBootFileInCurrentDirectory: ${useBootFileInCurrentDirectory} }.`;
                post(message);
                vscode.window.showErrorMessage(message);
                reject();
            });
        }

        post('Using default Tidal package boot.');
        bootDefault();
        booted = true;
        resolve();

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