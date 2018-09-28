import { Logger } from '../src/logging';
import * as TypeMoq from "typemoq";
import { OutputChannel } from 'vscode';

suite("Logger", () => {
    test("Logger posts log message to channel", () => {
        let mockChannel = TypeMoq.Mock.ofType<OutputChannel>();
        mockChannel.setup(c => c.appendLine(TypeMoq.It.isAnyString())).verifiable(TypeMoq.Times.once());

        let logger = new Logger(mockChannel.object);
        logger.log("Test message");

        mockChannel.verifyAll();
    });
});