import { TextEditor, TextLine, Range, Position, TextDocument, Selection, TextEditorDecorationType, window, DecorationRenderOptions } from 'vscode';
import * as TypeMoq from 'typemoq';

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

export function createMockDocument(lines: string[]): TypeMoq.IMock<TextDocument> {
    let mockDocument = TypeMoq.Mock.ofType<TextDocument>();
    lines.forEach((line, index) => {
        mockDocument
            .setup(d => d.lineAt(
                TypeMoq.It.is((p: Position) => p.line === index && p.character <= line.length)))
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

export function createMockEditor(document: TextDocument, selection: Selection): TypeMoq.IMock<TextEditor> {
    let mockEditor = TypeMoq.Mock.ofType<TextEditor>();
    mockEditor.setup(e => e.document).returns(() => document);
    mockEditor.setup(e => e.selection).returns(() => selection);
    mockEditor.setup(e => e.setDecorations(TypeMoq.It.isAny(), TypeMoq.It.isAny()));
    return mockEditor;
}

export function createMockCreateTextEditorDecorationType():
    TypeMoq.IMock<(options: DecorationRenderOptions) => TextEditorDecorationType> {
    let mockTextEditorDecorationType = TypeMoq.Mock.ofType<TextEditorDecorationType>();
    mockTextEditorDecorationType.setup(d => d.dispose());
    let mockCreateTextEditorDecorationType = TypeMoq.Mock.ofInstance(window.createTextEditorDecorationType);
    mockCreateTextEditorDecorationType.setup(f => f(TypeMoq.It.isAny())).returns(() => mockTextEditorDecorationType.object);
    return mockCreateTextEditorDecorationType;
}