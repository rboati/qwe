Here is a [Demo] of how the qwe Hierarchical state Machines work.


## Documentation NOT RELIABLE NOR COMPLETE. (Will be fixed soon max 3 days)


#Index

**Modules**

* [qwe](#module_qwe)
  * [qwe.dbgMode([isEnabled])](#module_qwe.dbgMode)
  * [qwe.dbgInspectState(state)](#module_qwe.dbgInspectState)
  * [qwe.state(name, [parentState], [isInitialState])](#module_qwe.state)
  * [qwe.init(obj, [state])](#module_qwe.init)

**Typedefs**

* [callback: EventCallback](#EventCallback)
* [type: DoesNotUnderstandError](#DoesNotUnderstandError)
* [type: State](#State)
* [type: StateMachine](#StateMachine)
  * [event: "enter"](#StateMachine#event_enter)
  * [event: "exit"](#StateMachine#event_exit)
  * [event: "error"](#StateMachine#event_error)
  * [event: "doesNotUnderstandError"](#StateMachine#event_doesNotUnderstandError)
* [type: NestedTransitionError](#NestedTransitionError)

<a name="module_qwe"></a>
#qwe
## QWE Module User Guide

### Introduction

Many software systems are event-driven, which means that they continuously wait for the occurrence of some
external or internal event such as a mouse click, a button press, a time tick, or an arrival of a data packet.
After recognizing the event, such systems react by performing the appropriate computation that may include
manipulating the hardware or generating “soft” events that trigger other internal software components.

Once the event handling is complete, the system goes back to waiting for the next event.
The response to an event generally depends on both the type of the event and on the internal state of th system
and can include a change of state leading to a state transition.
Libraries in Javascript are often designed as reactive systems; such libraries include on the client DOM/JQuery
and on the server node.js.

The pattern of events, states, and state transitions among those states can be abstracted and represented as a
__Hierarchical State Machine machine__ (*HSM* from now on).
The concept of a HSM is important in event-driven programming because it makes the __event handling explicitly
dependent on both the event-type and on the state of the system__, __unlike in Object oriented programming
where event handling depends only the the event type__ i.e. the method signature.

When used correctly, a state machine can [[Samek]](http://www.amazon.com/Practical-UML-Statecharts-Event-Driven-Programming/dp/0750687061):
   * drastically cut down the number of execution paths through the code
   * simplify the conditions tested at each branching point
   * simplify the switching between different modes

Conversely, using event-driven programming __without__ an underlying HSM model can lead programmers to produce code that is :
  * error prone
  * is difficult to extend
  * excessively complex and unmanagable

To understand this try thinking of developing a mission critical application where the system that must react
to *k event types* when the application can be in *h different states* and a mishandling of an event causes a
fatal system failure.

### The QWE Hierarchical State Machine Model

*todo*


#### Run to Completion

QWE assumes that a state machine completes processing of each event before it can start processing the next event.
This model of execution is called run to completion, or RTC.

Both __WebBrowsers__ and __Node.js__ in fact adopt is model, therefore no issues of multi-threading have to
be taken into consideration.

In the RTC model, the system processes events in discrete, indivisible RTC steps: new incoming events cannot interrupt
the processing of the current event.
These semantics completely avoid any internal concurrency issues within a single state machine.
The RTC model also gets around the conceptual problem of processing actions associated with transitions,
where the state machine is not in a well-defined state (is between two states) for the duration of the action.
During event processing, the system is unresponsive (unobservable),
so the ill-defined state during that time has no practical significance.

Note, however, that RTC does not mean that a state machine has to monopolize the CPU until the RTC step
is complete.[1] The preemption restriction only applies to the task context of the state machine that
is already busy processing events.
In a multitasking environment, other tasks (not related to the task context of the busy state machine)
can be running, possibly preempting the currently executing state machine. As long as other state machines
do not share variables or other resources with each other, there are no concurrency hazards.
The key advantage of RTC processing is simplicity. Its biggest disadvantage is that the responsiveness
of a state machine is determined by its longest RTC step.
Achieving short RTC steps can often significantly complicate real-time designs.

#### Key Components of a QWE Hierarchical State Machine
*todo*
##### Events
*todo*
##### States
*todo*
##### Actions
*todo*
##### Transitions
*todo*
##### Errors
*todo*

## QWE Name

QWE is designed to be easy to use; the author selected the name to match the first tree letters of the common
*QWERTY* keyboard such that users would find it easy to write the library name.
The QWE author suggests to pronounce QWE as 'queue'.

Happy Coding of robust software !

*Fabio N. Filasieno*

## QWE Module Reference Manual

**Author**: Fabio N. Filasieno
**License**: MIT
**Members**

* [qwe](#module_qwe)
  * [qwe.dbgMode([isEnabled])](#module_qwe.dbgMode)
  * [qwe.dbgInspectState(state)](#module_qwe.dbgInspectState)
  * [qwe.state(name, [parentState], [isInitialState])](#module_qwe.state)
  * [qwe.init(obj, [state])](#module_qwe.init)

<a name="module_qwe.dbgMode"></a>
##qwe.dbgMode([isEnabled])
__qwe__ works in two different modes.
   * __Debug mode__
   * __Production mode__

If a state is created in debug mode that all calls to the:
   * ___entry__ callback
   * ___exit__ callback
are traced by the __qwe__.

__todo__ describe tracing

**Params**

- \[isEnabled\] `boolean`

<a name="module_qwe.dbgInspectState"></a>
##qwe.dbgInspectState(state)
**Params**

- state <code>[State](#State)</code>

<a name="module_qwe.state"></a>
##qwe.state(name, [parentState], [isInitialState])
Create a new State

**Params**

- name `string` - The name of the state
- \[parentState\] <code>[State](#State)</code> - the state
- \[isInitialState\] `boolean` - set to true if the state is the __initial state__ of the parent state

**Example**
```js
var Top = qwe.state('Top');
var ParentRight = qwe.state('ParentRight', Top); // Implicitly selected as First child
var ParentLeft = qwe.state('ParentLeft', Top);
```

```js
var Top = qwe.state('Top');
var ParentRight = qwe.state('ParentRight', Top, false); // Not a first child state
var ParentLeft = qwe.state('ParentLeft', Top);          // Selected as first child
```

```js
var Top = qwe.state('Top');
var ParentRight = qwe.state('ParentRight', Top, false); // Not a first child state
var ParentLeft = qwe.state('ParentLeft', Top, true);    // Selected as first child, but ...
var ParentMiddle = qwe.state('ParentLeft', Top, true);  // ... ParentMiddle overwrites ParentLeft as first child because of true flag
```

<a name="module_qwe.init"></a>
##qwe.init(obj, [state])
asd asd asd asd

**Params**

- obj `object`
- \[state\] <code>[State](#State)</code>

<a name="EventCallback"></a>
#callback: EventCallback
Handler of events sent to any user *StateMachine*

**Params**

- event `string` - event tag
- ...arg `*` - extra argument

**Type**: `function`
<a name="DoesNotUnderstandError"></a>
#type: DoesNotUnderstandError
This error is sent when a *state machine*

**Properties**

- id <code>[State](#State)</code> - an ID.
- name `string` - your name.
- message `string` - your age.
- event `string` - your age.
- args `object` - your age.

**Type**: `object`
<a name="State"></a>
#type: State
represent a __qwe__ State

**Properties**

- name `string` - The name of the State
- initialState <code>[State](#State)</code> | `null` - null if the state is a leaf. If the state is a composite state, than it holds the __initial state__
- subStates `Array` - empty array if the state is a leaf. If the state is a composite state, than it holds a list of all the sub states
- entry <code>[EventCallback](#EventCallback)</code> - Called when the *HSM* enters the State
- exit <code>[EventCallback](#EventCallback)</code> - Called when the *HSM* exists the State
- error <code>[EventCallback](#EventCallback)</code> - Called when the *HSM* catches a unexpected error
- doesNotUnderstandError <code>[EventCallback](#EventCallback)</code> - Called when the *HSM* is requested to handle an event in a State that has no callback registered for that event

**Type**: `object`
<a name="StateMachine"></a>
#type: StateMachine
A *StateMachine* is any user object that has been initialized with the qwe.smInit function.

**Type**: `object`
<a name="NestedTransitionError"></a>
#type: NestedTransitionError
**Properties**

- name `string` - ''
- message `string`
- sourceState <code>[State](#State)</code>
- targetState <code>[State](#State)</code> - this.name = 'NestedTransitionError';
 this.message = "Transition was run to completion before another transition is requested; _enter/_exit must NOT request a transition";
 this.sourceState = sourceState;
 this.targetState = targetState;

**Type**: `object`





