function registerEvents() {
  const vscode = acquireVsCodeApi()

  const buttonFindfiles = document.getElementById('findfiles')
  const buttonCreatefile = document.getElementById('createfile')
  const textarea = document.getElementById('files')

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

// call it.
registerEvents()
