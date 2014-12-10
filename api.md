<a name="qwe"></a>
#qwe
asdasdasdasdasdasdasdasdasdasdasdasdasdasd

**Members**

* [qwe](#qwe)
  * [qwe~stateCreate(name, [parentState], [isFirstChild])](#qwe..stateCreate)
  * [callback: qwe~EventCallback](#qwe..EventCallback)

<a name="qwe..stateCreate"></a>
##qwe~stateCreate(name, [parentState], [isFirstChild])
Creates a new state.

**Params**

- name `State` - the of the state  
- \[parentState\] `State` - the parent state  
- \[isFirstChild\] `boolean` - true is the state is the first child of the parent state  

**Scope**: inner function of [qwe](#qwe)  
**Example**  
```jsvar Top = qwe.stateCreate('Top');var ParentRight = qwe.stateCreate('ParentRight', Top); // Implicitly selected as First childvar ParentLeft = qwe.stateCreate('ParentLeft', Top);```

**Example**  
```jsvar Top = qwe.stateCreate('Top');var ParentRight = qwe.stateCreate('ParentRight', Top, false); // Not a first child statevar ParentLeft = qwe.stateCreate('ParentLeft', Top);          // Selected as first child```

**Example**  
```jsvar Top = qwe.stateCreate('Top');var ParentRight = qwe.stateCreate('ParentRight', Top, false); // Not a first child statevar ParentLeft = qwe.stateCreate('ParentLeft', Top, true);    // Selected as first child, but ...var ParentMiddle = qwe.stateCreate('ParentLeft', Top, true);  // ... ParentMiddle overwrites ParentLeft as first child because of true flag```

<a name="qwe..EventCallback"></a>
##callback: qwe~EventCallback
The event callback is used to dispatch an event to a target Hierarchical state machine

**Params**

- target `object` - target object  
- event `string` - event tag  
- ...arg `*` - extra argument  

**Scope**: inner typedef of [qwe](#qwe)  
**Type**: `function`  
