function configure(exports) {

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

    //function initHsm(obj, stateConstructor) {
    //
    //}

    function postProcessState(state) {
        state._entry = state._entry || function () {
        };
        state._exit = state._exit || function () {
        };
    }

    function state(constructor, parentConstructor, isInitialState) {
        if (constructor.name == '') {
            throw new TypeError('"constructor" is not named Function; Anonymous functions are not valid constructors')
        }

        var state;

        if (parentConstructor === undefined) {
            state = new State();
            constructor.call(state);
            postProcessState(state);
            constructor.prototype = state;
            constructor.prototype.constructor = constructor;
            constructor.prototype.__proto__ = State.prototype;
            return constructor.prototype;
        }

        if (!(parentConstructor instanceof Function)) {
            throw new TypeError('parent constructor is not a Function');
        }
        if (!(parentConstructor.prototype instanceof State)) {
            if (parentConstructor != State) {
                throw new TypeError('parentConstructor is not a State constructor.');
            }
        }
        constructor.prototype.__proto__ = parentConstructor.prototype;
        if (parentConstructor.prototype === State)
            return constructor.prototype;
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
    };

    exports.state = state;


}

configure(typeof exports === 'undefined' ? this.fhsm = {} : exports);





