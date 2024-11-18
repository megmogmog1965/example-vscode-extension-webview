import { z } from 'zod'
import { createCommandRouter, CommandFactory } from './_utils'
import type { SendResponse, Command } from './_utils'
import { findFiles } from './findfiles'
import { createFile } from './createfile'

/**
 * exported command router.
 * 
 * @type (message: ICommand, sendResponse: SendResponse) => Promise<void>
 */
export const commandRouter = createCommandRouter(getHandlers)

/**
 * Client JS から `vscode.postMessage()` で呼び出し可能なコマンド (APIs) の定義.
 *
 * @param sendResponse Client JS へレスポンスを返送するためのコールバック関数.
 * @returns handlers by command names.
 */
function getHandlers(sendResponse: SendResponse): Command[] {
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