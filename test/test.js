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
        obj.hsm.send('setValue', 10);
        assert(obj.value == 10);
    });

    it('send an unknown message', function () {
        qwe.dbgMode(true);

        // State setup
        var Top = qwe.state('Top');
        function MyObject(){
            this.value = 0;
        }
        Top.setValue = function(evt, value){ this.value = value; };
        Top.doesNotUnderstandError = function(evt, e, arguments){
            console.log('\nevt: "%s" e:"%s" arguments:%s', evt, e, arguments.toString());
            this.value = null;
        };

        var obj = new MyObject();
        qwe.init(obj, Top);

        obj.hsm.send('setValue', 100);
        console.log('value = %d', obj.value);
        assert(obj.value == 100);

        obj.hsm.send('setValueX', 100);
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
        obj.hsm.send('setValue', 300);
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
        Top.tran = function(evt, state){
            this.hsm.tran(state);
        };

        function MyObject(){
            this.value = 0;
        }
        var obj = new MyObject();
        qwe.init(obj, Top);

        obj.hsm.send('tran', Top);
        console.log('value = %s', obj.hsm.state.name);
        assert(obj.hsm.state.name == 'Top');
    });

    it('setup delayed first state', function () {
        qwe.dbgMode(true);

        var Top = qwe.state('Top');
        assert(Top.initialState == null);
        var A = qwe.state('A', Top, false);
        assert(Top.initialState == null);
        var B = qwe.state('B', A);
        var C = qwe.state('C', B);
        var D = qwe.state('D', Top);
        assert(Top.initialState == D);
        var E = qwe.state('E', D);
        var F = qwe.state('F', E);

        assert(Top.__proto__ == qwe.Root);
        assert(A.__proto__ == Top);
        assert(B.__proto__ == A);
        assert(C.__proto__ == B);

        assert(D.__proto__ == Top);
        assert(E.__proto__ == D);
        assert(F.__proto__ == E);

        assert(Top.initialState == D);
        assert(A.initialState == B);
        assert(B.initialState == C);
        assert(C.initialState == null);
        assert(D.initialState == E);
        assert(E.initialState == F);
        assert(F.initialState == null);

        assert(Top.subStates instanceof Array);
        assert(A.subStates instanceof Array);
        assert(B.subStates instanceof Array);
        assert(C.subStates instanceof Array);
        assert(D.subStates instanceof Array);
        assert(E.subStates instanceof Array);
        assert(F.subStates instanceof Array);

        assert(Top.subStates.length == 2);
        assert(A.subStates.length == 1);
        assert(B.subStates.length == 1);
        assert(C.subStates.length == 0);
        assert(D.subStates.length == 1);
        assert(E.subStates.length == 1);
        assert(F.subStates.length == 0);

        assert(Top.subStates[0] == A);
        assert(Top.subStates[1] == D);
        assert(A.subStates[0] == B);
        assert(B.subStates[0] == C);
        assert(C.subStates.length == 0);
        assert(D.subStates[0] == E);
        assert(E.subStates[0] == F);
        assert(F.subStates.length == 0);
    });

    it('execute initial drill down', function () {
        qwe.dbgMode(true);
        console.log('execute initial drill down');
        var Top = qwe.state('Top');
        var A = qwe.state('A', Top, false);
        var B = qwe.state('B', A);
        var C = qwe.state('C', B);
        var D = qwe.state('D', Top);
        var E = qwe.state('E', D);
        var F = qwe.state('F', E);

        function MyObject(){
            this.value = 0;
        }
        var obj = new MyObject();
        qwe.init(obj, Top);
        assert(obj.hsm.state.name == 'F');
    });

    it('execute a transition to parent', function () {
        qwe.dbgMode(true);
        var Top = qwe.state('Top');
        Top.move = function(e, state){
            this.hsm.tran(state);
        };
        var A = qwe.state('A', Top, false);
        var B = qwe.state('B', A);
        var C = qwe.state('C', B);
        var X = qwe.state('X', B);

        var D = qwe.state('D', Top);
        var E = qwe.state('E', D);
        var F = qwe.state('F', E);
        var Y = qwe.state('Y', E);

        function MyObject(){
            this.value = 0;
        }
        var obj = new MyObject();
        qwe.init(obj, Top);
        assert(obj.hsm.state.name == 'F');
        obj.hsm.send('move', E);
        assert(obj.hsm.state.name == 'F');

    });

    it('execute a transition to a target ancestor 1', function () {
        qwe.dbgMode(true);
        var Top = qwe.state('Top');
        Top.move = function(e, state){
            this.hsm.tran(state);
        };
        var A = qwe.state('A', Top, false);
        var B = qwe.state('B', A);
        var C = qwe.state('C', B);
        var X = qwe.state('X', B);

        var D = qwe.state('D', Top);
        var E = qwe.state('E', D);
        var F = qwe.state('F', E);
        var Y = qwe.state('Y', E);

        function MyObject(){
            this.value = 0;
        }
        var obj = new MyObject();
        qwe.init(obj, Top);
        assert(obj.hsm.state.name == 'F');
        obj.hsm.send('move', D);
        assert(obj.hsm.state.name == 'F');
    });

    it('execute a transition to a target ancestor 2', function () {
        qwe.dbgMode(true);
        var Top = qwe.state('Top');
        Top.move = function(e, state){
            this.hsm.tran(state);
        };
        var A = qwe.state('A', Top, false);
        var B = qwe.state('B', A);
        var C = qwe.state('C', B);
        var X = qwe.state('X', B);

        var D = qwe.state('D', Top);
        var E = qwe.state('E', D);
        var F = qwe.state('F', E);
        var Y = qwe.state('Y', E);

        function MyObject(){
            this.value = 0;
        }
        var obj = new MyObject();
        qwe.init(obj, Top);
        assert(obj.hsm.state.name == 'F');
        obj.hsm.send('move', Top);
        assert(obj.hsm.state.name == 'F');
    });








});

