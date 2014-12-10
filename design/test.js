var x = eval('function Test(){}');
var s = Test;
console.log(Test);

function send(obj, event) {
    obj.__behaviour__[event].apply(obj, arguments);
}

function route(arguments) {
    arguments[0].__behaviour__[arguments[1]].apply(arguments[0], arguments);
}

var beta = {
    __behaviour__: {
        evt: function (obj, evt) {
            console.log('beta received: ' + evt)

        }
    }
};

var alpha = {
    __behaviour__: {
        evt: function (obj, evt) {
            console.log('alpha received: ' + evt);
            arguments[0] = beta;
            route(arguments);
        }
    }
};


send(alpha, 'evt', 'hello');
