/*  The MIT License
 *
 *  Copyright (c) 2011-2014 Fabio N.Filasieno  <fabio@filasieno.com>
 *
 *  Permission is hereby granted, free of charge, to any person obtaining
 *  a copy of this software and associated documentation files (the
 *  'Software'), to deal in the Software without restriction, including
 *  without limitation the rights to use, copy, modify, merge, publish,
 *  distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to
 *  the following conditions:
 *
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 *  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 *  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @callback EventCallback
 *
 * @description  Handler of events sent to any user *StateMachine*
 *
 * @param {string}  event    event tag
 * @param {...*}    arg      extra argument
 */

/**
 @typedef DoesNotUnderstandError
 @description This error is sent when a *state machine*
 @type {object}
 @property {State}  id       an ID.
 @property {string} name     your name.
 @property {string} message  your age.
 @property {string} event    your age.
 @property {object} args     your age.
 */

/**
 @description represent a __qwe__ State
 @typedef State
 @type {object}

 @property {string}        name                   The name of the State
 @property {State|null}    initialState           null if the state is a leaf. If the state is a composite state, than it holds the __initial state__
 @property {Array}         subStates              empty array if the state is a leaf. If the state is a composite state, than it holds a list of all the sub states
 @property {EventCallback} entry                  Called when the *HSM* enters the State
 @property {EventCallback} exit                   Called when the *HSM* exists the State
 @property {EventCallback} error                  Called when the *HSM* catches a unexpected error
 @property {EventCallback} doesNotUnderstandError Called when the *HSM* is requested to handle an event in a State that has no callback registered for that event
 */

/**
 @typedef StateMachine
 @type {object}
 @description A *StateMachine* is any user object that has been initialized with the qwe.smInit function.
 @see qwe.hsmInit
 */

/**
 @typedef NestedTransitionError
 @type {object}
 @property {string} name       ''
 @property {string} message
 @property {State} sourceState
 @property {State} targetState

 this.name = 'NestedTransitionError';
 this.message = "Transition was run to completion before another transition is requested; _enter/_exit must NOT request a transition";
 this.sourceState = sourceState;
 this.targetState = targetState;
 */


/**
 * @description An event that is fired when a {StateMachine} enter a {State}.
 *
 * @event StateMachine#enter
 */

/**
 * @description An event that is fired when a {StateMachine} exists a {State}
 *
 * @event StateMachine#exit
 */

/**
 * @description An event that is fired when a {StateMachine} throws an uncaught error from an EventCallback
 *
 * @event StateMachine#error
 */

/**
 * @description An event that is fired when a {StateMachine} is requested to handle an event in a State that
 *              has callback registered for that event name
 *
 * @event StateMachine#doesNotUnderstandError
 */

function define(exportedArgs) {

    /**
     * ## QWE Module User Guide
     *
     * ### Introduction
     *
     * Many software systems are event-driven, which means that they continuously wait for the occurrence of some
     * external or internal event such as a mouse click, a button press, a time tick, or an arrival of a data packet.
     * After recognizing the event, such systems react by performing the appropriate computation that may include
     * manipulating the hardware or generating “soft” events that trigger other internal software components.
     *
     * Once the event handling is complete, the system goes back to waiting for the next event.
     * The response to an event generally depends on both the type of the event and on the internal state of th system
     * and can include a change of state leading to a state transition.
     * Libraries in Javascript are often designed as reactive systems; such libraries include on the client DOM/JQuery
     * and on the server node.js.
     *
     * The pattern of events, states, and state transitions among those states can be abstracted and represented as a
     * __Hierarchical State Machine machine__ (*HSM* from now on).
     * The concept of a HSM is important in event-driven programming because it makes the __event handling explicitly
     * dependent on both the event-type and on the state of the system__, __unlike in Object oriented programming
     * where event handling depends only the the event type__ i.e. the method signature.
     *
     * When used correctly, a state machine can [[Samek]](http://www.amazon.com/Practical-UML-Statecharts-Event-Driven-Programming/dp/0750687061):
     *    * drastically cut down the number of execution paths through the code
     *    * simplify the conditions tested at each branching point
     *    * simplify the switching between different modes
     *
     * Conversely, using event-driven programming __without__ an underlying HSM model can lead programmers to produce code that is :
     *   * error prone
     *   * is difficult to extend
     *   * excessively complex and unmanagable
     *
     * To understand this try thinking of developing a mission critical application where the system that must react
     * to *k event types* when the application can be in *h different states* and a mishandling of an event causes a
     * fatal system failure.
     *
     * ### The QWE Hierarchical State Machine Model
     *
     * *todo*
     *
     *
     * #### Run to Completion
     *
     * QWE assumes that a state machine completes processing of each event before it can start processing the next event.
     * This model of execution is called run to completion, or RTC.
     *
     * Both __WebBrowsers__ and __Node.js__ in fact adopt is model, therefore no issues of multi-threading have to
     * be taken into consideration.
     *
     * In the RTC model, the system processes events in discrete, indivisible RTC steps: new incoming events cannot interrupt
     * the processing of the current event.
     * These semantics completely avoid any internal concurrency issues within a single state machine.
     * The RTC model also gets around the conceptual problem of processing actions associated with transitions,
     * where the state machine is not in a well-defined state (is between two states) for the duration of the action.
     * During event processing, the system is unresponsive (unobservable),
     * so the ill-defined state during that time has no practical significance.
     *
     * Note, however, that RTC does not mean that a state machine has to monopolize the CPU until the RTC step
     * is complete.[1] The preemption restriction only applies to the task context of the state machine that
     * is already busy processing events.
     * In a multitasking environment, other tasks (not related to the task context of the busy state machine)
     * can be running, possibly preempting the currently executing state machine. As long as other state machines
     * do not share variables or other resources with each other, there are no concurrency hazards.
     * The key advantage of RTC processing is simplicity. Its biggest disadvantage is that the responsiveness
     * of a state machine is determined by its longest RTC step.
     * Achieving short RTC steps can often significantly complicate real-time designs.
     *
     * #### Key Components of a QWE Hierarchical State Machine
     * *todo*
     * ##### Events
     * *todo*
     * ##### States
     * *todo*
     * ##### Actions
     * *todo*
     * ##### Transitions
     * *todo*
     * ##### Errors
     * *todo*
     *
     * ## QWE Name
     *
     * QWE is designed to be easy to use; the author selected the name to match the first tree letters of the common
     * *QWERTY* keyboard such that users would find it easy to write the library name.
     * The QWE author suggests to pronounce QWE as 'queue'.
     *
     * Happy Coding of robust software !
     *
     * *Fabio N. Filasieno*
     *
     * ## QWE Module Reference Manual
     * @exports qwe
     * @author Fabio N. Filasieno
     * @license MIT
     */
    var exports = exportedArgs;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Errors
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function errorToString() { return this.name + ': ' + this.message; }

    function DoesNotUnderstandError(state, event, args) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor); //Works only in Chrome and some other browsers
        this.state = state;
        this.message = "State '" + state.name + "' does not understand the '" + event + "' event";
        this.event = event;
        this.args = args;
    }
    DoesNotUnderstandError.prototype.__proto__ = Error.prototype;
    DoesNotUnderstandError.prototype.toString  = errorToString;
    DoesNotUnderstandError.prototype.name      = DoesNotUnderstandError.prototype.constructor.name;
    exports.DoesNotUnderstandError = DoesNotUnderstandError;

    function TransitionError(message, sourceState, targetState, err) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);

        this.message = "while moving from state '" + sourceState.name + "' to state '" + targetState.name + "': " + message;
        this.sourceState = sourceState;
        this.targetState = targetState;
        this.err = err;
    }
    TransitionError.prototype.__proto__ = Error.prototype;
    TransitionError.prototype.toString = errorToString;
    TransitionError.prototype.name = TransitionError.prototype.constructor.name;
    exports.TransitionError = TransitionError;

    function NestedTransitionError(sourceState, targetState) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);

        this.message = "Transition was run to completion before another transition is requested; _enter/_exit must NOT request a transition";
        this.sourceState = sourceState;
        this.targetState = targetState;
    }
    NestedTransitionError.prototype.__proto__ = Error.prototype;
    NestedTransitionError.prototype.toString = errorToString;
    NestedTransitionError.prototype.name = NestedTransitionError.prototype.constructor.name;
    exports.NestedTransitionError = NestedTransitionError;

    function AssertionError(message) { //Local assertion definition to reduce dependencies
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);

        this.message = message;
    }
    AssertionError.prototype.__proto__ = Error.prototype;
    AssertionError.prototype.toString = errorToString;
    AssertionError.prototype.name = AssertionError.prototype.constructor.name;
    exports.AssertionError = AssertionError;

    function assert(contidition, message) {
        if (!contidition)
            throw new AssertionError(message);
    }

    function StateInitializationError(message) {
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
        this.message = message;
    }
    StateInitializationError.prototype.__proto__ = Error.prototype;
    StateInitializationError.prototype.toString = errorToString;
    StateInitializationError.prototype.name = StateInitializationError.prototype.constructor.name;
    exports.StateInitializationError = StateInitializationError;


    var debugMode = false;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Tracing
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * __qwe__ works in two different modes.
     *    * __Debug mode__
     *    * __Production mode__
     *
     * If a state is created in debug mode that all calls to the:
     *    * ___entry__ callback
     *    * ___exit__ callback
     * are traced by the __qwe__.
     *
     * __todo__ describe tracing
     *
     * @param {boolean=} [isEnabled]
     */
    exports.dbgMode = function(isEnabled){
        if (isEnabled === undefined) {
            return debugMode;
        }
        assert(typeof isEnabled == 'boolean');
        debugMode = isEnabled;
        return debugMode;
    };

    /**
     *
     *  @param {State} state
     */
    exports.dbgInspectState = function(topState) {
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
            text += state.name;
            if (state.__proto__.initialState == state)
                text += '*';
            lines.push(text);
            for (i = 0; i < state.subStates.length; ++i){
                write(lev + 1, state.subStates[i], lines);
            }
        }
        var l = [];
        write(0, topState, l);
        return l.join('\n') + '\n';
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // State
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function State(stateName, parentState) {
        this.name = stateName;
        this.initialState = null;
        this.subStates = [];
        this.error = function (e, err) { throw err; };
        this.doesNotUnderstandError = function (evt, e, args) { throw new DoesNotUnderstandError(this.dispatch.state.name, e, args); };

        if (parentState !== undefined) {
            this.trace = parentState.trace || function(){};
        } else {
            if (exports.dbgMode){
                this.trace = function(){ console.log(arguments); }
            } else {
                this.trace = function(){}
            }
        }
        if (exports.dbgMode) {
            this.enter = function () {
                this.hsm.state.trace.call(this, 'enter ' + this.hsm.state.name);
            };
        } else {
            this.enter = function(){}
        }

        if (exports.dbgMode) {
            this.exit = function () {
                this.hsm.state.trace.call(this, 'exit ' + this.hsm.state.name);
            };
        } else {
            this.exit = function(){}
        }

        if (parentState !== undefined)
            this.__proto__ = parentState;
    }
    exports.State = State;
    State.prototype = new State('Root');
    exports.Root = State.prototype;
    var Root = State.prototype;

    function hasSubState(state, subStateName){
        var len = state.subStates.length;
        for (var i = 0; i < len; ++i){
            if (state.subStates === undefined){
                assert(state.subStates !== undefined);
            }
            if (state.subStates[i].name == subStateName)
                return true;
        }
        return false;
    }

    /**
     * @description Create a new State
     * @param {string}   name            The name of the state
     * @param {State=}   parentState     the state
     * @param {boolean=} isInitialState  set to true if the state is the __initial state__ of the parent state
     * @example
     * ```js
     * var Top = qwe.state('Top');
     * var ParentRight = qwe.state('ParentRight', Top); // Implicitly selected as First child
     * var ParentLeft = qwe.state('ParentLeft', Top);
     * ```
     *
     * ```js
     * var Top = qwe.state('Top');
     * var ParentRight = qwe.state('ParentRight', Top, false); // Not a first child state
     * var ParentLeft = qwe.state('ParentLeft', Top);          // Selected as first child
     * ```
     *
     * ```js
     * var Top = qwe.state('Top');
     * var ParentRight = qwe.state('ParentRight', Top, false); // Not a first child state
     * var ParentLeft = qwe.state('ParentLeft', Top, true);    // Selected as first child, but ...
     * var ParentMiddle = qwe.state('ParentLeft', Top, true);  // ... ParentMiddle overwrites ParentLeft as first child because of true flag
     * ```
     * @throw TypeError
     * @throw StateInitializationError
     */
    exports.state = function(name, parentState, isInitialState) {
        if (typeof name != 'string'){
            throw new TypeError("name is not a string");
        }
        if (parentState === undefined)
            return new State(name);

        if (!(parentState instanceof State)){
            throw new TypeError("parentState is not a state");
        }
        var parentSubStates    = parentState.subStates;
        var parentInitialState = parentState.initialState;
        assert(parentSubStates instanceof Array);

        if (hasSubState(parentState, name))
            throw new StateInitializationError("State '" + name + "' is already stored in parentState");

        var state = new State(name, parentState);
        if (isInitialState == true) {
            // Force Initial State Setup; don't care of current initial state
            parentSubStates.push(state);
            parentState.initialState = state;
            return state;
        } else if (isInitialState === undefined) {
            parentSubStates.push(state);
            if (parentInitialState == null)
                parentState.initialState = state;
            return state;
        } else if (typeof isInitialState != 'boolean') {
            throw new TypeError('isInitialState must be a boolean');
        } else {
            // else if false, don't set the initial state
            parentSubStates.push(state);
            return state;
        }
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // State Machine Methods
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function TransitionTerminationError(){
    }
    TransitionTerminationError.prototype = new TransitionTerminationError;
    TransitionTerminationError.prototype.name = TransitionTerminationError.prototype.constructor.name;
    TransitionTerminationError.prototype.message = 'obj.qwe.tran should not be called out of an EventCallback';
    exports.TransitionTerminatedError = TransitionTerminationError;
    var tre = TransitionTerminationError.prototype;

    function EventBufferOverflowError(){
    }
    EventBufferOverflowError.prototype = new EventBufferOverflowError;
    EventBufferOverflowError.prototype.name = EventBufferOverflowError.prototype.constructor.name;
    EventBufferOverflowError.prototype.message = 'Maximum number of self sends (4) reached';
    exports.MessageDispatchError = EventBufferOverflowError;
    var mde = EventBufferOverflowError.prototype;

    function Behaviour(obj, state){
        this.isDispatching = false;
        this.eventBuffer   = [null, null, null, null];
        this.eventIndex = 0;
        this.obj = obj;
        this.state = state;
        this.locked = false;
        this.previousState = Root;
        this.stateChangedCallback = function(){};
        this.trace = function() {
            // this = Behaviour
            this.state.trace.apply(this.obj, arguments);
        }
    }

    Behaviour.prototype.send = function(evt){
        if (this.isDispatching){
            if (this.eventBuffer[this.eventIndex] != null){
                throw new mde;
            }
            this.eventBuffer[this.eventIndex++] = arguments;
            if (this.eventIndex == 4){
                this.eventIndex = 0;
            }
            return;
        } else {
            this.isDispatching = true;
        }
        var f = this.state[evt];
        if (f === undefined) {
            this.state.doesNotUnderstandError.call(this.obj, 'doesNotUnderstandError', evt, arguments);
            return;
        }
        try {
            f.apply(this.obj, arguments);
        } catch (err) {
            if (err != tre) {
                this.state.error.call(this.obj, 'error', err, evt, arguments);
            } else {
                this.stateChangedCallback.call(this.obj, this.previousState, this.state);
            }
        } finally {
            this.isDispatching = false;
        }

        for (;;) {
            var prev = this.eventIndex - 1;
            if (prev == -1){
                prev = 3;
            }
            var message = this.eventBuffer[prev];
            if (message != null){
                this.send(message);
                this.eventIndex = prev;
                // continue
            } else {
                break;
            }
        }
    };

    /**
     * Transitions an HSM to another state.
     *
     * @param {State}  ts the state machine target state
     *
     * @trows TransitionError
     */
    Behaviour.prototype.tran = function(t){
        this.previousState = this.state;
        assert(t instanceof State);
        var s = this.state;
        // Self Transition
        if (t == s){
            this.exitState(t);
            this.enterState(t);
            throw tre;
        }
        // To Direct Parent
        if (t == s.__proto__){
            this.exitState(t);
            this.state = t;
            this.drillDown();
            throw tre;
        }

        // To Same Parent
        if (t.__proto__ == s.__proto__){
            this.exitState(t);
            this.state = t;
            this.enterState(t);
            this.drillDown();
            throw tre;
        }

        // To Direct Ancestor
        var sourceAncestor = [];
        var state = s;
        for (;;) {
            if (state == Root) break; //search miss
            sourceAncestor.push(state);
            state = state.__proto__;
            if (state == t){
                // Search hit
                for (var i = 0; i < sourceAncestor.length; ++i){
                    state = sourceAncestor[i];
                    this.exitState(t);
                    this.state = state.__proto__;
                }
                this.drillDown();
                throw tre;
            }
        }

        //Full Least Common Ancestor Search
        sourceAncestor.push(Root);
        var enterPath = [t];
        state = t.__proto__;
        for (;;) {
            var idx = sourceAncestor.indexOf(state);
            if (idx == -1) {
                enterPath.push(state);
                state = state.__proto__;
            } else {
                break;    
            }
        }

        //Found the LCA, stored in state
        //Execute EXIT
        for (;;){
            this.exitState(t);
            this.state = this.state.__proto__;
            if (this.state == state)
                break;
        }

        //Execute ENTRY
        while (enterPath != 0){
            this.state = enterPath.pop();
            this.enterState(t);
        }

        //Execute
        this.drillDown();
        throw tre;
    };

    Behaviour.prototype.enterState = function(state){
        if (this.locked)
            throw new TransitionError(
                'Fatal Error: Cannot execute a transition while entering a state',
                this.state, state, new NestedTransitionError(this.state, state));
        this.locked = true;
        try {
            this.state.enter.call(this.obj, 'enter');
        } catch (err) {
            throw new TransitionError("Fatal Error: An error was thrown by the 'enter' callback: " + err.name + ' ' + err.message, this.state, state, err);
        } finally {
            this.locked = false;
        }
    };

    Behaviour.prototype.exitState = function(state){
        if (this.locked)
            throw new TransitionError('Cannot execute a transition while exiting a state', this.state, state, new NestedTransitionError(this.state, state));
        this.locked = true;
        try {
            this.state.exit.call(this.obj, 'exit');
        } catch (err) {
            throw new TransitionError("An error was thrown by the '_exit' callback", this.state, state, err);
        } finally {
            this.locked = false;
        }
    };

    Behaviour.prototype.drillDown = function(){
        for (;;){
            var initialState = this.state.initialState;
            if (initialState == null) break;
            this.state = initialState;
            this.enterState(initialState);
        }
    };
    /**
     * @description asd asd asd asd
     * @param {object}  obj
     * @param {State=}  state
     */
    exports.init = function(obj, state, stateChangedCallback) {
        if (typeof obj !== 'object')
            throw new TypeError('obj argument must be an object type');
        if (!(state instanceof State))
            throw new TypeError('state argument must be an instanceof State');
        if (!(state.__proto__.name == 'Root'))
            throw new TypeError('state must be a top state instead state has as parent: ' + state.__proto__.name);

        var hsm = new Behaviour(obj, state);
        obj.hsm = hsm;
        hsm.enterState(state);
        hsm.drillDown();
        obj.hsm.previousState = hsm.state;
        if (stateChangedCallback !== undefined) {
            obj.hsm.stateChangedCallback = stateChangedCallback;
        }
    };

    return exports;
}

define(typeof exports === 'undefined' ? this.qwe = {} : exports);
