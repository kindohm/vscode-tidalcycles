import * as vscode from 'vscode';

let Range = vscode.Range;

function getStartLineNumber(doc: any, currentLineNumber: any): any {
    if (currentLineNumber === 0) { return currentLineNumber; }
    var line = doc.lineAt(currentLineNumber - 1);
    if (line.text.trim().length === 0) { return currentLineNumber; }
    return getStartLineNumber(doc, currentLineNumber - 1);
}

function getEndLineNumber(doc: any, currentLineNumber: any): any {
    if (currentLineNumber + 1 === doc.lineCount) { return currentLineNumber; }
    var line = doc.lineAt(currentLineNumber + 1);
    if (line.text.trim().length === 0) { return currentLineNumber; }
    return getEndLineNumber(doc, currentLineNumber + 1);
}

export function getBlock(getMultiline: any): { expression: string, range: vscode.Range } | null {
    var range;
    var editor = vscode.window.activeTextEditor;

    if (editor === undefined) {
        return null;
    }

    var doc = editor.document;
    var position = editor.selection.active;

    var line = doc.lineAt(position);
    if (line.text.trim().length === 0) { return null; }

    if (!getMultiline) {
        range = new Range(line.lineNumber, 0, line.lineNumber, line.text.length);
        return { expression: line.text, range: range };
    }

    var startLineNumber = getStartLineNumber(doc, line.lineNumber);
    var endLineNumber = getEndLineNumber(doc, line.lineNumber);
    var endCol = doc.lineAt(endLineNumber).text.length;

    range = new Range(startLineNumber, 0, endLineNumber, endCol);
    var expression = doc.getText(range);

    return { expression: expression, range: range };
}