var process = require('process');

function State() {

}
State.prototype.transition = function (state) {
    this.__proto__ = state;
};

function A() {
    this.a = function (value) {
        return value;
    }

}

function B() {
    this.a = function (value) {
        return value + 1;
    }
}

var StateA = new State;
A.call(StateA);
var StateB = new State;
B.call(StateB);

function init(state) {
    this.__proto__ = state;
}

function MyObject() {
    this.__proto__ = StateA;
}


var begin = Date.now();
var obj = new MyObject();
var name;
for (var i = 0; i < 10000001; ++i) {
    i & 1 ? obj.transition(StateA) : obj.transition(StateB);
    name = obj.a(i);
    //x += child.top();
}
console.log('name:', name);
var end = Date.now();
var delta = end - begin;
console.log(delta);

// benchmark result DON'T CHANGE the __proto__ to implement dynamic behaviour
