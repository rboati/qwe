function configure(exports) {
    "use strict";
    // HSM Error definitions
    exports.debugMode = false;

    function errorToString() { return this.name + ': ' + this.message; }

    function DoesNotUnderstandError(state, event, args) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this.state = state;
        this.name = 'DoesNotUnderstandError';
        this.message = "State '" + state.constructor.name + "' does not understand the '" + event + "' event";
        this.event = event;
        this.args = args;
    }
    DoesNotUnderstandError.prototype.__proto__ = Error.prototype;
    DoesNotUnderstandError.prototype.toString = errorToString;

    function TransitionError(message, sourceState, targetState, err) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this.name = 'TransitionError';
        this.message = "while moving from state '" + sourceState.getStateName() + "' to state '" + targetState.getStateName() + "': " + message;
        this.sourceState = sourceState;
        this.targetState = targetState;
        this.err = err;
    }
    TransitionError.prototype.__proto__ = Error.prototype;
    TransitionError.prototype.toString = errorToString;

    function NestedTransitionError(sourceState, targetState) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
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
        this._transitionTable = {};
        this.constructor = stateConstructor;
        stateConstructor.prototype = this;
        stateConstructor.call(this);
        this._error = this._error || function (e, err) { throw err; };
        this._doesNotUnderstand = this._doesNotUnderstand || function (e, evt, args) { throw new DoesNotUnderstandError(state, evt, args); };

        if (exports.debugMode) {
            if (this._enter !== undefined) {
                var userDefinedEnter = this._enter;
                this._enter = function () {
                    console.log('enter ' + this.getStateName() + '\n');
                    userDefinedEnter.call(this);
                }
            } else {
                this._enter = function () {
                    console.log('enter ' + this.getStateName() + '\n');
                };
            }
        } else {
            this._enter = this._enter || function(){}
        }

        if (exports.debugMode) {
            if (this._exit !== undefined) {
                var userDefinedExit = this._exit;
                this._exit = function () {
                    userDefinedExit.call(this);
                    console.log('exit ' + this.getStateName() + '\n');
                }
            } else {
                this._exit = function () { console.log('exit ' + this.getStateName() + '\n'); };
            }
        } else {
            this._exit = this._exit || function(){}
        }

        if (parentState !== undefined)
            this.__proto__ = parentState;
    }
    State.prototype.getStateName = function(){ return this.constructor.name; };
    State.prototype.getParentState = function(){ return this.__proto__; };
    State.prototype.getParentStateName = function(){ return this.__proto__.constructor.name; };
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
            throw new StateInitializationError('"constructor" is not a named Function; Anonymous functions are not valid State constructors');
        if (constructor.prototype instanceof State)
            throw new StateInitializationError('state ' + constructor.name + ' already initialized');
        if (parentConstructor === undefined || parentConstructor === State)
            return new State(constructor);
        if (typeof parentConstructor != 'function')
            throw new StateInitializationError('parent constructor is not a Function');
        if (!(parentConstructor.prototype instanceof State))
            throw new StateInitializationError("parentConstructor is not an initialized State constructor; call state(<your constructor>)");
        var parentSubStates = parentConstructor.prototype._subStates;
        var parentInitialState = parentConstructor.prototype._initialState;
        assert(parentSubStates instanceof Array);
        if (parentConstructor.prototype.hasSubState(constructor.name))
            throw new StateInitializationError("State '" + constructor.name + "' is already initialized");
        if (isInitialState == true) {
            // Force Initial State Setup; don't care of current initial state
            state = new State(constructor, parentConstructor.prototype);
            parentSubStates.push(state);
            parentConstructor.prototype._initialState = state;
            return state;
        } else if (isInitialState === undefined) {
            state = new State(constructor, parentConstructor.prototype);
            parentSubStates.push(state);
            if (parentInitialState == null)
                parentConstructor.prototype._initialState = constructor.prototype;
            return state;
        } else if (typeof true != 'boolean') {
            throw new TypeError('isInitialState must be a boolean');
        }
        state = new State(constructor, parentConstructor.prototype); // else if false do nothing and return state
        parentSubStates.push(state);
        return state;
    }

    // HSM Object
    function Hsm() {}

    function enterState(hsm, state) {
        if (hsm.__locked__)
            throw new TransitionError('Cannot execute a transition while entering a state', hsm.__state__, state, new NestedTransitionError(hsm.__state__, state));
        hsm.__locked__ = true;
        try {
            hsm.__state__._enter.call(hsm);
        } catch (err) {
            throw new TransitionError("An error was thrown by the '_enter' callback", hsm.__state__, state, err);
        }
        hsm.__locked__ = false;
    }

    function exitState(hsm, state) {
        if (hsm.__locked__)
            throw new TransitionError('Cannot execute a transition while exiting a state', hsm.__state__, state, new NestedTransitionError(hsm.__state__, state));
        hsm.__locked__ = true;
        try {
            hsm.__state__._exit.call(hsm);
        } catch (err) {
            throw new TransitionError("An error was thrown by the '_exit' callback", this.__state__, state, err);
        } finally {
            hsm.__locked__ = false;
        }
    }

    Hsm.prototype.getState = function () {
        return this.__state__;
    };

    Hsm.prototype.getStateName = function () {
        return this.__state__.getStateName();
    };

    Hsm.prototype.transition = function (stateConstructor) {
        assert(stateConstructor instanceof Function);
        assert(stateConstructor.prototype instanceof State);
        assert(stateConstructor !== State, 'Illegal transition target');

        var targetState = stateConstructor.prototype;
        var sourceState = this.__state__;
        assert(targetState, 'undefined target state');

        // Close Cases
        if (targetState === sourceState) {
            exitState(this, sourceState);
            enterState(this, sourceState);
            return;
        }

        if (sourceState == targetState.__proto__){
            this.__state__ = targetState;
            enterState(this, targetState);
            return;
        }

        if (sourceState.__proto__ == targetState.__proto__){
            exitState(this, sourceState);
            this.__state__ = targetState;
            enterState(this, targetState);
            return;
        }

        if (sourceState.__proto__ == targetState){
            exitState(this, sourceState);
            this.__state__ = targetState;
            return;
        }

        // Source is a Parent of Target ?
        var s;
        var targetAncestors = [targetState];
        s = targetState.__proto__;
        for (;;) {
            if (s.__proto__ == State) break; //search miss
            targetAncestors.push(s);
            s = s.__proto__;
            if (s == sourceState){
                // Search hit
                while (!targetAncestors.isEmpty()){
                    s = targetAncestors.pop();
                    enterState(this, targetState);
                    this.__state__ = s;
                }
                return;
            }
        }

        // Target is a Parent of Source ?
        var sourceAncestors = [sourceState];
        s = sourceState.__proto__;
        for (;;) {
            if (s.__proto__ == State) break; //search miss
            sourceAncestors.push(s);
            s = s.__proto__;
            if (s == targetState){
                // Search hit
                for (var i = 0; i < sourceAncestors.length; ++i){
                    s = sourceAncestors[i];
                    this.__state__ = s;
                    exitState(this, targetState);
                }
                return;
            }
        }

        // Find least common ancestor
        var sourceLCAIndex = null;
        var targetLCAIndex = null;
        for (var j = 0; j < targetAncestors.length; ++j) {
            for (var k = 0; k < sourceAncestors.length; ++k){
                if (sourceAncestors[j] == targetAncestors[k]){
                    sourceLCAIndex = j;
                    targetLCAIndex = k;
                }
            }
        }

        for (j = 1; j < sourceLCAIndex; ++j){
            exitState(this, sourceAncestors[j]);
            this.__state__ = sourceAncestors[j];
        }
        k = targetLCAIndex;
        do {
            enterState(this, targetAncestors[k]);
            this.__state__ = targetAncestors[j];
            --k;
        } while (k != 0);

        // Drill down a non Leaf state
        while (this.__state__._initialState != null){
            enterState(this, this.__state__._initialState);
            this.__state__ = this.__state__._initialState;
        }
        enterState(this, this.__state__);
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

    function stateTrace(topState){
        function write(lev, state, lines){
            var text = '';
            if (lev > 0){
                var i = 0;
                for (; i < lev; ++i){
                    text += '   ';
                }
                text += '+- ';
                ++i;
            }
            if (lev == 0)
                text += ' - ';
            text += state.getStateName();
            if (state.__proto__._initialState == state)
                text += '*';
            lines.push(text);
            for (i = 0; i < state._subStates.length; ++i){
                write(lev + 1, state._subStates[i], lines);
            }
        }
        var l = [];
        write(0, topState.prototype, l);
        return l.join('\n') + '\n';
    }

    exports.DoesNotUnderstandError = DoesNotUnderstandError;
    exports.TransitionError = TransitionError;
    exports.NestedTransitionError = NestedTransitionError;
    exports.StateInitializationError = StateInitializationError;
    exports.state = state;
    exports.init = init;
    exports.stateTrace = stateTrace;

    return exports;
}

var fhsm = configure(typeof exports === 'undefined' ? this.fhsm = {} : exports);

// ----------------- cut here
// Test of the preliminary NON hierarchical state machine
//
//function MyObject() {
//    this.objName = 'Fabio';
//    this.objSurname = 'Filasieno';
//    fhsm.init(this, Main);
//}
//
//MyObject.prototype.setName = function (n, s) {
//    this.objName = n;
//    this.objSurname = s;
//};
//
//fhsm.debugMode = true;
//
function Main() {
    this.hey = function (e) {
        console.log(this.objName + ' ' + this.objSurname + ' says "hey" in state "' + this.getStateName() + '"');
    };

    this.moveTo = function (e, state) {
        this.send('hey');
        this.transition(state);
    };
}
function A() {
}
function B() {
}
function C() {
}
function D() {
}
function E() {
}
function F() {
}

fhsm.state(Main);
fhsm.state(A, Main);
fhsm.state(B, Main);
fhsm.state(C, A);
fhsm.state(D, A);
fhsm.state(E, B);
fhsm.state(F, B);
console.log(fhsm.stateTrace(Main));
//
//console.log(fhsm.stateTrace(Main));
//var obj = new MyObject;
////obj.send('moveTo', C);
//
//
//








