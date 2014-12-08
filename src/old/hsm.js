//var assert = require('assert');
//
//function State(stateName){
//    "use strict";
//    this.name = stateName;
//}
//
//State.prototype.toString = function(){
//    return 'State<'+ this.__proto__.constructor.name +'>' // + check if it's a top state
//};
//
//State.prototype.inspect = function(depth){
//    return 'State<'+ this.__proto__.constructor.name +'>'
//};
//
//State.prototype.onEntry = function(callback) {
//    this._entry = callback;
//}
//
//State.prototype.onExit = function(callback) {
//    this._exit = callback;
//}
//
//function extendProtoChain(constructor, parentConstructor){
//    assert(typeof constructor == 'function' && constructor.name != '');
//    assert(typeof parentConstructor == 'function' && parentConstructor.name != '');
//    var s = [];
//    s.push(constructor.prototype);
//    var prototype = constructor.prototype.__proto__;
//    while (prototype != null){
//        s.push(prototype);
//        prototype = prototype.__proto__;
//    }
//    s.pop(); // remove Object
//    prototype = s.pop();
//    var newPrototype = {};
//    newPrototype.constructor = prototype.constructor;
//    newPrototype.__proto__   = parentConstructor.prototype;
//    for (var k in prototype){
//        if (prototype.hasOwnProperty(k)){
//            newPrototype[k] = prototype[k];
//        }
//    }
//    var result = {};
//    result.top = newPrototype;
//    while(s.length != 0) {
//        prototype = s.pop();
//        newPrototype = {};
//        newPrototype.constructor = prototype.constructor;
//        newPrototype.__proto__   = prototype.prototype;
//        for (var k in prototype){
//            if (prototype.hasOwnProperty(k)){
//                newPrototype[k] = prototype[k];
//            }
//        }
//        parentConstructor = prototype;
//    }
//    result.bottom = prototype;
//    return result;
//}
//
//function state(constructor, parentConstructor, isInitialState) {
//    if (constructor.name == '') {
//        throw new TypeError('constructor is not named Function; Anonymous functions are not valid constructors')
//    }
//
//    constructor.prototype.onEntry = constructor.constructor;
//    constructor.prototype.onExit = function (){};
//
//    if (parentConstructor === undefined) {
//        constructor.prototype.__proto__ = State.prototype;
//        return;
//    }
//
//    if (!(parentConstructor instanceof Function)) {
//        throw new TypeError('parent constructor is not a Function');
//    }
//    if (!(parentConstructor.prototype instanceof State)) {
//        if (parentConstructor != State) {
//            throw new TypeError('parentConstructor is not a State constructor.' );
//        }
//    }
//    constructor.prototype.__proto__ = parentConstructor.prototype;
//    if (parentConstructor.prototype === State)
//        return;
//    var subStates    = parentConstructor.prototype._subStates;
//    var initialState = parentConstructor.prototype._initialState;
//    if (subStates === undefined){
//        subStates = [];
//        subStates.push(constructor.prototype);
//        parentConstructor.prototype._subStates = subStates;
//    } else {
//        assert(subStates instanceof Array);
//        if (subStates.indexOf(constructor.prototype) == -1){
//            subStates.push(constructor.prototype);
//        }
//    }
//
//    if (isInitialState == true) {
//        // Force Initial State Setup; don't care of current initial state
//        parentConstructor.prototype._initialState = constructor.prototype;
//    } else if (isInitialState === undefined) {
//        if (initialState === undefined){
//            parentConstructor.prototype._initialState = constructor.prototype;
//        }
//    } else if (typeof true != 'boolean') {
//        throw new TypeError('isInitialState must be a boolean')
//    }
//    // if false do nothing
//}
//
//function init(stateConstructor, object){
//    if (typeof object == 'function'){
//        object = new object();
//    }
//    var state = stateConstructor.prototype;
//    object.__proto__ = state;
//    object.__behaviour__ = object;
//    //console.log(stateConstructor.prototype.);
//    state.onEntry.call(this);
//    for(;;){
//        state = state['_initialState'];
//        state.onEntry.call(this);
//        if(!state.hasOwnProperty('_initialState'))
//        break;
//    }
//    return object;
//}
//
//function on(constructor, event, callback) {
//    assert(typeof event == 'string');
//    constructor.prototype[event] = callback;
//    return constructor.prototype;
//}
//
//function hsm(){
//    "use strict";
//
//}
//
//hsm.init = init;
//hsm.state = state;
//hsm.on = on;
//hsm.onEntry = onEntry;
//hsm.onExit = onExit;
//
//exports = hsm;
//
//
//// TEST //
//
////function TopState(){ console.log('Enter TopState'); }
//
//var TopState = hsm('Top State', function(state){
//    state._enter = function(){ console.log('Top State onEntry') };
//    state._exit = function(){ console.log('Top State onEntry') };
//    state.hello = function(){ console.log('Top State onEntry') };
//});
//hsm.onEnter(TopState, );
//hsm.onExit(TopState, function(){ console.log('Top State onEntry') });
//hsm.on(TopState, 'hello', function(){ console.log('Hello from top state') });
//
//TopState._exit  =
//TopState._entry = function(){ console.log('State onExit');
//TopState.hello  = function(){ console.log('Hello'); };
//
//var MainState = hsm('Main State', TopState);
//MainState._entry = function(){ console.log('enter MainState');
//MainState._exit = function(){ console.log('exit MainState');
//MainState.on('hello', function(){ console.log('Hello from mainState');}
//
////var o = hsm.init(TopState, function(){
////    this.x = 100;
////    this.y = 200;
////});
////console.log(o);
//
//
//
//
//
//
