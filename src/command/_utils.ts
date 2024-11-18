import { z } from 'zod'

export interface ICommand {
  command: string
  params: object
}

export interface IResponse {
  command: string
  result: any  // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type SendResponse = (res: IResponse) => void
export type GetHandlers = (sendResponse: SendResponse) => Command[]

/**
 * `WebviewPanel.webview.onDidReceiveMessage` 向けのハンドラ関数.
 *
 * @param message all messages from the webview.
 * @param sendResponse callback function to send response to the webview.
 * @returns (message: ICommand, sendResponse: SendResponse) => Promise<void>
 */
export function createCommandRouter(getHandlers: GetHandlers) {
  return async (message: ICommand, sendResponse: SendResponse)  => {
    const handlers = getHandlers(sendResponse)

    // find handler.
    const command = handlers.find((c) => c.name === message.command)
    if (!command) {
      throw new Error(`Unknown message command: ${message.command}`)
    }

    // call handler.
    await command.handler(message)
  }
}

export interface Command {
  name: string
  handler: (message: object) => Promise<void>
}

/**
 * Client JS から `vscode.postMessage()` で呼び出し可能なコマンドのファクトリ.
 */
export class CommandFactory<ZodType extends z.ZodType<object, z.ZodTypeDef, object>> {
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
