var chai = require('chai');
var fhsm = require('../src/fhsm');
var assert = chai.assert;

fhsm.debugMode = true;

describe("A test suite", function () {

    function Top(state){
        this.moveTo = function(e, state){
            this.transition(state);
        }
    }
    function Main(state){}
    function A(state){}
    function B(state){}
    function C(state){}
    function D(state){}
    function E(state){}
    function F(state){}
    function Other(state){}
    var Invalid = function(state) { };
    fhsm.state(Top);
    fhsm.state(Main, Top);
    fhsm.state(A, Main);
    fhsm.state(B, Main);
    fhsm.state(C, A);
    fhsm.state(D, A);
    fhsm.state(E, B);
    fhsm.state(F, B);
    console.log(fhsm.stateTrace(Top));

    function TestObj(){
        fhsm.init(this, Top);
    }
    var o = new TestObj();

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
            fhsm.state(Other, 10);
        } catch(err) {
            assert(err.name == 'StateInitializationError');
            return;
        }
        assert(false);
    });

    it('setup of the Top State', function () {
        assert(Top.prototype._initialState == Main.prototype);
        assert(Top.prototype._subStates instanceof Array);
        assert(Top.prototype._subStates.length == 1);
    });

    it('already initialized TopState', function () {
        try {
            MainState = fhsm.state(Top, Main);
        } catch (err) {
            assert(err.name == 'StateInitializationError');
        }
    });

    it('case a', function () {
        o.send('moveTo', C);
    });

    it('case b', function () {
        o.send('moveTo', D);
    });

});

