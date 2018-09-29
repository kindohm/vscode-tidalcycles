import { Position, Selection } from 'vscode';
import * as TypeMoq from 'typemoq';
import { createMockDocument, createMockEditor } from './mock';
import { Repl } from '../src/repl';
import { ILogger } from '../src/logging';
import { ITidal } from '../src/tidal';
import { IHistory } from '../src/history';


suite('Repl', () => {
    test('Hush executed in .tidal file', () => {
        let mockLogger = TypeMoq.Mock.ofType<ILogger>();
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockDocument = createMockDocument(['Hello world']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(0, 0), new Position(0, 0)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.tidal');

        let repl = new Repl(mockLogger.object, mockTidal.object, 
            mockEditor.object, mockHistory.object, 'rgba(100,250,100,0.3)');

        repl.hush();

        mockTidal.verify(t => t.sendTidalExpression('hush'), TypeMoq.Times.once());

        mockTidal.verifyAll();
    });

    test('Hush not executed in non-.tidal file', () => {
        let mockLogger = TypeMoq.Mock.ofType<ILogger>();
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockDocument = createMockDocument(['Hello world']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(0, 0), new Position(0, 0)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.ideal');

        let repl = new Repl(mockLogger.object, mockTidal.object, 
            mockEditor.object, mockHistory.object, 'rgba(100,250,100,0.3)');

        repl.hush();

        mockTidal.verify(t => t.sendTidalExpression(TypeMoq.It.isAnyString()), TypeMoq.Times.never());

        mockTidal.verifyAll();
    });

    test('Expression not evaluated in non-.tidal file', () => {
        let mockLogger = TypeMoq.Mock.ofType<ILogger>();
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockDocument = createMockDocument(['Foo', 'bar', '', 'baz']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(1, 0), new Position(1, 2)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.ideal');

        let repl = new Repl(mockLogger.object, mockTidal.object, 
            mockEditor.object, mockHistory.object, 'rgba(100,250,100,0.3)');

        repl.evaluate(false);

        mockTidal.verify(t => t.sendTidalExpression(TypeMoq.It.isAnyString()), TypeMoq.Times.never());

        mockTidal.verifyAll();
    });

    test('Multi-line expression evaluated in .tidal file', () => {
        let mockLogger = TypeMoq.Mock.ofType<ILogger>();
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockDocument = createMockDocument(['Foo', 'bar', '', 'baz']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(1, 0), new Position(1, 2)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.tidal');

        let repl = new Repl(mockLogger.object, mockTidal.object, 
            mockEditor.object, mockHistory.object, 'rgba(100,250,100,0.3)');

        repl.evaluate(true);

        mockTidal.verify(t => t.sendTidalExpression('Foo\r\nbar'), TypeMoq.Times.once());

        mockTidal.verifyAll();
    });

    test('Single-line expression evaluated in .tidal file', () => {
        let mockLogger = TypeMoq.Mock.ofType<ILogger>();
        let mockTidal = TypeMoq.Mock.ofType<ITidal>();
        let mockDocument = createMockDocument(['Foo', 'bar', '', 'baz']);
        let mockEditor = createMockEditor(mockDocument.object, new Selection(new Position(1, 0), new Position(1, 2)));
        let mockHistory = TypeMoq.Mock.ofType<IHistory>();

        mockDocument.setup(d => d.fileName).returns(() => 'myfile.tidal');

        let repl = new Repl(mockLogger.object, mockTidal.object, 
            mockEditor.object, mockHistory.object, 'rgba(100,250,100,0.3)');

        repl.evaluate(false);

        mockTidal.verify(t => t.sendTidalExpression('bar'), TypeMoq.Times.once());

        mockTidal.verifyAll();
    });
});
