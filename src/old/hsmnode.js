var console = require('console');
var assert = require('assert');

function Hsm(state){
    "use strict";
    // Ensure State is an instance of State
    this.__proto__ = state;
    console.log('About to create a State Machine');
    // Perform Initialization
    // Navigate from state to TopState
}
Hsm.constructor = Hsm;

function emptyOnInit(){}
function failConstructor(){
    "use strict";
    throw new Error();
}

function State(parentState, isInitialState, callback){

}




var TopState = new State();

var ReadyState = new State();
var WaitingState = new State(ReadyState, State.INITIAL);
var ActiveState = new State(ReadyState);

ReadyState.onEntry = function(){
    console.log('Enter ReadyState')
};

ReadyState.onExit = function(){
    console.log('Exit ReadyState')
};

ReadyState.hello = function(){
    console.log('hello')
};

var machine = new Hsm(ReadyState);
machine.hello();


//
//
//
//
//
//// function ..., args
//State.prototype.send = function(){
//    var eventName = arguments[0];
//    console.log('Received event: "' + eventName + '"');
//    var obj = this[eventName];
//    if (obj == undefined){
//        this._doesNotUnderstand.call(this, arguments);
//        return;
//    }
//    var args = Array.prototype.slice.call(arguments, 1);
//    console.log(arguments.toString());
//    this[eventName].call(this, args);
//};
//
//State.prototype._doesNotUnderstand = function(){
//    throw 'Does not understand ' + arguments[0];
//};
//
//State.prototype.transition = function(targetState){
//    if (this.__proto__ == targetState){
//        this.__proto__ = targetState;
//    } else {
//        // Execute Exit
//        var i;
//        var exitStack = [];
//        var sourceState = this.__proto__;
//        var state = sourceState;
//        while (state != targetState || state != State){
//            exitStack.push(state);
//            state = state.__proto__;
//        }
//        for (i = 0; i < exitStack.length; ++i){
//            exitStack[i].onExit();
//        }
//
//        // Execute Entry
//        var entryStack = [];
//        state = targetState;
//        while (state != sourceState || state != State){
//            exitStack.push(state);
//            state = state.__proto__;
//        }
//        for (i = exitStack.length - 1; i > 0; --i){
//            exitStack[i].onEntry();
//        }
//        this.__proto__ = targetState;
//    }
//
//};
//
//
//State.prototype.onError = function(){
//
//};
//
//State.prototype.onEntry = function(){
//
//};
//
//State.prototype.onExit = function(){
//
//};
//
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Test
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//
//
//
//
//
//
//
//
//WaitingState.prototype.activate = function(message){
//
//};
//ReadyState.inheritsFrom(State);
//
//function ActiveState(){
//    console.log('Created Active State')
//}
//ActiveState.prototype.__proto__ = WaitingState.prototype;
//ActiveState.prototype.pause = function(message){
//    this.transition(WaitingState);
//};
//
//ActiveState.prototype.onEntry = function(message){
//    console.log('paused');
//};
//
//var asp = ActiveState.prototype;
//var s = new ReadyState;
//s.send('say');
//
//
//
