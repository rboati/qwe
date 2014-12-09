function configure(exports) {
    "use strict";
    // HSM Error definitions

    function errorToString() { return this.name + ': ' + this.message; }

    function DoesNotUnderstandError(state, event, args) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this.state = state;
        this.name = 'DoesNotUnderstandError';
        this.message = "State '"+state.constructor.name+"' does not understand the '" + event + "' event";
        this.event = event;
        this.args = args;
    }
    DoesNotUnderstandError.prototype.__proto__ = Error.prototype;
    DoesNotUnderstandError.prototype.toString = errorToString;

    function TransitionError(message, sourceState, targetState, err) {
        this.name = 'TransitionError';
        this.message = "while moving from state '" + sourceState.getStateName() + "' to state '" + targetState.getStateName() + "': " + message;
        this.sourceState = sourceState;
        this.targetState = targetState;
        this.err = err;
    }
    TransitionError.prototype.__proto__ = Error.prototype;
    TransitionError.prototype.toString = errorToString;

    function NestedTransitionError(sourceState, targetState) {
        this.name = 'NestedTransitionError';
        this.message = "Transition was run to completion before another transition is requested; _enter/_exit must NOT request a transition";
        this.sourceState = sourceState;
        this.targetState = targetState;
    }
    NestedTransitionError.prototype.__proto__ = Error.prototype;
    NestedTransitionError.prototype.toString = errorToString;

    function AssertionError(message) { //Local assertion definition to reduce dependencies
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message;
    }

    AssertionError.prototype.__proto__ = Error.prototype;
    AssertionError.prototype.toString = errorToString;

    function assert(contidion, message) {
        if (!contidion)
            throw new AssertionError(message);
    }

    function StateInitializationError(message) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message;
    }

    StateInitializationError.prototype.__proto__ = Error.prototype;
    StateInitializationError.prototype.toString = errorToString;

    // State Object

    function State(stateConstructor, parentState) {
        this._initialState = null;
        this._subStates = [];
        this.constructor = stateConstructor;
        stateConstructor.prototype = this;
        stateConstructor.call(this);
        this._error = this._error || function (e, err) { throw err; };
        this._doesNotUnderstand = this._doesNotUnderstand || function (e, evt, args) { throw new DoesNotUnderstandError(state, evt, args); };
        this._enter = this._enter || function () { };
        this._exit = this._exit || function () { };
        if (parentState !== undefined)
            this.__proto__ = parentState;
    }

    State.prototype.getName = function(){ return this.constructor.name; };

    State.prototype.hasSubState = function(stateName){
        var len = this._subStates.length;
        for (var i = 0; i < len; ++i){
            if (this._subStates[i].constructor.name == stateName)
                return true;
        }
        return false;
    };

    function state(constructor, parentConstructor, isInitialState) {
        var state;
        if (constructor.name == '')
            throw new StateInitializationError('"constructor" is not a named Function; Anonymous functions are not valid State constructors')
        if (constructor.prototype instanceof State)
            throw new StateInitializationError('state ' + constructor.name + ' already initialized')
        if (parentConstructor === undefined || parentConstructor === State)
            return new State(constructor);
        if (!(parentConstructor instanceof Function))
            throw new StateInitializationError('parent constructor is not a Function');
        if (!(parentConstructor.prototype instanceof State))
            throw new StateInitializationError("parentConstructor is not an initialized State constructor; call state(<your constructor>)");
        var parentSubStates = parentConstructor.prototype._subStates;
        var parentInitialState = parentConstructor.prototype._initialState;
        assert(parentSubStates instanceof Array);
        if (parentConstructor.prototype.hasSubState(constructor.name)) {
            throw new StateInitializationError("State '"+constructor.name+"' is already initialized")
        }
        parentSubStates.push(constructor.prototype);
        if (isInitialState == true) {
            // Force Initial State Setup; don't care of current initial state
            state = new State(constructor, parentConstructor.prototype);
            parentConstructor.prototype._initialState = state;
            return state;
        } else if (isInitialState === undefined) {
            state = new State(constructor, parentConstructor.prototype);
            if (parentInitialState == null)
                parentConstructor.prototype._initialState = constructor.prototype;
            return state;
        } else if (typeof true != 'boolean') {
            throw new TypeError('isInitialState must be a boolean')
        }
        return new State(constructor, parentConstructor.prototype); // else if false do nothing and return state
    }

    // HSM Object

    function Hsm() {}

    function enterState(hsm, state) {
        if (hsm.__locked__) {
            throw new TransitionError(
                'Cannot execute a transition while entering a state',
                hsm.__state__,
                state,
                new NestedTransitionError(hsm.__state__, state)
            );
        }
        hsm.__locked__ = true;
        try {
            hsm.__state__._enter.call(hsm);
        } catch (err) {
            throw new TransitionError("An error was thrown by the '_enter' callback", hsm.__state__.prototype, state, err);
        }
        hsm.__locked__ = false;
    }

    function exitState(hsm, state) {
        if (hsm.__locked__) {
            throw new TransitionError(
                'Cannot execute a transition while exiting a state',
                hsm.__state__,
                state,
                new NestedTransitionError(hsm.__state__, state)
            );
        }
        hsm.__locked__ = true;
        try {
            hsm.__state__._exit.call(hsm);
        } catch (err) {
            throw new TransitionError("An error was thrown by the '_exit' callback", this.__state__, state, err);
        } finally {
            hsm.__locked__ = false;
        }
    }

    Hsm.prototype.getCurrentState = function () {
        return this.__state__;
    };

    Hsm.prototype.getCurrentStateName = function () {
        return this.__state__.getName();
    };

    Hsm.prototype.transition = function (stateConstructor) {
        var state = stateConstructor.prototype;
        enterState(this, state);
        this.__state__ = state;
        exitState(this, state);
    };

    Hsm.prototype.transition = function (stateConstructor) {
        var state = stateConstructor.prototype;
        if (state == this.__state__) return;
        exitState(this, state);
        this.__state__ = state;
        enterState(this, state);
    };

    Hsm.prototype.send = function send(e) {
        var f = this.__state__[e];
        if (f === undefined) {
            this.__state__._doesNotUnderstand.call(this, '_doesNotUnderstand', e, arguments);
            return;
        }
        try {
            f.apply(this, arguments);
        } catch (err) {
            this.__state__._error.call(this, '_error', err, e, arguments);
        }
    };

    Hsm.prototype.handleEvent = function (event) {
        var f = this.__state__[e];
        if (f === undefined) {
            this.__state__._doesNotUnderstand.call(this, '_doesNotUnderstand', e, arguments);
            return;
        }
        try {
            f.apply(this, arguments);
        } catch (err) {
            this.__state__._error.call(this, '_error', err, e, arguments);
        }
    };

    Hsm.prototype.listen = function (event, eventEmitter) {
        var self = this;
        eventEmitter.on(event, function () {
            self.handleEvent(event)
        });
    };

    function init(object, initialStateConstructor) {
        assert(initialStateConstructor.prototype instanceof State);
        var hsm = new Hsm();
        hsm.constructor = object.__proto__.constructor;
        hsm.prototype = object.__proto__;
        object.__proto__ = hsm;
        object.__state__ = initialStateConstructor.prototype;
        object.__locked__ = false;

        while (object.__state__._initialState != null){
            enterState(object, object.__state__._initialState);
            object.__state__ = object.__state__._initialState;
        }
        enterState(object, object.__state__);
    }

    exports.DoesNotUnderstandError = DoesNotUnderstandError;
    exports.TransitionError = TransitionError;
    exports.NestedTransitionError = NestedTransitionError;
    exports.state = state;
    exports.init = init;
    return exports;
}

var fhsm = configure(typeof exports === 'undefined' ? this.fhsm = {} : exports);

// ----------------- cut here
// Test of the preliminary NON hierarchical state machine

function MyObject() {
    this.objName = 'Fabio';
    this.objSurname = 'Filasieno';
    fhsm.init(this, Main);
}

MyObject.prototype.setName = function (n, s) {
    this.objName = n;
    this.objSurname = s;
};

function Main() {
    this._enter = function () {
        console.log('enter TopState');
    };
    this._exit = function () {
        console.log('exit TopState');
    };
    this.hey = function (e) {
        console.log(this.objName + ' ' + this.objSurname + ' says "hey" in state "'+this.getCurrentStateName()+'"' );
        this.transition(B);
    };
}

function A() {

    this._enter = function () {
        console.log('enter StateA');
    };
    this._exit = function () {
        console.log('exit StateA');
    };

}

function B() {

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

fhsm.state(Main);
fhsm.state(A, Main);
fhsm.state(B, Main);


var obj = new MyObject;
obj.send('hey');
obj.send('hey');
obj.send('hey');
obj.send('fail');










