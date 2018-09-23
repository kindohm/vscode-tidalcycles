//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import { expect } from 'chai';
import 'mocha';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {

    // Defines a Mocha unit test
    test("Something 1", function() {
        expect(-1).to.equal([1, 2, 3].indexOf(5));
        expect(-1).to.equal([1, 2, 3].indexOf(0));
    });
});