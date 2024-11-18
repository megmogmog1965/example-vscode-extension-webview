import * as vscode from 'vscode'
import { commandRouter } from './command/_app'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('example-vscode-extension-webview.helloWorld', () => {
      // create webview panel.
      const panel = vscode.window.createWebviewPanel(
        'example-vscode-extension-webview',
        'example-vscode-extension-webview',
        vscode.ViewColumn.One,
        {
          localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
          enableScripts: true,  // with CSP.
        },
      )

      // load local .gif file.
      const gifPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'cat.gif')
      const gif = panel.webview.asWebviewUri(gifPath)

      // load script file.
      const scriptPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'events.js')
      const script = panel.webview.asWebviewUri(scriptPath)

      // load css file.
      const cssPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'style.css')
      const css = panel.webview.asWebviewUri(cssPath)

      // show webview html.
      panel.webview.html = getWebviewContent(panel.webview.cspSource, gif, script, css)

      // handle ALL messages from the webview.
      panel.webview.onDidReceiveMessage(
        message => commandRouter(message as { command: string, params: object }, res => panel.webview.postMessage(res)),
        undefined,
        context.subscriptions,
      )
    }),
  )
}

function getWebviewContent(cspSource: string, gif: vscode.Uri, script: vscode.Uri, css: vscode.Uri) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; img-src ${cspSource} https:; script-src ${cspSource}; style-src ${cspSource};"
    />
    <title>Cat Coding</title>
    <link rel="stylesheet" href="${css.toString()}">
</head>
<body>
    <img src="${gif.toString()}" width="300" />

    <button id="findfiles">List files</button>
    <textarea id="files"></textarea>

    <button id="createfile">Create &quot;hello.txt&quot;</button>

    <script src="${script.toString()}"></script>
</body>
</html>`
}