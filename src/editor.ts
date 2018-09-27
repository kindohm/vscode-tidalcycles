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

    private isEmpty(document: vscode.TextDocument, line: number): boolean {
        return document.lineAt(line).text.trim().length === 0;
    }

    /**
     * Given a document and a range, find the first line which is not blank. 
     * Returns null if there are no non-blank lines before the end of the selection.
     */
    private getFirstNonBlankLineInRange(document: vscode.TextDocument, range: vscode.Range): number | null {
        for (let currentLineNumber = range.start.line; currentLineNumber <= range.end.line; currentLineNumber++) {
            if (!this.isEmpty(document, currentLineNumber)) {
                return currentLineNumber;
            }
        }

        return null;
    }

    /**
     * Assuming that the start position of the range is inside a Tidal expression, search backwards for the first line
     * of that expression.
     */
    private getFirstExpressionLineBeforeSelection(document: vscode.TextDocument, range: vscode.Range): number | null {
        let currentLineNumber = range.start.line;

        // If current line is empty, do not attempt to search.
        if (this.isEmpty(document, currentLineNumber)) {
            return null;
        }

        while (currentLineNumber >= 0 && !this.isEmpty(document, currentLineNumber)) {
            currentLineNumber--;
        }

        return currentLineNumber + 1;
    }

    private getStartLineNumber(document: vscode.TextDocument, range: vscode.Range): number | null {
        // If current line is empty, search forward for the expression start
        if (this.isEmpty(document, range.start.line)) {
            return this.getFirstNonBlankLineInRange(document, range);
        }
        // Else, current line has contents and so Tidal expression may start on a prior line
        return this.getFirstExpressionLineBeforeSelection(document, range);
    }

    private getEndLineNumber(document: vscode.TextDocument, startLineNumber: number): number {
        let currentLineNumber = startLineNumber;
        while (currentLineNumber < document.lineCount && !this.isEmpty(document, currentLineNumber)) {
            currentLineNumber++;
        }
        return currentLineNumber - 1;
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
            // TODO: if non-zero selection, find the first line that isn't empty.
            range = new Range(line.lineNumber, 0, line.lineNumber, line.text.length);
            return new TidalExpression(line.text, range);
        }

        // If there is a multi-line expression
        const selectedRange = new vscode.Range(this.editor.selection.anchor, this.editor.selection.active);
        const startLineNumber = this.getStartLineNumber(document, selectedRange);
        if (startLineNumber === null) {
            return null;
        }

        const endLineNumber = this.getEndLineNumber(document, startLineNumber);
        const endCol = document.lineAt(endLineNumber).text.length;

        range = new Range(startLineNumber, 0, endLineNumber, endCol);

        return new TidalExpression(document.getText(range), range);
    }    
}