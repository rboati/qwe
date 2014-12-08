var chai = require('chai');
var fhsm = require('../src/fhsm');
var assert = chai.assert;

describe("A test suite", function () {

    function Top(state){

    }

    function Main(state){

    }

    var Invalid = function(state) { };

    it('invalid state setup', function () {
        try {
            fhsm.state(Invalid);
        } catch(err){
            assert(err instanceof TypeError);
            return;
        }
        assert(false, 'An exception should have occurred');
    });

    it('top state setup with error on parent Constructor', function () {
        try{
            fhsm.state(Top, 10);
        } catch(err) {
            assert(err instanceof TypeError);
            return;
        }
        assert(false);
    });

    it('should NOT be ok', function () {
        assert.equal(1,1);
    });

});

