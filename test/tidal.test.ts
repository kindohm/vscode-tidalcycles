import { Ghci } from '../src/ghci';
import { Config } from '../src/config';
import { Tidal } from '../src/tidal';
import { Logger } from '../src/logging';
import * as TypeMoq from "typemoq";

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