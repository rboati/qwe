var process = require('process');

function A() {
    this.a = function (e, value) {
        return value;
    }

}

function B() {
    this.a = function (e, value) {
        return value + 1;
    }
}

var StateA = {};
A.call(StateA);
var StateB = {};
B.call(StateB);

function Hsm(initial) {
    this.__behaviour__ = initial;
}
Hsm.prototype.send = function (event) {
    return this.__behaviour__[event].apply(this, Array.prototype.slice(arguments, 1));
};
Hsm.prototype.transition = function (state) {
    return this.__behaviour__ = state;
};

function MyObject() {
    Hsm(StateA);
}
MyObject.prototype.__proto__ = new Hsm();

var begin = Date.now();
var obj = new MyObject();
var name;
for (var i = 0; i < 10000001; ++i) {
    i & 1 ? obj.transition(StateA) : obj.transition(StateB);
    name = obj.send('a', i);
    //x += child.top();
}
console.log('name:', name);
var end = Date.now();
var delta = end - begin;
console.log(delta);



