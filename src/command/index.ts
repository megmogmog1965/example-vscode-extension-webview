import { z } from 'zod'
import { findFiles } from './findfiles'
import { createFile } from './createfile'

interface ICommand {
  command: string
  params: object
}

interface IResponse {
  command: string
  result: any  // eslint-disable-line @typescript-eslint/no-explicit-any
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

  // find handler.
  const command = handlers.find((c) => c.name === message.command)
  if (!command) {
    throw new Error(`Unknown message command: ${message.command}`)
  }

  // call handler.
  await command.handler(message)
}

/**
 * Client JS から `vscode.postMessage()` で呼び出し可能なコマンド (APIs) の定義.
 *
 * @param sendResponse Client JS へレスポンスを返送するためのコールバック関数.
 * @returns handlers by command names.
 */
function getHandlers(sendResponse: (res: IResponse) => void): Command[] {
  return [
    CommandFactory
      .command('findfiles')
      .input(z.object({
        dir: z.string(),
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

    CommandFactory
      .command('createfile')
      .input(z.object({}))
      .query(async (message) => {
        await createFile(message)
      }),
  ]
}

interface Command {
  name: string
  handler: (message: object) => Promise<void>
}

/**
 * Client JS から `vscode.postMessage()` で呼び出し可能なコマンドのファクトリ.
 */
class CommandFactory<ZodType extends z.ZodType<object, z.ZodTypeDef, object>> {
  _commandName: string
  _schema: ZodType

  constructor(commandName: string, schema: ZodType) {
    this._commandName = commandName
    this._schema = schema
  }

  static command(commandName: string) {
    return new CommandFactory(commandName, z.object({}))
  }

  input<ParamsType extends z.ZodType<object, z.ZodTypeDef, object>>(paramsSchema: ParamsType) {
    const schema = z.object({
      command: z.literal(this._commandName),
      params: paramsSchema,
    })

    const obj = new CommandFactory(this._commandName, schema)
    return obj
  }

  query(callback: (input: z.infer<typeof this._schema>) => Promise<void>)
  : Command {
    const handler = async (message: object) => {
      const validated = this._schema.parse(message)
      return callback(validated)
    }

    return {
      name: this._commandName,
      handler,
    }
  }
}
