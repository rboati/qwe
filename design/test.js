function initObj(obj, state){
    function dispatch(evt){
        var callee = arguments.callee;
        var state = callee.state;
        var handler = state[evt];
        handler.apply(this, arguments);
    }
    dispatch.state = state;
    obj.send = dispatch;
    return obj;
}

function tran(obj, state) {
    obj.send.state = state
}

var Left = {
    name: 'Left',
    x: function(evt){ console.log(this.send.state.name + ':x'); tran(this, Right);},
    y: function(evt){ console.log(this.send.state.name + ':y'); tran(this, Right);}
};
var Right = {
    name: 'Right',
    x: function(evt){ console.log(this.send.state.name + ':x'); tran(this, Left);},
    y: function(evt){ console.log(this.send.state.name + ':y'); tran(this, Left);}
};

var o1 = initObj({}, Left);
var o2 = initObj({}, Right);
console.log(o1);
console.log(o2);
o1.send('x');
o1.send('y');
o2.send('x');
console.log(o1);
console.log(o2);
