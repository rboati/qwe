/**
 * @callback EventCallback
 *
 * @description The event callback is used to dispatch an event to a target Hierarchical state machine
 *
 * @param {object}  target   target object
 * @param {string}  event    event tag
 * @param {...*}    arg      extra argument
 * @memberOf qwe
 * @inner

 */

/**
 * asdasdasd
 * asdasdasd
 * asdasd
 * asdasd
 * asdasd
 * asdasd
 * @namespace qwe
 *
 */

function define(exportedArgs) {

    var exports = exportedArgs;

    /** asd asd
     *  @memberOf qwe
     *  @inner
     * */
    exports.traceMode = false;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Errors
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function errorToString() { return this.name + ': ' + this.message; }

    function DoesNotUnderstandError(state, event, args) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor); //Works only in Chrome and some other browsers
        this.state = state;
        this.name = 'DoesNotUnderstandError';
        this.message = "State '" + state._name + "' does not understand the '" + event + "' event";
        this.event = event;
        this.args = args;
    }
    exports.DoesNotUnderstandError.prototype.__proto__ = Error.prototype;
    exports.DoesNotUnderstandError.prototype.toString = errorToString;
    exports.DoesNotUnderstandError = DoesNotUnderstandError;

    exports.TransitionError = function TransitionError(message, sourceState, targetState, err) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this.name = 'TransitionError';
        this.message = "while moving from state '" + sourceState.getStateName() + "' to state '" + targetState.getStateName() + "': " + message;
        this.sourceState = sourceState;
        this.targetState = targetState;
        this.err = err;
    };
    TransitionError = exports.TransitionError;
    TransitionError.prototype.__proto__ = Error.prototype;
    TransitionError.prototype.toString = errorToString;

    exports.NestedTransitionError = function NestedTransitionError(sourceState, targetState) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this.name = 'NestedTransitionError';
        this.message = "Transition was run to completion before another transition is requested; _enter/_exit must NOT request a transition";
        this.sourceState = sourceState;
        this.targetState = targetState;
    };
    NestedTransitionError = exports.NestedTransitionError;
    NestedTransitionError.prototype.__proto__ = Error.prototype;
    NestedTransitionError.prototype.toString = errorToString;

    exports.AssertionError = function AssertionError(message) { //Local assertion definition to reduce dependencies
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message;
    };
    AssertionError = exports.AssertionError;
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
    exports.StateInitializationError = StateInitializationError;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // State
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    exports.State = function State(stateName, parentState) {
        this._name = stateName;
        this._initialState = null;
        this._subStates = [];
        this._error = this._error || function (e, err) { throw err; };
        this._doesNotUnderstand = this._doesNotUnderstand || function (o, e, evt, args) { throw new DoesNotUnderstandError(o.__behaviour__.state._name, evt, args); };

        if (exports.traceMode) {
            if (this._enter !== undefined) {
                var userDefinedEnter = this._enter;
                this._enter = function () {
                    this.__behaviour__.trace('enter ' + this.__behaviour__.state._name + '\n');
                    userDefinedEnter.call(this);
                }
            } else {
                this._enter = function () {
                    this.__behaviour__.trace('enter ' + this.__behaviour__.state._name + '\n');
                };
            }
        } else {
            this._enter = this._enter || function(){}
        }

        if (exports.traceMode) {
            if (this._exit !== undefined) {
                var userDefinedExit = this._exit;
                this._exit = function () {
                    userDefinedExit.call(this);
                    this.__behaviour__.trace('exit ' + this.__behaviour__.state._name + '\n');
                }
            } else {
                this._exit = function () {
                    this.__behaviour__.trace('exit ' + this.__behaviour__.state._name + '\n');
                };
            }
        } else {
            this._exit = this._exit || function(){}
        }

        if (parentState !== undefined)
            this.__proto__ = parentState;
    };
    State = exports.State;

    /** Creates a new state.
     * @memberOf qwe
     * @inner
     * @function
     * @param {State}    name          the of the state
     * @param {State=}   parentState   the parent state
     * @param {boolean=} isFirstChild  true is the state is the first child of the parent state
     *
     * @example
     * ```js
     * var Top = qwe.stateCreate('Top');
     * var ParentRight = qwe.stateCreate('ParentRight', Top); // Implicitly selected as First child
     * var ParentLeft = qwe.stateCreate('ParentLeft', Top);
     * ```
     *
     * @example
     * ```js
     * var Top = qwe.stateCreate('Top');
     * var ParentRight = qwe.stateCreate('ParentRight', Top, false); // Not a first child state
     * var ParentLeft = qwe.stateCreate('ParentLeft', Top);          // Selected as first child
     * ```
     *
     * @example
     * ```js
     * var Top = qwe.stateCreate('Top');
     * var ParentRight = qwe.stateCreate('ParentRight', Top, false); // Not a first child state
     * var ParentLeft = qwe.stateCreate('ParentLeft', Top, true);    // Selected as first child, but ...
     * var ParentMiddle = qwe.stateCreate('ParentLeft', Top, true);  // ... ParentMiddle overwrites ParentLeft as first child because of true flag
     * ```
     *
     */
    function stateCreate(name, parentState, isFirstChild) {
        if (parentState === undefined)
            parentState = State;
        if (isFirstChild === undefined)
            isFirstChild = null;

        var st = new State(name);

        return st;
    }
    exports.stateCreate = stateCreate;

    /**
     *
     * @param state
     * @param stateName
     */
    exports.stateSetFirstChild = function(state, stateName) {

    };

    /**
     *
     * @param state
     * @param stateName
     */
    exports.stateDelChild = function(state, stateName) {

    };


    exports.stateDelChild = function(parentState, state, isFirstChild) {

    };

    /**
     *
     *  @param {State} state
     */
    exports.stateInspect = function stateInspect(state) {

    };

    /**
     *
     *  @param   {State}  state
     *  @returns {string} the name of the state
     */

    exports.stateGetName = function(state) {
        return state._name;
    };

    /**
     *
     *  @param state
     *  @param name
     */
    exports.stateGetName = function(state, name) {
        state._name  = name;
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // State Machine Behaviour
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var Global = new State('Global');

    function Behaviour(){
        this.state = State;
        this.locked = false;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // State Machine Methods
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function enterState(obj, state) {
        if (obj.__behaviour__.locked)
            throw new TransitionError('Cannot execute a transition while entering a state', obj.__state__, state, new NestedTransitionError(obj.__state__, state));
        obj.__behaviour__.locked = true;
        try {
            obj.__behaviour__.state._enter.call(obj);
        } catch (err) {
            throw new TransitionError("An error was thrown by the '_enter' callback", obj.__state__, state, err);
        }
        obj.__behaviour__.locked = false;
    }

    function exitState(obj, state) {
        if (obj.__locked__)
            throw new TransitionError('Cannot execute a transition while exiting a state', obj.__state__, state, new NestedTransitionError(obj.__state__, state));
        obj.__behaviour__.locked = true;
        try {
            obj.__behaviour__.state._exit.call(obj);
        } catch (err) {
            throw new TransitionError("An error was thrown by the '_exit' callback", this.__state__, state, err);
        } finally {
            obj.__behaviour__.locked = false;
        }
    }

    /**
     *
     * @param {object} obj
     * @param {State}  state
     */
    exports.smInit = function(obj, state) {
        if (typeof obj !== 'object')
            throw new TypeError('obj argument must be an object');
        if (!(state instanceof State))
            throw new TypeError('obj argument must be an object');
        obj.__behaviour__ = new Behaviour(state);
        enterState(obj, state);
        obj.__behaviour__.state = state;
    };

    /**
     *
     * @param {object} obj
     * @returns {State}
     */
    exports.smGetState = function(obj) {
        return obj.__behaviour__.state;
    };

    /**
     *
     * @param obj
     * @returns {*}
     */
    exports.smGetStateName = function (obj) {
        return obj.__behaviour__.state._name;
    };

    /**
     *
     * @param obj
     * @param targetState
     */
    exports.smTran = function(obj, targetState) {
        assert(targetState.constructor instanceof State);
        var sourceState = this.__behaviour__.state;
        exitState(obj, sourceState);
        obj.__behaviour__.__state__ = targetState;
        enterState(obj, targetState);
    };

    /**
     *
     * @param obj
     * @param targetState
     */
    exports.smSend = function(obj, evt) {
        var f = obj.__behaviour__[e];
        if (f === undefined) {
            obj.__behaviour__.state._doesNotUnderstand.call(obj, '_doesNotUnderstand', e, arguments);
            return;
        }
        try {
            f.apply(obj, arguments);
        } catch (err) {
            obj.__behaviour__.state._error.call(obj, '_error', err, arguments);
        }
    };

    /**
     *
     * @param obj
     * @param args
     */
    exports.smRoute = function(obj, args) {
        obj.apply(obj, args);
    };


    return exports;
}

define(typeof exports === 'undefined' ? this.qwe = {} : exports);





