import { TextEditor, TextLine, Range, Position, TextDocument, Selection } from 'vscode';
import * as TypeMoq from 'typemoq';
import { expect, assert } from 'chai';
import { TidalEditor } from '../src/editor';

class TestTextLine implements TextLine {
    lineNumber: number;
    text: string;
    range: Range;
    rangeIncludingLineBreak: Range;
    firstNonWhitespaceCharacterIndex: number;
    isEmptyOrWhitespace: boolean;

    constructor(lineNumber: number, text: string) {
        this.lineNumber = lineNumber;
        this.text = text;
        this.range = new Range(new Position(0, 0), new Position(0, text.length));
        this.rangeIncludingLineBreak = new Range(new Position(0, 0), new Position(0, text.length + 2));
        this.firstNonWhitespaceCharacterIndex = text.search('[^\s]');
        this.isEmptyOrWhitespace = text.trim().length === 0;
    }
}

function createMockDocument(lines: string[]): TypeMoq.IMock<TextDocument> {
    let mockDocument = TypeMoq.Mock.ofType<TextDocument>();
    lines.forEach((line, index) => {
        mockDocument.setup(d => d.lineAt(new Position(index, 0)))
            .returns(() => new TestTextLine(index, line));
        mockDocument.setup(d => d.lineAt(index))
            .returns(() => new TestTextLine(index, line));
    });
    mockDocument.setup(d => d.lineCount).returns(() => lines.length);

    mockDocument
        .setup(d => d.getText(TypeMoq.It.isAny()))
        .returns((r: Range) => {
            let result = "";
            for (let line = r.start.line; line <= r.end.line; line++) {
                if (line === r.start.line) {
                    result += mockDocument.object.lineAt(line).text.substring(r.start.character);
                    result += "\r\n";
                } else if (line < r.end.line) {
                    result += mockDocument.object.lineAt(line);
                    result += "\r\n";
                } else {
                    result += mockDocument.object.lineAt(line).text.substring(0, r.end.character);
                }
            }
            return result;
        });

    return mockDocument;
}

function createMockEditor(document: TextDocument, selection: Selection): TypeMoq.IMock<TextEditor> {
    let mockEditor = TypeMoq.Mock.ofType<TextEditor>();
    mockEditor.setup(e => e.document).returns(() => document);
    mockEditor.setup(e => e.selection).returns(() => selection);
    return mockEditor;
}

suite("Editor", () => {
    test("Single-line expression retrieved", () => {
        let mockDocument = createMockDocument(["Hello world"]);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(0, 0), new Position(0, 0)));

        let tidalEditor = new TidalEditor(mockEditor.object);
        let expression = tidalEditor.getTidalExpressionUnderCursor(false);

        assert.isNotNull(expression);
        if (expression !== null) {
            expect(expression.expression).to.be.equal("Hello world");
        }
    });

    test("Single-line expression between blank lines retrieved", () => {
        let mockDocument = createMockDocument(["", "Hello world", ""]);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(1, 0), new Position(1, 0)));

        let tidalEditor = new TidalEditor(mockEditor.object);
        let expression = tidalEditor.getTidalExpressionUnderCursor(false);

        assert.isNotNull(expression);
        if (expression !== null) {
            expect(expression.expression).to.be.equal("Hello world");
        }
    });

    test("Blank line becomes null expression", () => {
        let mockDocument = createMockDocument(["", "Hello world", ""]);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(0, 0), new Position(0, 0)));

        let tidalEditor = new TidalEditor(mockEditor.object);
        let expression = tidalEditor.getTidalExpressionUnderCursor(false);

        assert.isNull(expression);
    });

    test("Multi-line expression retrieved", () => {
        let mockDocument = createMockDocument(["", "one", "two", " ", "three"]);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(1, 0), new Position(1, 0)));

        let tidalEditor = new TidalEditor(mockEditor.object);
        let expression = tidalEditor.getTidalExpressionUnderCursor(true);

        assert.isNotNull(expression);
        if (expression !== null) {
            expect(expression.expression).to.be.equal("one\r\ntwo");
        }
    });

    test("Multi-line expression from split selection", () => {
        let mockDocument = createMockDocument(["", "one", "two", " ", "three"]);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(1, 0), new Position(4, 5)));

        let tidalEditor = new TidalEditor(mockEditor.object);
        let expression = tidalEditor.getTidalExpressionUnderCursor(true);

        assert.isNotNull(expression);
        if (expression !== null) {
            expect(expression.expression).to.be.equal("one\r\ntwo");
        }
    });

    test("Multi-line expression retrieved before selection", () => {
        let mockDocument = createMockDocument(["", "one", "two", " ", "three"]);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(2, 0), new Position(4, 2)));

        let tidalEditor = new TidalEditor(mockEditor.object);
        let expression = tidalEditor.getTidalExpressionUnderCursor(true);

        assert.isNotNull(expression);
        if (expression !== null) {
            expect(expression.expression).to.be.equal("one\r\ntwo");
        }
    });

    test("Multi-line expression becomes null from blank line", () => {
        let mockDocument = createMockDocument(["", "one", "two", " ", "three"]);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(3, 0), new Position(3, 0)));

        let tidalEditor = new TidalEditor(mockEditor.object);
        let expression = tidalEditor.getTidalExpressionUnderCursor(true);

        assert.isNull(expression);
    });
});
