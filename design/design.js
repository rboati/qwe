function configure(exports) {
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HSM Error definitions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function errorToString() {
        return this.name + ': ' + this.message;
    }

    function DoesNotUnderstandError(event, args) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.name = 'DoesNotUnderstandError';
        this.message = "Does not understand the '" + event + "' event";
        this.event = event;
        this.args = args;
    }

    DoesNotUnderstandError.prototype.__proto__ = Error.prototype;
    DoesNotUnderstandError.prototype.toString = errorToString;

    function TransitionError(message, sourceState, targetState, err) {
        this.name = 'TransitionError';
        this.message =
            "while moving from state '" +
            sourceState.constructor.name +
            "' to state '" +
            targetState.constructor.name +
            "': " +
            message;
        this.sourceState = sourceState;
        this.targetState = targetState;
        this.err = err;
    }

    TransitionError.prototype.__proto__ = Error.prototype;
    TransitionError.prototype.toString = errorToString;

    function NestedTransitionError() {
        this.name = 'NestedTransitionError';
        this.message = "Transition was run to completion before another transition is requested; _enter/_exit must NOT request a transition";
        this.sourceState = sourceState;
        this.targetState = targetState;
        this.err = err;
    }

    NestedTransitionError.prototype.__proto__ = Error.prototype;
    NestedTransitionError.prototype.toString = errorToString;


    //Local assertion definition to reduce dependencies
    function AssertionError(message) {
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.name = this.constructor.name;
        this.message = message;
    }

    AssertionError.prototype.__proto__ = Error.prototype;
    AssertionError.prototype.toString = errorToString;

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
    StateInitializationError.prototype.toString = errorToString;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// State Object
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function State() {
    }

    function defineState(stateConstructor) {
        var state = new State;
        stateConstructor.call(state);
        state._error = state._error || function (e, err) {
            throw err;
        };
        state._doesNotUnderstand = state._doesNotUnderstand || function (e, evt, args) {
            throw new DoesNotUnderstandError(evt, args);
        };
        state._enter = state._enter || function () {
        };
        state._exit = state._exit || function () {
        };
        state.constructor = stateConstructor;
        stateConstructor.prototype = state;
        return state;
    }

    function state(constructor, parentConstructor, isInitialState) {
        var state;
        if (constructor.name == '') {
            throw new StateInitializationError('"constructor" is not a named Function; Anonymous functions are not valid State constructors')
        }
        if (constructor.prototype instanceof State) {
            throw new StateInitializationError('state ' + constructor.name + ' already initialized')
        }
        if (parentConstructor === undefined || parentConstructor === State) {
            return defineState(constructor);
        }

        if (!(parentConstructor instanceof Function)) {
            throw new StateInitializationError('parent constructor is not a Function');
        }
        if (!(parentConstructor.prototype instanceof State)) {
            throw new StateInitializationError("parentConstructor is not an initialized State constructor; call state(<your constructor>)");
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HSM Object
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function Hsm() {
    }

    function enterState(hsm, state) {
        if (this.__locked__) {
            throw new TransitionError(
                'Cannot execute a transition while entering or exiting a state',
                hsm.__behaviour__.prototype,
                state,
                new NestedTransitionError()
            );
        }
        hsm.__locked__ = true;
        try {
            hsm.__behaviour__._exit.call(hsm);
        } catch (err) {
            throw new TransitionError(
                "An error was thrown by the '_exit' callback",
                hsm.__behaviour__.prototype,
                state,
                err
            );
        }

        hsm.__locked__ = false;
    }

    function exitState(hsm, state) {

        hsm.__locked__ = true;
        try {
            hsm.__behaviour__._enter.call(hsm);
        } catch (err) {
            throw new TransitionError(
                "An error was thrown by the '_enter' callback",
                this.__behaviour__.prototype,
                state.prototype,
                err
            );
        } finally {
            hsm.__locked__ = false;
        }
    }

    Hsm.prototype.transition = function (stateConstructor) {
        var state = stateConstructor.prototype;
        enterState(this, state);
        this.__behaviour__ = state;
        exitState(this, state);
    };

    Hsm.prototype.send = function send(e) {
        var f = this.__behaviour__[e];
        if (f === undefined) {
            this.__behaviour__._doesNotUnderstand.call(this, '_doesNotUnderstand', e, arguments)
        }
        try {
            f.apply(this, arguments);
        } catch (err) {
            this.__behaviour__._error.call(this, '_error', err, e, arguments);
        }
    };
    Hsm.prototype.handleEvent = function (event) {
        var f = this.__behaviour__[e];
        if (f === undefined) {
            this.__behaviour__._doesNotUnderstand.call(this, '_doesNotUnderstand', e, arguments)
        }
        try {
            f.apply(this, arguments);
        } catch (err) {
            this.__behaviour__._error.call(this, '_error', err, e, arguments);
        }
    };
    Hsm.prototype.listen = function (event, eventEmitter) {
        var self = this;
        eventEmitter.on(event, function () {
            self.handleEvent(event)
        });
    };

    function init(object, initialStateConstructor) {
        var hsm = new Hsm();
        hsm.constructor = object.__proto__.constructor;
        hsm.prototype = object.__proto__;
        object.__proto__ = hsm;
        object.__behaviour__ = initialStateConstructor.prototype;
        object.__locked__ = false;
    }

    exports.DoesNotUnderstandError = DoesNotUnderstandError;
    exports.TransitionError = TransitionError;
    exports.NestedTransitionError = NestedTransitionError;
    exports.state = state;
    exports.State = State;
    exports.init = init;
    return exports;
}

var fhsm = configure(typeof exports === 'undefined' ? this.fhsm = {} : exports)

// ----------------- cut here
// Test of the preliminary NON hierarchical state machine

function MyObject() {
    this.name = 'Fabio';
    this.surname = 'Filasieno';
    fhsm.init(this, StateA);
}

MyObject.prototype.setName = function (n, s) {
    this.name = n;
    this.surname = s;
};

function StateA() {
    this.hey = function (e) {
        console.log(this.name + ' ' + this.surname + ' says "hey" in StateA');
        this.transition(StateB);
    };
    this._enter = function () {
        console.log('enter StateA');
    };
    this._exit = function () {
        console.log('exit StateA');
    };

}

function StateB() {
    this.hey = function (e) {
        console.log(this.name + ' ' + this.surname + ' says "hey" in StateB');
        this.transition(StateA);
    };

    this.fail = function (e) {
        throw new Error('An Error')
    };
    this._error = function (e, err, evt, args) {
        console.log('An Error occurred: ' + err.toString() + ' while processing the event "' + evt + '"');
    };
    this._enter = function () {
        console.log('enter StateB');
    };
    this._exit = function () {
        console.log('exit StateB');
    }
}

fhsm.state(StateA);
fhsm.state(StateB);


var obj = new MyObject;
obj.send('hey');
obj.send('hey');
obj.send('hey');
obj.send('fail');
obj.transition(StateB);










