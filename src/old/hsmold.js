var util = require('util');
var assert = require('assert');

function State(){
}

State.prototype.toString = function(){
    return 'State<'+ this.__proto__.constructor.name +'>' // + check if it's a top state
};

State.prototype.inspect = function(depth){
    return 'State<'+ this.__proto__.constructor.name +'>'
};

function defState(constructor, parentConstructor, isInitialState) {
    if (constructor.name == '') {
        throw new TypeError('constructor is not named Function; Anonymous functions are not valid constructors')
    }

    if (parentConstructor === undefined) {
        constructor.prototype.__proto__ = State.prototype;
        constructor.prototype.onEntry = function (){};
        constructor.prototype.onExit = function (){};
        return;
    }

    if (!(parentConstructor instanceof Function)) {
        throw new TypeError('parent constructor is not a Function');
    }
    if (!(parentConstructor.prototype instanceof State)) {
        if (parentConstructor != State) {
            throw new TypeError('parentConstructor is not a State constructor.' );
        }
    }
    constructor.prototype.__proto__ = parentConstructor.prototype;
    if (parentConstructor.prototype === State)
        return;
    var subStates    = parentConstructor.prototype._subStates;
    var initialState = parentConstructor.prototype._initialState;
    if (subStates === undefined){
        subStates = [];
        subStates.push(constructor.prototype);
        parentConstructor.prototype._subStates = subStates;
    } else {
        assert(subStates instanceof Array);
        if (subStates.indexOf(constructor.prototype) == -1){
            subStates.push(constructor.prototype);
        }
    }

    if (isInitialState == true) {
        // Force Initial State Setup; don't care of current initial state
        parentConstructor.prototype._initialState = constructor.prototype;
    } else if (isInitialState === undefined) {
        if (initialState === undefined){
            parentConstructor.prototype._initialState = constructor.prototype;
        }
    } else if (typeof true != 'boolean') {
        throw new TypeError('isInitialState must be a boolean')
    }
    // if false do nothing
}

function on(constructor, event, callback) {
    assert(typeof event == 'string');
    constructor.prototype[event] = callback;
    return constructor.prototype;
}

function onEntry(constructor, callback) {
    constructor.prototype['onEntry'] = callback;
}

function onExit(constructor, callback) {
    constructor.prototype['onExit'] = callback;
}

State.prototype = function(targetState){
    if (!(targetState instanceof State)){
        throw new TypeError('state is not an instanceof State');
    }

    if (this.__proto__ == targetState){
        this.__proto__ = targetState;
    } else {
        // Execute Exit
        var i;
        var exitStack = [];
        var sourceState = this.__proto__;
        var state = sourceState;
        while (state != targetState || state != State){
            exitStack.push(state);
            state = state.__proto__;
        }
        for (i = 0; i < exitStack.length; ++i){
            exitStack[i].onExit();
        }

        // Execute Entry
        //var entryStack = [];
        //state = targetState;
        //while (state != sourceState || state != State){
        //    exitStack.push(state);
        //    state = state.__proto__;
        //}
        //for (i = exitStack.length - 1; i > 0; --i){
        //    exitStack[i].onEntry();
        //}
        this.__proto__ = targetState;
    }


};

function Hsm(stateConstructor){
    if (stateConstructor.prototype.__proto__ !== State.prototype){
        throw new TypeError('stateConstructor is NOT a top State');
    }

    // Init the top state
    var args = Array.prototype.slice.call(arguments, 1);
    console.log(stateConstructor.name);
    stateConstructor.call(this, args);

    var stateStack = [];
    var s = stateConstructor.prototype._initialState;
    while (s !== undefined){
        s.onEntry.call(this);
        s = s.prototype._initialState;
    }

    while (!stateStack.isEmpty){
        if (s.onEntry){

        }
    }
    var hsm = new Hsm();
    hsm.prototype.__proto__ = stateConstructor.prototype;
    this.__proto__ = stateConstructor.prototype;
    return stateConstructor.prototype;
}

var INITIAL = true;

//-----

Function.prototype.inherit = function(parentConstructor, isInitial) { defState(this, parentConstructor, isInitial) };
Function.prototype.on      = function(event, callback) { on(this, event, callback); };
Function.prototype.onEntry = function(callback) { onEntry(this, callback); };
Function.prototype.onExit  = function(callback) { onExit(this, callback); };

function TopState(){ console.log('TopState Created'); }
TopState.inherit(State);
TopState.onEntry(function(){ console.log('entry'); });
TopState.onExit(function(){ console.log('exit'); });
TopState.on('hello', function(){ console.log('exit'); });

function MainState(){  }
MainState.inherit(TopState);
MainState.onEntry(function(){ console.log('entry'); });
MainState.onExit(function(){ console.log('exit'); });

function ActiveState(){  }
ActiveState.inherit(MainState);
ActiveState.onEntry(function(){ console.log('entry'); });
ActiveState.onExit(function(){ console.log('exit'); });

function PausedState(){ }
PausedState.onEntry(function(){ console.log('entry'); });
PausedState.onExit(function(){ console.log('exit'); });

function initHsm(object, initialState){
    object.__proto__ = initialState;
    // Perform initialization
}

function Pippo() {
    this.x = 1000;
    this.y = 2000;
    initHsm(this, ActiveState);
}
Pippo.prototype.toString = function(){ return 'SuperPippo' };
Pippo.prototype.inspect = function(depth){ return 'SuperPippo' };

var x = new Hsm(ActiveState);
console.log(x);


//var x = new Hsm(TopState);
//x.hello();


//x.hello();
//
//
//
//

//function A(){}
//function B(){}
//A.prototype.__proto__ = B.prototype;
//var a = new A();
//console.log(A.prototype instanceof B);



