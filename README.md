# node-simple-tasks
Node.js module for executing functions in a separate process. Simple design depends only on Node.js core ensuring high compatibility with future versions.

Importing the module with `require()` creates a new worker process and returns it's task queue. Tasks are executed sequentially in same order they were scheduled. If you need more work queues, simply `require()` the module again.

Functions scheduled to the queue will run in the worker process context which is completely independent from the main thread. Functions and arguments are serialized to string when passed to the worker process, so you have to make sure that you only pass objects that can be serialized to string and back (functions can). Functions must be self-contained and only reference their own arguments. Arguments can be functions too, same restrinctions apply to them.

### Installation
`npm install simple-tasks`

### Usage
Each require('simple-stasks') call created a new worker thread and returns a task queue object for it:

*class*  **Queue**

&nbsp;&nbsp;&nbsp;&nbsp;*method*  **push**( `function`, `arg1`, `arg2`, ...)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Schedules `function` to be called with `arg1`, `arg2`, ... arguments in worker process context.
  
  
### Example
```javascript
var tasks = require('simple-tasks');

tasks.push(function() {
  console.log("This will be executed by a separate process!");
});
```
If the function which will run in worker process calls any other user functions, they may be passed to it as arguments. The only limitation is that all arguments must be self-contained.
```javascript
var tasks = require('simple-tasks');

function printArgument(arg) {
  console.log('argument: ' + arg);
}

function doStuff(printArgument) {
  printArgument('example');
}

tasks.push(doStuff, printArgument);
```
