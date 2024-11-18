/**
 * Extension へ送信される Events.
 */
function registerSendEvents() {
  const vscode = acquireVsCodeApi()  // eslint-disable-line no-undef

  const buttonFindfiles = document.getElementById('findfiles')
  const buttonCreatefile = document.getElementById('createfile')

  // send findfiles command.
  buttonFindfiles.addEventListener('click', () => {
    vscode.postMessage({
      command: 'findfiles',
      params: {
        dir: '.',
      },
    })
  })

  // send createfile command.
  buttonCreatefile.addEventListener('click', () => {
    vscode.postMessage({
      command: 'createfile',
      params: {},
    })
  })
}

/**
 * Extension から受信する Events.
 */
function registerReceiveEvents() {
  const textarea = document.getElementById('files')

  // Handle the message inside the webview
  window.addEventListener('message', event => {
    const message = event.data

    // define event handlers.
    const eventHandlers = {
      findfiles: () => {
        textarea.value = message.result.join('\n')
      },
    }

    // call handler.
    eventHandlers[message.command]()
  })
}

// register events.
registerSendEvents()
registerReceiveEvents()
