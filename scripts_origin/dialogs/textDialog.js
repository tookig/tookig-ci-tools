// Make sure there is a dialogs object
var dialogs = dialogs || {}; // eslint-disable-line

(function (dialogs) {
  /**
   * Opens up a text dialog box
   *
   * @param  {object} args                  Text dialog parameters
   * @param  {string} args.text             Text to show in dialog box
   * @param  {string} args.title            Dialog box title
   * @param  {function} [args.okCallback]   Callback for the OK button. Optional, can also use the 'ok' function returned by textDialog
   * @param  {function} [args.cancelCallback]   Callback for the Cancel button. Optional, can also use the 'cancel' function returned by textDialog
   * @return {object}
   */
  function textDialog (args) {
    // Create the dialog object
    const dialog = dialogs.dialog(args).create({
      // height: 200,
      // width: 400
    })
    // Add text
    dialog.element.text(args.text)
    // Show and return
    return dialog.show()
  }

  dialogs.textDialog = textDialog
}(dialogs))
