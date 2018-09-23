import * as vscode from 'vscode';

let Range = vscode.Range;

function getStartLineNumber(doc: any, currentLineNumber: any): any {
    if (currentLineNumber === 0) { return currentLineNumber; }
    const line = doc.lineAt(currentLineNumber - 1);
    if (line.text.trim().length === 0) { return currentLineNumber; }
    return getStartLineNumber(doc, currentLineNumber - 1);
}

function getEndLineNumber(doc: any, currentLineNumber: any): any {
    if (currentLineNumber + 1 === doc.lineCount) { return currentLineNumber; }
    const line = doc.lineAt(currentLineNumber + 1);
    if (line.text.trim().length === 0) { return currentLineNumber; }
    return getEndLineNumber(doc, currentLineNumber + 1);
}

export function getBlock(getMultiline: any): { expression: string, range: vscode.Range } | null {
    let range;
    const editor = vscode.window.activeTextEditor;

    if (editor === undefined) {
        return null;
    }

    const doc = editor.document;
    const position = editor.selection.active;

    const line = doc.lineAt(position);
    if (line.text.trim().length === 0) { return null; }

    if (!getMultiline) {
        range = new Range(line.lineNumber, 0, line.lineNumber, line.text.length);
        return { expression: line.text, range: range };
    }

    const startLineNumber = getStartLineNumber(doc, line.lineNumber);
    const endLineNumber = getEndLineNumber(doc, line.lineNumber);
    const endCol = doc.lineAt(endLineNumber).text.length;

    range = new Range(startLineNumber, 0, endLineNumber, endCol);
    const expression = doc.getText(range);

    return { expression: expression, range: range };
}