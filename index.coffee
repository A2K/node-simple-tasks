
if process.argv[2] == 'worker'

  process.on 'message', (task) ->
    try
      func = eval('(' + task.task + ')')
      args = eval('(' + task.args + ')')
      func args... , (result) ->
        process.send status: 'success', result: result
    catch e
      console.error 'child process exited by throwing exception:',e
      process.send status: 'error', error: e.toString()

else

  fork = require('child_process').fork

  class Queue
    constructor: () ->
      @tasks = []
      @worker = fork module.id, ['worker']
      @worker.on 'message', @handleWorkerMessage

    handleWorkerMessage: (result) =>
      if result.status == 'stopped'
        return @stopCallback?()
      if @tasks.length == 0
        return

      if result.status == 'success'
        @tasks[0].callback?(null, result.result)
      else
        @tasks[0].callback?(result.error, null)

      @tasks.shift()
      @runTask()

    push: (task, args..., callback) =>
      task = task: task, args: args, callback: callback
      @tasks.push task
      if @tasks.length == 1
        @runTask()

    runTask: () =>
      if @tasks.length > 0
        a = {task: @tasks[0].task.toString(), args: '[' + [a.toString() for a in @tasks[0].args].toString() + ']' }
        @worker.send a

    stop: (callback) =>
      @stopCallback = callback
      @worker.send 'stop'

  module.exports = new Queue()

