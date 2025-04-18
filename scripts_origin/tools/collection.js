// Make sure there is a tools object
var tools = tools || {} // eslint-disable-line

;(function (tools) {
  function add (item) {
    if (this._items.find(function (i) {
      return i === item
    })) {
      return this
    }
    this._items.push(item)
    this.trigger('add', item)
    return this
  }

  function addMany (items) {
    if (!Array.isArray(items)) {
      throw new TypeError('\'items\' must be an array')
    }
    for (const i in items) {
      this.add(items[i])
    }
    return this
  }

  /**
   * Replace item(s) with other items. This function does only trigger an 'update'-
   * event, no 'delete' or 'add', even if that is what it actually does.
   * @param  {object|function} oldItem    The item to replace, or a function to determine what items to replace
   * @param  {object} newItem             The new item
   * @return {object}                     Self reference
   */
  function replace (oldItem, newItem) {
    if (typeof oldItem === 'function') {
      this._items.filter(oldItem).forEach(function (item) {
        removeObj.call(this, item, true)
      }.bind(this))
    } else {
      removeObj.call(this, oldItem, true)
    }
    if (!this._items.find(function (i) { return i === newItem })) {
      this._items.push(newItem)
    }
    this.trigger('update', newItem)
    return this
  }

  /**
   * Replaces the entire list with the new one. Items that exist in both list
   * is sent an 'update' event. The others 'add' or 'removed'.
   * @param {object[]} newItems        List with new items
   * @param {function} [equalityCheck]   Optional equality function
   */
  function replaceAll (newItems, equalityCheck) {
    const equal = (typeof equalityCheck === 'function' ? equalityCheck : function (a, b) { return a === b })
    const add = newItems.filter(function (i1) {
      return !this._items.find(function (i2) { return equal(i1, i2) })
    }.bind(this))
    const remove = this._items.filter(function (i1) {
      return !newItems.find(function (i2) { return equal(i1, i2) })
    })
    this.removeMany(remove)
    const update = newItems.filter(function (i1) {
      return this._items.find(function (i2) { return equal(i1, i2) })
    }.bind(this))
    for (const i in update) {
      this.replace(function (j) { return equal(update[i], j) }, update[i])
    }
    this.addMany(add)
    return this
  }

  function remove (item) {
    if (typeof item === 'function') {
      removeFunc.call(this, item)
    } else {
      removeObj.call(this, item)
    }
    return this
  }

  function removeMany (items) {
    if (!Array.isArray(items)) {
      throw new TypeError('\'items\' must be an array')
    }
    for (const i in items) {
      this.remove(items[i])
    }
    return this
  }

  function removeFunc (func) {
    let found
    do {
      found = this._items.find(func)
      if (found) removeObj.call(this, found)
    } while (found)
  }

  function removeObj (item, inhibitEvent) {
    const lengthBefore = this._items.length
    let i = this._items.indexOf(item)
    while (i >= 0) {
      this._items.splice(i, 1)
      i = this._items.indexOf(item)
    }
    if (lengthBefore === this._items.length) {
      return
    }
    if (!inhibitEvent) {
      this.trigger('remove', item)
    }
  }

  function clear () {
    const oldItems = this._items.splice(0, this._items.length)
    const self = this
    oldItems.forEach(function (items) {
      self.trigger('remove', items)
    })
    return this
  }

  function items () {
    return this._items
  }

  function filter (filterFunc) {
    if (typeof filterFunc !== 'function') {
      throw new TypeError('\'filterFunc\' must be a function')
    }
    return filteredCollection({
      filterFunc: filterFunc,
      sourceCollection: this
    })
  }

  const collectionPrototype = {
    add: add,
    addMany: addMany,
    filter: filter,
    items: items,
    remove: remove,
    removeMany: removeMany,
    replace: replace,
    replaceAll: replaceAll,
    clear: clear
  }

  function collection (args) {
    const obj = Object.assign({
      _items: []
    }, collectionPrototype, args, tools.eventEmitter())
    return obj
  }

  const filteredCollectionPrototype = {
  }

  function filteredCollection (args) {
    const obj = Object.assign({
      items: function () {
        return obj.sourceCollection.items().filter(obj.filterFunc)
      }
    }, filteredCollectionPrototype, args, tools.eventEmitter())

    obj.sourceCollection.register('*', function (item, event) {
      if (!obj.filterFunc(item)) {
        return
      }
      obj.trigger(event, item)
    })

    return obj
  }

  tools.collection = collection
}(tools))
