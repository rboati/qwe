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
            assert(err.name == 'StateInitializationError');
            return;
        }
        assert(false, 'An exception should have occurred');
    });

    it('top state setup with error on parent Constructor', function () {
        try{
            fhsm.state(Top, 10);
        } catch(err) {
            assert(err.name == 'StateInitializationError');
            return;
        }
        assert(false);
    });

    var TopState;
    it('setup of the Top State', function () {
        TopState = fhsm.state(Top);
        assert(TopState._initialState == null);
        assert(TopState._subStates instanceof Array);
        assert(TopState._subStates.length == 0);
    });

    var MainState;
    it('already initialized TopState', function () {
        try {
            MainState = fhsm.state(Top, Main);
        } catch (err) {
            assert(err.name == 'StateInitializationError');
        }
    });

    // TODO: about to test all HSM cases
});

