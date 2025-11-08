// Make sure there is a tools object
var tools = tools || {} // eslint-disable-line

;(function (tools) {
  /**
   * Register to get event notifications
   *
   * @param {mixed} event Event to listen for. '*' to listen for all events. Can also be an array of multiple events.
   * @param {*} listener
   * @param {*} context
   */
  function register (event, listener, context) {
    if (Array.isArray(event)) {
      event.forEach(e => this.register(e, listener, context))
      return
    }
    if (typeof this.events[event] !== 'object') {
      this.events[event] = []
    }
    this.events[event].push({
      listener: listener,
      context: context
    })
    return this
  }

  function unRegister (event, listener) {
    if (Array.isArray(event)) {
      event.forEach(e => this.unRegister(e, listener))
      return
    }
    if (typeof this.events[event] !== 'object') {
      return
    }
    this.events[event] = this.events[event].filter(function (l) {
      return l.listener !== listener
    })
    return this
  }

  function trigger (event) {
    const todos = Array.isArray(this.events['*']) ? this.events['*'].slice() : []
    if (Array.isArray(this.events[event])) {
      todos.push.apply(todos, this.events[event])
    }
    const listenerArguments = [].slice.call(arguments, 1)
    listenerArguments.push(event)
    todos.forEach(function (todo) {
      todo.listener.apply(todo.context || todo.listener, listenerArguments)
    })
    return this
  }

  const eventEmitterPrototype = {
    register: register,
    unRegister: unRegister,
    trigger: trigger
  }

  function eventEmitter (args) {
    const obj = Object.assign({
      events: []
    }, eventEmitterPrototype, args)
    return obj
  }

  tools.eventEmitter = eventEmitter
}(tools))
