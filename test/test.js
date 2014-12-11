var assert = require('chai').assert;
var qwe = require('../src/qwe');

describe("A test suite", function () {

    it('debug mode test', function () {
        var isInDebugMode = qwe.dbgMode();
        assert(isInDebugMode == false);
        isInDebugMode = qwe.dbgMode(true);
        assert(isInDebugMode == true);
        isInDebugMode = qwe.dbgMode(false);
        assert(isInDebugMode == false);
    });

    it('create a top state', function () {
        qwe.dbgMode(true);
        var Top = qwe.state('Top');
        assert(Top instanceof qwe.State);
        assert(Top.name == 'Top');
        assert(Top.subStates instanceof Array);
        assert(Top.initialState == null);

        function MyObject(){}
        var obj = new MyObject();
        qwe.init(obj, Top);
    });

    it('send a message', function () {
        qwe.dbgMode(true);
        var Top = qwe.state('Top');
        function MyObject(){
            this.value = null;
        }
        var obj = new MyObject();
        qwe.init(obj, Top);
        Top.setValue = function(evt, value){ this.value = value; };
        obj.dispatch('setValue', 10)
        assert(obj.value == 10);
    });

    it('send an unknown message', function () {
        qwe.dbgMode(true);
        var Top = qwe.state('Top');
        function MyObject(){
            this.value = 0;
        }
        var obj = new MyObject();
        qwe.init(obj, Top);
        Top.setValue = function(evt, value){ this.value = value; };
        Top.doesNotUnderstandError = function(evt, e, arguments){
            console.log('\nevt: "%s" e:"%s" arguments:%s', evt, e, arguments.toString());
            this.value = null;
        };
        obj.dispatch('setValue', 100);
        console.log('value = %d', obj.value);
        assert(obj.value == 100);

        obj.dispatch('setValueX', 100);
        console.log('value = %d', obj.value);
        assert(obj.value == null);
    });

    it('send a message that triggers an error', function () {
        qwe.dbgMode(true);
        var Top = qwe.state('Top');
        function MyObject(){
            this.value = 0;
        }
        var obj = new MyObject();
        qwe.init(obj, Top);
        Top.setValue = function(evt, value){ throw new Error('An Error'); };
        Top.error = function(evt, e, arguments){
            this.value = 100;
        };
        obj.dispatch('setValue', 300);
        console.log('value = %d', obj.value);
        assert(obj.value == 100);
    });

    it('build a state hierarchy', function () {
        var Top = qwe.state('Top');
        var A = qwe.state('A', Top);
        var B = qwe.state('B', A);
        var C = qwe.state('C', Top);
        var D = qwe.state('D', C);
        assert(Top.__proto__ == qwe.Root);
        assert(A.__proto__ == Top);
        assert(B.__proto__ == A);
        assert(C.__proto__ == Top);
        assert(D.__proto__ == C);

        assert(Top.initialState == A);
        assert(A.initialState == B);
        assert(B.initialState == null);
        assert(C.initialState == D);
        assert(D.initialState == null);

        assert(A.subStates instanceof Array);
        assert(B.subStates instanceof Array);
        assert(C.subStates instanceof Array);
        assert(D.subStates instanceof Array);

        assert(A.subStates[0] == B);
        assert(B.subStates.length == 0);
        assert(C.subStates[0] == D);
        assert(D.subStates.length == 0);
    });

    it('execute a transition to self', function () {
        qwe.dbgMode(true);
        var Top = qwe.state('Top');
        function MyObject(){
            this.value = 0;
        }
        var obj = new MyObject();
        qwe.init(obj, Top);
        Top.tran = function(evt, state){ qwe.tran(this, state); };
        obj.dispatch('tran', Top);
        var currState = qwe.currentState(obj).name;
        console.log('value = %s', currState);
        assert(currState == 'Top');
    });

    it('execute a transition to direct parent', function () {

    });

    it('execute a transition to direct child', function () {

    });

    it('execute a transition to source ancestor', function () {

    });

    it('execute a transition to target ancestor', function () {

    });

    it('execute a transition with full LCA search', function () {

    });








});

