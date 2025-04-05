/* global $ */

// Make sure there is a dialogs object
var dialogs = dialogs || {}; // eslint-disable-line

(function (dialogs) {
  // Counter for createing unique dialog id's
  let nuid = 1

  function ok (func) {
    this.args.okCallback = func
    return this
  }

  function cancel (func) {
    this.args.cancelCallback = func
    return this
  }

  /**
   * Create the jQuery dialog
   * @param  {mixed[]} jQueryOptions jQuery dialog options
   * @return {object}                Self reference for method chaining
   */
  function create (jQueryOptions) {
    // make sure this is only called once
    if (this.element) {
      throw new Error('dialog create function can only be called once')
    }
    // Create base DOM element
    const element = $('<div class="dialog-container"></div>').attr('title', this.args.title)
    this.element = element

    // Sort the jQuery options
    const options = Object.assign({
      autoOpen: false,
      height: 'auto',
      width: 'auto',
      modal: true,
      buttons: this.buttons(),
      close: function () {
        element.remove()
      }
    }, jQueryOptions)
    // Create the dialog box
    element.appendTo('body').dialog(options)
    // Return self reference
    return this
  }

  /**
   * Parse the dialog data, and return the object to be sent to the
   * 'ok'-callback.
   * @return {mixed} The object to be sent to the 'ok'-callback
   */
  function parse () {
    return undefined
  }

  /**
   * Show the dialog box
   * @return {object}                Self reference for method chaining
   */
  function show () {
    this.element.dialog('open')
    return this
  }

  /**
   * Close the dialog box
   * @return {object}                Self reference for method chaining
   */
  function close () {
    return this.element.dialog('close')
  }

  /**
   * Create the buttons array
   * @return {[type]} [description]
   */
  function buttons () {
    // Create the buttons
    const buttons = {}
    buttons[this.args.lang.ok] = function () {
      Promise.resolve(this.args.okCallback(this.parse())).then(function (shouldClose) {
        if (shouldClose) {
          this.close()
        }
      }.bind(this))
    }.bind(this)
    buttons[this.args.lang.cancel] = function () {
      this.args.cancelCallback()
      this.close()
    }.bind(this)
    return buttons
  }

  const dialogPrototype = {
    ok: ok,
    cancel: cancel,
    create: create,
    parse: parse,
    show: show,
    close: close,
    buttons: buttons
  }

  /**
   * Base functionality for dialog objects
   *
   * @param  {object} args                            Dialog parameters
   * @param  {string} args.title                      Dialog title
   * @param  {object} [args.lang]                     Translations for the dialog
   * @param  {object} [args.lang.ok = 'OK']           OK button text
   * @param  {object} [args.lang.cancel = 'Cancel']   Cancel button text
   * @param  {function} [args.okCallback]             Callback for the OK button. Optional, can also use the 'ok' function returned by dialog
   * @param  {function} [args.cancelCallback]         Callback for the Cancel button. Optional, can also use the 'cancel' function returned by dialog
   * @return {object}
   */
  function dialog (args) {
    // Set default values
    const iargs = Object.assign({
      title: 'Dialog title',
      okCallback: function () {},
      cancelCallback: function () {}
    }, args)
    // Set default translations
    iargs.lang = Object.assign({
      ok: 'OK',
      cancel: 'Cancel'
    }, args.lang)
    // Create dialog object
    const dialogObject = Object.assign({
      args: iargs,
      uid: nuid++
    }, dialogPrototype)
    // Return
    return dialogObject
  }

  dialogs.dialog = dialog
}(dialogs))
