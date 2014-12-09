function configure(exports) {
    "use strict";

    //Local assertion definition to reduce dependencies
    function AssertionError(message) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.name = this.constructor.name;
        this.message = message;
    }

    AssertionError.prototype.__proto__ = Error.prototype;
    AssertionError.prototype.toString = function () {
        return this.name + ': ' + this.message;
    };


    function assert(contidion, message) {
        if (!contidion) {
            throw new AssertionError(message);
        }
    }

    function StateInitializationError(message) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.name = this.constructor.name;
        this.message = message;
    }

    StateInitializationError.prototype.__proto__ = Error.prototype;
    StateInitializationError.prototype.toString = function () {
        return this.name + ': ' + this.message
    }

    // State definition initialization
    function State() {

    }

    State.prototype = new State();
    State.prototype.constructor = State;

    //function extendProtoChain(constructor, parentConstructor) {
    //    assert(typeof constructor == 'function' && constructor.name != '');
    //    assert(typeof parentConstructor == 'function' && parentConstructor.name != '');
    //    var s = [];
    //    s.push(constructor.prototype);
    //    var prototype = constructor.prototype.__proto__;
    //    while (prototype != null) {
    //        s.push(prototype);
    //        prototype = prototype.__proto__;
    //    }
    //    s.pop(); // remove Object
    //    prototype = s.pop();
    //    var newPrototype = {};
    //    newPrototype.constructor = prototype.constructor;
    //    newPrototype.__proto__ = parentConstructor.prototype;
    //    for (var k in prototype) {
    //        if (prototype.hasOwnProperty(k)) {
    //            newPrototype[k] = prototype[k];
    //        }
    //    }
    //    var result = {};
    //    result.top = newPrototype;
    //    while (s.length != 0) {
    //        prototype = s.pop();
    //        newPrototype = {};
    //        newPrototype.constructor = prototype.constructor;
    //        newPrototype.__proto__ = prototype.prototype;
    //        for (var k in prototype) {
    //            if (prototype.hasOwnProperty(k)) {
    //                newPrototype[k] = prototype[k];
    //            }
    //        }
    //        parentConstructor = prototype;
    //    }
    //    result.bottom = prototype;
    //    return result;
    //}

    function init(obj, stateConstructor) {

    }

    function postProcessState(state) {
        state._entry = state._entry || function () {
        };
        state._exit = state._exit || function () {
        };
    }

    function state(constructor, parentConstructor, isInitialState) {
        if (constructor.name == '') {
            throw new StateInitializationError('"constructor" is not a named Function; Anonymous functions are not valid State constructors')
        }
        if (constructor.prototype instanceof State) {
            throw new StateInitializationError('state ' + constructor.name + ' already initialized')
        }

        var state;

        if (parentConstructor === undefined || parentConstructor === State) {
            state = new State();
            constructor.call(state);
            postProcessState(state);
            state.constructor = constructor;
            state.__proto__ = State.prototype;
            state._subStates = [];
            state._initialState = null;

            constructor.prototype = state;
            return state;
        }

        if (!(parentConstructor instanceof Function)) {
            throw new StateInitializationError('parent constructor is not a Function');
        }
        if (!(parentConstructor.prototype instanceof State)) {
            throw new StateInitializationError('parentConstructor is not a State constructor:');
        }


        var parentSubStates = parentConstructor.prototype._subStates;
        var parentInitialState = parentConstructor.prototype._initialState;
        if (parentSubStates === undefined) {
            parentSubStates = [];
            parentSubStates.push(constructor.prototype);
            parentConstructor.prototype._subStates = parentSubStates;
        } else {
            assert(parentSubStates instanceof Array);
            if (parentSubStates.indexOf(constructor.prototype) == -1) {
                parentSubStates.push(constructor.prototype);
            }
        }

        if (isInitialState == true) {
            // Force Initial State Setup; don't care of current initial state
            parentConstructor.prototype._initialState = constructor.prototype;
        } else if (isInitialState === undefined) {
            if (parentInitialState === undefined || parentInitialState == null) {
                parentConstructor.prototype._initialState = constructor.prototype;
            } else {
                parentConstructor.prototype._initialState = null;
            }
        } else if (typeof true != 'boolean') {
            throw new TypeError('isInitialState must be a boolean')
        }
        // else if false do nothing
        return constructor.prototype
    }

    exports.state = state;
    exports.State = State;
    exports.init = init;
    exports.StateInitializationError = StateInitializationError;
}

configure(typeof exports === 'undefined' ? this.fhsm = {} : exports);





