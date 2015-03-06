// Generated by CoffeeScript 1.8.0
(function() {
  var Queue, fork,
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (process.argv[2] === 'worker') {
    process.on('message', function(task) {
      var args, e, func;
      try {
        func = eval('(' + task.task + ')');
        args = eval('(' + task.args + ')');
        return func.apply(null, __slice.call(args).concat([function(result) {
          return process.send({
            status: 'success',
            result: result
          });
        }]));
      } catch (_error) {
        e = _error;
        console.error('child process exited by throwing exception:', e);
        return process.send({
          status: 'error',
          error: e.toString()
        });
      }
    });
  } else {
    fork = require('child_process').fork;
    Queue = (function() {
      function Queue() {
        this.stop = __bind(this.stop, this);
        this.runTask = __bind(this.runTask, this);
        this.push = __bind(this.push, this);
        this.handleWorkerMessage = __bind(this.handleWorkerMessage, this);
        this.tasks = [];
        this.worker = fork(module.id, ['worker']);
        this.worker.on('message', this.handleWorkerMessage);
      }

      Queue.prototype.handleWorkerMessage = function(result) {
        if (result.status === 'stopped') {
          return typeof this.stopCallback === "function" ? this.stopCallback() : void 0;
        }
        if (this.tasks.length === 0) {
          return;
        }
        if (result.status === 'success') {
          this.tasks[0].callback(null, result.result);
        } else {
          this.tasks[0].callback(result.error, null);
        }
        this.tasks.shift();
        return this.runTask();
      };

      Queue.prototype.push = function() {
        var args, callback, task, _i;
        task = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), callback = arguments[_i++];
        task = {
          task: task,
          args: args,
          callback: callback
        };
        this.tasks.push(task);
        if (this.tasks.length === 1) {
          return this.runTask();
        }
      };

      Queue.prototype.runTask = function() {
        var a;
        if (this.tasks.length > 0) {
          a = {
            task: this.tasks[0].task.toString(),
            args: '[' + [
              (function() {
                var _i, _len, _ref, _results;
                _ref = this.tasks[0].args;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  a = _ref[_i];
                  _results.push(a.toString());
                }
                return _results;
              }).call(this)
            ].toString() + ']'
          };
          return this.worker.send(a);
        }
      };

      Queue.prototype.stop = function(callback) {
        this.stopCallback = callback;
        return this.worker.send('stop');
      };

      return Queue;

    })();
    module.exports = new Queue();
  }

}).call(this);
