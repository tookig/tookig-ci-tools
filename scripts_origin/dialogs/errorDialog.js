/* global $, AggregateError */

// Make sure there is a dialogs object
var dialogs = dialogs || {}; // eslint-disable-line

(function (dialogs) {
  /**
   * Opens up a error list dialog box
   *
   * @param  {object} args                  Error dialog parameters
   * @param  {string} args.error            Error to show. Can be a string, array with strings, or an Error-like object
   * @param  {string} [args.title='Error']  Dialog box title
   * @param  {object} [args.ok_text=OK]     Text for the OK-button
   * @param  {function} [args.okCallback]   Callback for the OK button. Optional, can also use the 'ok' function returned by textDialog
   * @return {object}
   */
  function errorDialog (args) {
    let errors = []
    if (typeof args.error === 'string') {
      errors = [args.error]
    } else if (args.error instanceof AggregateError) {
      errors = args.error.errors.map(e => e.message)
    } else if (args.error instanceof Error) {
      errors = [args.error.message]
    } else if (Array.isArray(args.error)) {
      errors = args.error
    }

    const iargs = Object.assign({
      errors: errors,
      title: 'Error',
      ok: 'OK',
      okCallback: function () {}
    }, args)

    const robject = {
      ok: function (func) {
        iargs.okCallback = func
        return robject
      }
    }
    show(iargs)
    return robject
  }

  function show (args) {
    const element = $('<div class="error-list-dialog-container"></div>').attr('title', args.title)
    const ul = $('<ul/>').appendTo(element)
    for (const i in args.errors) {
      $('<li/>').text(args.errors[i]).appendTo(ul)
    }
    const buttons = {}
    buttons[args.ok] = function () {
      args.okCallback(args.ok)
      element.dialog('close')
    }
    element.appendTo('body').dialog({
      autoOpen: false,
      height: 'auto',
      width: 'auto',
      modal: true,
      buttons: buttons,
      close: function () {
        element.remove()
      }
    }).dialog('open')
  }

  dialogs.errorDialog = errorDialog
}(dialogs))
