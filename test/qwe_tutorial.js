
// # Qwe Tutorial

// ## Getting Started

// Let's start from a simple JS Object that we have just made up a user Object.
// It'll have a just __userId__ and __password__ field.
// It doesn't really matter how the object is build __qwe__, will work with any standard JS object.

function User(){
   this.userId = '';
   this.password = '';
}
User.prototype.toString = function(){ return '(' + this.userId + '/' + this.password + ')' };

var obj = new User();
console.log('User object fields: ' + Object.keys(obj));

// Output:
// ```
// User: (/)
// ```

// ## From objects to Hierarchical State Machines
//

// Ok now that we have an object we what to add some behaviour to it using __qwe__.
// Let's load-up __qwe__ and enable tracing.


var qwe = require('../src/qwe');
qwe.traceMode = true; //enable tracing

// Then we shall create a __State__ and initialize our object.

var Top = qwe.stCreate('Top');
qwe.smInit(obj, Top);
console.log('User object fields: ' + Object.keys(obj));

// Output:
// ```
// User object fields: userId,password,__behaviour__
// ```
// AS you can see know the object has new field attached to it called behaviour.

var currStateName = qwe.smGetStateName(obj);
console.log('Object current state is: ' + currStateName);
















