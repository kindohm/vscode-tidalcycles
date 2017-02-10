var vscode = require('vscode');
var Range = vscode.Range;

function getEditor() {
    return vscode.window.activeTextEditor;
}

function getStartLineNumber(doc, currentLineNumber) {
    if (currentLineNumber === 0) return currentLineNumber;
    var line = doc.lineAt(currentLineNumber - 1);
    if (line.text.trim().length === 0) return currentLineNumber;
    return getStartLineNumber(doc, currentLineNumber - 1);
}

function getEndLineNumber(doc, currentLineNumber) {
    if (currentLineNumber + 1 == doc.lineCount) return currentLineNumber;
    var line = doc.lineAt(currentLineNumber + 1);
    if (line.text.trim().length == 0) return currentLineNumber;
    return getEndLineNumber(doc, currentLineNumber + 1);
}

function getBlock(getMultiline) {
    var range;
    var editor = getEditor();
    var doc = editor.document;
    var position = editor.selection.active;

    var line = doc.lineAt(position);
    if (line.text.trim().length == 0) return '';

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

exports.getBlock = getBlock;