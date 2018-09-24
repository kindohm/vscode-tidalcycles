import * as vscode from 'vscode';

let Range = vscode.Range;

/**
 * Represents a single expression to be executed by Tidal.
 */
export class TidalExpression {
    public readonly expression: string;
    public readonly range: vscode.Range;

    constructor(expression: string, range: vscode.Range) {
        this.expression = expression;
        this.range = range;
    }
}

/**
 * Represents a document of Tidal commands.
 */
export class TidalEditor {

    private editor: vscode.TextEditor;

    constructor(editor: vscode.TextEditor) {
        this.editor = editor;
    }

    private getStartLineNumber(document: vscode.TextDocument, currentLineNumber: number): number {
        while (document.lineAt(currentLineNumber).text.trim().length > 0) {
            currentLineNumber--;
        }
        return currentLineNumber;
    }

    private getEndLineNumber(document: vscode.TextDocument, currentLineNumber: number): number {
        while (document.lineAt(currentLineNumber).text.trim().length > 0) {
            currentLineNumber--;
        }
        return currentLineNumber;
    }

    public getTidalExpressionUnderCursor(getMultiline: boolean): TidalExpression | null {
        let range;

        const document = this.editor.document;
        const position = this.editor.selection.active;

        const line = document.lineAt(position);

        // If there is no expression
        if (line.text.trim().length === 0) { return null; }

        // If there is a single-line expression
        if (!getMultiline) {
            range = new Range(line.lineNumber, 0, line.lineNumber, line.text.length);
            return new TidalExpression(line.text, range);
        }

        // If there is a multi-line expression
        const startLineNumber = this.getStartLineNumber(document, line.lineNumber);
        const endLineNumber = this.getEndLineNumber(document, line.lineNumber);
        const endCol = document.lineAt(endLineNumber).text.length;

        range = new Range(startLineNumber, 0, endLineNumber, endCol);

        return new TidalExpression(document.getText(range), range);
    }    
}