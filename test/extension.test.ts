//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import { expect } from 'chai';
import 'mocha';
import * as TypeMoq from "typemoq";
import { Logger } from '../src/logging';
import { Ghci } from '../src/ghci';
import { Config } from '../src/config';
import { Tidal } from '../src/tidal';
import { OutputChannel } from 'vscode';

suite("Tidal", () => {
    test("Send single line to Tidal", () => {
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
    test("Log message", () => {
        let mockChannel = TypeMoq.Mock.ofType<OutputChannel>();
        mockChannel.setup(c => c.appendLine(TypeMoq.It.isAnyString())).verifiable(TypeMoq.Times.once());
        
        let logger = new Logger(mockChannel.object);
        logger.log("Test message");

        mockChannel.verifyAll();
    });
});

// suite("Editor", () => {
//     test("Get single line");
// });