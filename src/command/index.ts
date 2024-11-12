import * as vscode from 'vscode'
import { findFiles } from './findfiles'
import { createFile } from './createfile'

interface ICommand {
  command: string
  params: any
}

interface IResponse {
  command: string
  result: any
}

/**
 * `WebviewPanel.webview.onDidReceiveMessage` 向けのハンドラ関数.
 *
 * @param message all messages from the webview.
 * @param sendResponse callback function to send response to the webview.
 * @returns Promise<void>
 */
export const callCommand = async (message: ICommand, sendResponse: (res: IResponse) => void)  => {
  // @todo `zod` を使って型検査をした方がよい.
  const handlers: { [key: string]: () => Promise<void> } = {
    findfiles: async () => {
      // process.
      const files = await findFiles(message)

      // send response.
      sendResponse({
        command: message.command,
        result: files,
      })
    },

    createfile: async () => {
      await createFile(message)
    },
  }

  // call handler.
  await handlers[message.command]()
}
