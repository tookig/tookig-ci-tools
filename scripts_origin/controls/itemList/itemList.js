/* global $, dialogs */

// Make sure there is a controls object
var controls = controls || {}; // eslint-disable-line

(function (controls) {
  // Counter for saving item references
  let iid = 1

  /**
   * Creates an object list control
   * @param {Object[]} args                           Object list options
   * @param {Object[]} args.columns                   Information on the columns to be shown in the list
   * @param {string}   args.columns.name              The name (or index) of the item as it is stored
   *                                                  in the object.
   * @param {Object}   args.columns.header            The header text to use for this column
   * @param {Object}   args.columns.formatter         The formatter to use for this column
   * @param {Object}   args.columns.sortable          If this column should be sortable via the sortBy parameter in the load function
   * @param {function} args.load                      Callback that returns an object with two members,
   *                                                  or a Promise for this object;
   *                                                    items - An array with items to show in list
   *                                                    total - Total number of staff (for pagination settings)
   * @param {function} args.save                      Callback for saving an item. Return true to end edit mode, false if save
   *                                                  was unsuccessfull, or a Promise returning true/false.
   * @param {function} args.delete                    Callback for deleting an item. Return true if item was deleted, false if delete
   *                                                  was unsuccessfull, or a Promise returning true/false.
   * @param {Object}   args.lang                      Translations for the item list texts.
   */
  function itemList (args) {
    // Set default values for the args
    const iargs = Object.assign({
      columns: [],
      load: function (args) { return [] },
      pagination: Object.assign({
        startIndex: parseInt(window.sessionStorage.getItem(window.location.pathname + '/itemList.startIndex'), 10) || 0,
        maxCount: parseInt(window.sessionStorage.getItem(window.location.pathname + '/itemList.maxCount'), 10) || 20,
        sortBy: window.sessionStorage.getItem(window.location.pathname + '/itemList.sortBy') || false,
        sortOrder: window.sessionStorage.getItem(window.location.pathname + '/itemList.sortOrder') || 'asc',
        search: false // window.sessionStorage.getItem(window.location.pathname + '/itemList.search') || false
      }, args.pagination),
      lang: {
        add: 'Add',
        search: 'Search',
        save: 'Save',
        edit: 'Edit',
        cancel: 'Cancel',
        delete: 'Delete',
        'confirm-delete': 'Confirm you would like to delete this item?'
      }
    }, args)
    // Create list object
    const list = {
      args: iargs,
      header: header,
      footer: footer,
      update: update,
      insert: insert,
      load: load,
      create: create,
      _itemDOMObjectReferences: [],
      getItemFromIID: getItemFromIID
    }
    // Make sure sortBy exists as item
    if (!args.columns.find(function (column) { return column.name === list.args.pagination.sortBy })) {
      list.args.pagination.sortBy = false
    }
    // Return list
    return list
  }

  function create () {
    this.element = $('<table></table>').addClass('item-list-control')
    // List items header
    this.header()
    // List items container
    $('<tbody></tbody>').addClass('item-list-items').appendTo(this.element)
    // Footer
    this.footer()
    // Load content
    this.load()
    return this
  }

  function header () {
    const theader = $('<tbody></tbody>').addClass('item-list-header').appendTo(this.element)
    const tr = $('<tr></tr>').appendTo(theader)
    this.args.columns.forEach(function (column) {
      $('<th></th>').append(
        $('<span></span>').text(column.header)
      ).append(
        $('<span></span>').addClass('ui-icon ui-icon-triangle-1-s item-list-control-asc')
      ).append(
        $('<span></span>').addClass('ui-icon ui-icon-triangle-1-n item-list-control-desc')
      ).addClass(
        column.sortable ? 'sortable' : 'not-sortable'
      ).attr('data-sort-by', column.name).attr('data-sort-order', 'none').appendTo(tr)
    })
    $('<th></th>').addClass('not-sortable item-list-action-cell').appendTo(tr)
    // Header clicks
    tr.find('th.sortable').click(headerClick.bind(this))
    return theader
  }

  function footer () {
    // List footer
    const navTbody = $('<tbody></tbody>').addClass('item-list-footer').appendTo(this.element)
    $('<tr></tr>').addClass('item-list-actions').appendTo(navTbody).append(
      $('<td></td>').attr('colspan', this.args.columns.length).append(
        $('<button></button>').text(this.args.lang.add).button({ icon: 'ui-icon-plus' }).click(newCallback.call(this))
      ).append(
        $('<input></input>').attr('type', 'search').attr('placeholder', this.args.lang.search)
          .addClass('item-list-search-text')
          .change(function (e) {
            this.args.pagination.search = $(e.target).val() || false
            this.args.pagination.startIndex = 0
            this.load()
          }.bind(this))
      )
    )
    $('<tr></tr>').addClass('item-list-pagination').appendTo(navTbody).append(
      $('<td></td>').attr('colspan', this.args.columns.length)
    )
    return navTbody
  }

  function load () {
    const loadArgs = Object.keys(this.args.pagination).reduce((object, key) => {
      if (this.args.pagination[key] !== false) {
        object[key] = this.args.pagination[key]
      }
      return object
    }, {})
    Promise.resolve(this.args.load(loadArgs)).then(data => {
      this.element.find('tbody.item-list-items').empty()
      this._itemDOMObjectReferences = []
      if (data.items) {
        data.items.forEach(item => {
          const tr = this.insert(item)
          this.update(tr, item)
        })
      }
      updatePagination.call(this, data.count)
      this.element.removeClass('item-list-editing')
    })
  }

  function insert (item) {
    const trid = iid++
    const tr = $('<tr></tr>').attr('data-iid', trid)
    this.args.columns.forEach(function (column) {
      $('<td></td>').attr('data-name', column.name).appendTo(tr)
    })
    $('<td></td>').addClass('item-list-action-cell')
      .append(
        $('<div></div>').addClass('item-list-edit-item').button({ icon: 'ui-icon-pencil' }).click(editCallback.call(this, tr))
      )
      .append(
        $('<div></div>').addClass('item-list-delete-item').button({ icon: 'ui-icon-trash' }).click(deleteCallback.call(this, tr))
      )
      .appendTo(tr)
    this.element.find('tbody.item-list-items').first().append(tr)
    this._itemDOMObjectReferences.push({
      iid: trid,
      tr: tr,
      item: item
    })
    return tr
  }

  function update (tr, item) {
    this.args.columns.forEach(function (column) {
      let rendered = ''
      if (column.formatter) {
        rendered = column.formatter.render(item ? item[column.name] : undefined, item)
      }
      tr.find('td[data-name=\'' + column.name + '\']').empty().append(rendered)
    })
    const iRefItem = this._itemDOMObjectReferences.find(iRef => iRef.iid === parseInt(tr.attr('data-iid'), 10))
    if (iRefItem) {
      iRefItem.item = item
    }
  }

  function updatePagination (total) {
    const td = this.element.find('.item-list-pagination td').first().empty()
    const pages = Math.ceil(total / this.args.pagination.maxCount)
    const current = Math.floor(Math.min(this.args.pagination.startIndex, total) / this.args.pagination.maxCount) + 1
    const starti = current - 3 < 1 ? 1 : current - 3
    const stopi = starti + 8 > pages ? pages : starti + 6
    if (starti > 3) {
      $('<a></a>').addClass('item-list-pagination-item item-list-pagination-fast-previous').text('<<').attr('href', '').attr('data-i', starti - 3).appendTo(td)
    }
    if (starti > 1) {
      $('<a></a>').addClass('item-list-pagination-item item-list-pagination-previous').text('<').attr('href', '').attr('data.i', starti - 1).appendTo(td)
    }
    for (let i = starti; i <= stopi; i++) {
      const a = $('<a></a>').addClass('item-list-pagination-item').text(i).appendTo(td)
      if (current === i) {
        a.addClass('item-list-pagination-current')
      } else {
        a.attr('data-i', i).attr('href', '')
      }
    }
    if (stopi < pages - 1) {
      $('<a></a>').addClass('item-list-pagination-item item-list-pagination-next').text('>').attr('href', '').attr('data-i', stopi + 1).appendTo(td)
    }
    if (stopi < pages - 3) {
      $('<a></a>').addClass('item-list-pagination-item item-list-pagination-fast-next').text('>>').attr('href', '').attr('data-i', stopi + 3).appendTo(td)
    }
    td.find('a').click(paginationClick.bind(this))
  }

  function paginationClick (e) {
    e.preventDefault()
    const i = $(e.target).attr('data-i')
    this.args.pagination.startIndex = (i - 1) * this.args.pagination.maxCount
    window.sessionStorage.setItem(window.location.pathname + '/itemList.startIndex', this.args.pagination.startIndex)
    this.load()
  }

  function headerClick (e) {
    e.stopPropagation()
    const t = $(e.currentTarget)
    const sortBy = t.attr('data-sort-by')
    const sortOrder = t.attr('data-sort-order')
    if (sortOrder === 'none') {
      this.args.pagination.sortOrder = 'asc'
      t.attr('data-sort-order', 'asc')
      this.args.pagination.sortBy = sortBy
    } else if (sortOrder === 'asc') {
      this.args.pagination.sortOrder = 'desc'
      t.attr('data-sort-order', 'desc')
      this.args.pagination.sortBy = sortBy
    } else {
      this.args.pagination.sortOrder = 'asc'
      t.attr('data-sort-order', 'none')
      this.args.pagination.sortBy = undefined
    }
    window.sessionStorage.setItem(window.location.pathname + '/itemList.sortOrder', this.args.pagination.sortOrder)
    window.sessionStorage.setItem(window.location.pathname + '/itemList.sortBy', this.args.pagination.sortBy || '')
    this.element.find('.item-list-header th:not([data-sort-by=\'' + sortBy + '\'])').attr('data-sort-order', 'none')
    this.load()
  }

  function newCallback () {
    return function () {
      if (this.element.hasClass('item-list-editing')) {
        return
      }
      const tr = this.insert().addClass('item-list-new-row')
      editCallback.call(this, tr)()
    }.bind(this)
  }

  function editCallback (tr) {
    return () => {
      const item = this.getItemFromIID(parseInt(tr.attr('data-iid'), 10))
      this.args.columns.forEach(function (column) {
        let rendered = ''
        if (column.formatter) {
          rendered = column.formatter.input(item ? item[column.name] : undefined, item)
        }
        tr.find('td[data-name=\'' + column.name + '\']').empty().append(rendered)
      })
      tr.find('td.item-list-action-cell').append(
        $('<button></button>').text(this.args.lang.save).addClass('item-edit-button').button({ icon: 'ui-icon-disk' }).click(saveCallback.call(this, tr))
      ).append(
        $('<button></button>').text('').addClass('item-edit-button').button({ icon: 'ui-icon-close' }).click(cancelEditCallback.call(this, tr, item))
      )
      tr.find('.item-edit-button').show()
      tr.addClass('item-list-editing').parents('.item-list-control').first().addClass('item-list-editing')
    }
  }

  function deleteCallback (tr) {
    return function () {
      const item = this.getItemFromIID(parseInt(tr.attr('data-iid'), 10))
      Promise.resolve((typeof this.args.delete === 'function') ? this.args.delete(item) : true).then(function (success) {
        if (success) {
          this.load()
        }
        return success
      }.bind(this))
    }.bind(this)
  }

  function saveCallback (tr) {
    return () => {
      const newData = {}
      try {
        this.args.columns.forEach(column => {
          if (!column.formatter) return
          const val = column.formatter.parse(tr.find('td[data-name=\'' + column.name + '\']').children().first())
          if (val !== undefined) {
            newData[column.name] = val
          }
        })
      } catch (error) {
        showError(error)
        return
      }
      Promise.resolve((typeof this.args.save === 'function') ? this.args.save(newData) : true).then(data => {
        if (data.success) {
          cancelEditCallback.call(this, tr, data.item)()
        }
      })
    }
  }

  function cancelEditCallback (tr, item) {
    return function () {
      if (tr.hasClass('item-list-new-row') && !item) {
        tr.remove()
      } else {
        tr.removeClass('item-list-new-row')
        tr.find('.item-edit-button').remove()
        tr.removeClass('item-list-editing')
        this.update(tr, item)
      }
      this.element.removeClass('item-list-editing')
    }.bind(this)
  }

  function getItemFromIID (iid) {
    const item = this._itemDOMObjectReferences.find(function (ref) {
      return ref.iid === iid
    })
    return item ? item.item : undefined
  }

  function showError (errorText) {
    dialogs.errorDialog({
      error: errorText
    })
  }

  controls.itemList = itemList
})(controls)
; // eslint-disable-line
