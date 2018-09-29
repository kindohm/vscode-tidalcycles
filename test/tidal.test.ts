import { Ghci } from '../src/ghci';
import { Tidal } from '../src/tidal';
import { Logger } from '../src/logging';
import * as TypeMoq from "typemoq";

suite("Tidal", () => {
    test("Single line sent to Tidal is passed to GHCi", () => {
        let mockedLogger = TypeMoq.Mock.ofType<Logger>();
        let mockedGhci = TypeMoq.Mock.ofType<Ghci>();
        let tidal: Tidal = new Tidal(mockedLogger.object, mockedGhci.object, null, false);
        tidal.tidalBooted = true;

        mockedGhci.setup(ghci => ghci.writeLn(':{')).verifiable(TypeMoq.Times.once());
        mockedGhci.setup(ghci => ghci.writeLn('d1 $ sound "bd"')).verifiable(TypeMoq.Times.once());
        mockedGhci.setup(ghci => ghci.writeLn(':}')).verifiable(TypeMoq.Times.once());

        return tidal.sendTidalExpression('d1 $ sound "bd"').then(() => {
            mockedGhci.verifyAll();
        });
    });

    test("Multiple lines sent to Tidal are passed to GHCi", () => {
        let mockedLogger = TypeMoq.Mock.ofType<Logger>();
        let mockedGhci = TypeMoq.Mock.ofType<Ghci>();
        let tidal: Tidal = new Tidal(mockedLogger.object, mockedGhci.object, null, false);
        tidal.tidalBooted = true;

        mockedGhci.setup(ghci => ghci.writeLn(':{')).verifiable(TypeMoq.Times.once());
        mockedGhci.setup(ghci => ghci.writeLn('d1 $')).verifiable(TypeMoq.Times.once());
        mockedGhci.setup(ghci => ghci.writeLn('sound "bd"')).verifiable(TypeMoq.Times.once());
        mockedGhci.setup(ghci => ghci.writeLn(':}')).verifiable(TypeMoq.Times.once());

        return tidal.sendTidalExpression('d1 $\r\nsound "bd"').then(() => {
            mockedGhci.verifyAll();
        });
    });
});