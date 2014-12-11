##TODO

Here is a [Demo] of how Hierarchical state Machines work

### Programming by difference

State nesting lets you define a new state rapidly in terms of an old one, by reusing
the behavior from the parent state. State nesting allows new states to be specified by difference rather than created
from scratch each time and lets you get new behavior almost for free, reusing most of what is common from the superstates.
The fundamental character of state nesting comes from the combination of hierarchy and programming-by-difference,
which is otherwise known in software as inheritance. State nesting leads to behavioral inheritance something that can
hardly be attained just Objects.

### Automatic Entry/Exit action as controlled resource management

Hierarchical state machines allow states to have optional entry actions executed automatically
upon the entry to the state and exit actions executed upon the exit. The value of entry and exit
actions is that they provide means for guaranteed initialization and cleanup, much like class
constructors and destructors in OOP. Entry and exit actions are particularly important and powerful in conjunction
with the state hierarchy, because they determine the identity of the hierarchical states. The order of execution
of entry actions must always proceed from the outermost state to the innermost state. The execution of exit actions
proceeds in exact opposite order.

[Demo]:http://jsfiddle.net/filasienof/m53ob1q6/12/embedded/result/