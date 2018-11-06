import { Position, Selection } from 'vscode';
import * as TypeMoq from 'typemoq';
import { createMockDocument, createMockEditor, createMockCreateTextEditorDecorationType } from './mock';
import { Repl } from '../src/repl';
import { ITidal } from '../src/tidal';
import { IHistory } from '../src/history';
import { Config } from '../src/config';


suite('Repl', () => {
    test('Hush executed in .tidal file', async () => {
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockConfig = TypeMoq.Mock.ofType<Config>();
        let mockDocument = createMockDocument(['Hello world']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(0, 0), new Position(0, 0)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();
        let mockCreateTextEditorDecorationType = createMockCreateTextEditorDecorationType();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.tidal');

        let repl = new Repl(mockTidal.object, mockEditor.object, mockHistory.object, 
            mockConfig.object, mockCreateTextEditorDecorationType.object);
        await repl.hush();

        mockTidal.verify(t => t.sendTidalExpression('hush'), TypeMoq.Times.once());
        mockHistory.verify(h => h.log(TypeMoq.It.isAny()), TypeMoq.Times.once());
    });

    test('Hush not executed in non-.tidal file', async () => {
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockConfig = TypeMoq.Mock.ofType<Config>();
        let mockDocument = createMockDocument(['Hello world']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(0, 0), new Position(0, 0)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();
        let mockCreateTextEditorDecorationType = createMockCreateTextEditorDecorationType();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.ideal');

        let repl = new Repl(mockTidal.object, mockEditor.object, mockHistory.object, 
            mockConfig.object, mockCreateTextEditorDecorationType.object);
        await repl.hush();

        mockTidal.verify(t => t.sendTidalExpression(TypeMoq.It.isAnyString()), TypeMoq.Times.never());
        mockHistory.verify(h => h.log(TypeMoq.It.isAny()), TypeMoq.Times.never());
    });

    test('Expression not evaluated in non-.tidal file', async () => {
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockConfig = TypeMoq.Mock.ofType<Config>();
        let mockDocument = createMockDocument(['Foo', 'bar', '', 'baz']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(1, 0), new Position(1, 2)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();
        let mockCreateTextEditorDecorationType = createMockCreateTextEditorDecorationType();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.ideal');

        let repl = new Repl(mockTidal.object, mockEditor.object, mockHistory.object, 
            mockConfig.object, mockCreateTextEditorDecorationType.object);
        await repl.evaluate(false);

        mockTidal.verify(t => t.sendTidalExpression(TypeMoq.It.isAnyString()), TypeMoq.Times.never());
        mockHistory.verify(h => h.log(TypeMoq.It.isAny()), TypeMoq.Times.never());
    });

    test('Multi-line expression evaluated in .tidal file', async () => {
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockConfig = TypeMoq.Mock.ofType<Config>();
        let mockDocument = createMockDocument(['Foo', 'bar', '', 'baz']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(1, 0), new Position(1, 2)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();
        let mockCreateTextEditorDecorationType = createMockCreateTextEditorDecorationType();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.tidal');

        let repl = new Repl(mockTidal.object, mockEditor.object, mockHistory.object, 
            mockConfig.object, mockCreateTextEditorDecorationType.object);
        await repl.evaluate(true);

        mockTidal.verify(t => t.sendTidalExpression('Foo\r\nbar'), TypeMoq.Times.once());
        mockHistory.verify(h => h.log(TypeMoq.It.isAny()), TypeMoq.Times.once());
    });

    test('Single-line expression evaluated in .tidal file', async () => {
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockConfig = TypeMoq.Mock.ofType<Config>();
        let mockDocument = createMockDocument(['Foo', 'bar', '', 'baz']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(1, 0), new Position(1, 2)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();
        let mockCreateTextEditorDecorationType = createMockCreateTextEditorDecorationType();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.tidal');

        let repl = new Repl(mockTidal.object, mockEditor.object, mockHistory.object, 
            mockConfig.object, mockCreateTextEditorDecorationType.object);
        await repl.evaluate(false);

        mockTidal.verify(t => t.sendTidalExpression('bar'), TypeMoq.Times.once());
        mockHistory.verify(h => h.log(TypeMoq.It.isAny()), TypeMoq.Times.once());
    });
});
