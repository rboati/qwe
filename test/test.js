var assert = require('chai').assert;
var qwe = require('../src/qwe');

qwe.traceMode = true;

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
    qwe.state(Top);
    qwe.state(Main, Top);
    qwe.state(A, Main);
    qwe.state(B, Main);
    qwe.state(C, A);
    qwe.state(D, A);
    qwe.state(E, B);
    qwe.state(F, B);
    console.log(qwe.stateTrace(Top));

    function TestObj(){
        qwe.init(this, Top);
    }
    var o = new TestObj();

    it('invalid state setup', function () {
        try {
            qwe.state(Invalid);
        } catch(err){
            assert(err.name == 'StateInitializationError');
            return;
        }
        assert(false, 'An exception should have occurred');
    });

    it('top state setup with error on parent Constructor', function () {
        try{
            qwe.state(Other, 10);
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
            MainState = qwe.state(Top, Main);
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

