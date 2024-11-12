import { z } from 'zod'
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
  const handlers = getHandlers(sendResponse)

  if (!(message.command in handlers)) {
    throw new Error(`Unknown message command: ${message.command}`)
  }

  // call handler.
  await handlers[message.command](message)
}

/**
 * Client JS から `vscode.postMessage()` で呼び出し可能なコマンド (APIs) の定義.
 *
 * @param sendResponse Client JS へレスポンスを返送するためのコールバック関数.
 * @returns handlers by command names.
 */
function getHandlers(sendResponse: (res: IResponse) => void)
: { [key: string]: (message: Object) => Promise<void> } {
  return {
    findfiles: CommandFactory
      .input(z.object({
        command: z.literal('findfiles'),
        params: z.object({
          dir: z.string(),
        }),
      }))
      .query(async (message) => {
        // process.
        const files = await findFiles(message)

        // send response.
        sendResponse({
          command: message.command,
          result: files,
        })
      }),

    createfile: CommandFactory
      .input(z.object({
        command: z.literal('createfile'),
        params: z.object({}),
      }))
      .query(async (message) => {
        await createFile(message)
      }),
  }
}

/**
 * Client JS から `vscode.postMessage()` で呼び出し可能なコマンドのファクトリ.
 */
class CommandFactory<ZodType extends z.ZodTypeAny> {
  _schema: ZodType

  constructor(schema: ZodType) {
    this._schema = schema
  }

  static input<ZodType extends z.ZodTypeAny>(schema: ZodType) {
    const obj = new CommandFactory(schema)
    return obj
  }

  query(callback: (input: z.infer<typeof this._schema>) => Promise<void>)
  : (message: Object) => Promise<void> {
    return async (message: Object) => {
      const validated = this._schema.parse(message)
      return callback(validated)
    }
  }
}
