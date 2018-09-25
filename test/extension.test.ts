import { expect, assert } from 'chai';
import 'mocha';
import * as TypeMoq from "typemoq";
import { Logger } from '../src/logging';
import { Ghci } from '../src/ghci';
import { Config } from '../src/config';
import { Tidal } from '../src/tidal';
import { OutputChannel, TextEditor, TextLine, Range, Position, TextDocument, Selection } from 'vscode';
import { TidalEditor } from '../src/editor';

suite("Tidal", () => {
    test("Single line sent to tidal is passed to GHCi", () => {
        let mockedLogger = TypeMoq.Mock.ofType<Logger>();
        let mockedConfig = TypeMoq.Mock.ofType<Config>();
        let mockedGhci = TypeMoq.Mock.ofType<Ghci>();
        let tidal: Tidal = new Tidal(mockedLogger.object, mockedConfig.object, mockedGhci.object);
        tidal.tidalBooted = true;

        mockedGhci.setup(ghci => ghci.writeLn(':{')).verifiable(TypeMoq.Times.once());
        mockedGhci.setup(ghci => ghci.writeLn('d1 $ sound "bd"')).verifiable(TypeMoq.Times.once());
        mockedGhci.setup(ghci => ghci.writeLn(':}')).verifiable(TypeMoq.Times.once());

        return tidal.sendTidalExpression('d1 $ sound "bd"').then(() => {
            mockedGhci.verifyAll();
        });
    });
});

suite("Logger", () => {
    test("Logger posts log message to channel", () => {
        let mockChannel = TypeMoq.Mock.ofType<OutputChannel>();
        mockChannel.setup(c => c.appendLine(TypeMoq.It.isAnyString())).verifiable(TypeMoq.Times.once());

        let logger = new Logger(mockChannel.object);
        logger.log("Test message");

        mockChannel.verifyAll();
    });
});

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
});

