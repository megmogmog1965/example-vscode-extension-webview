import fs from 'fs'  // FIXME: 本来は `vscode.workspace.fs` を使うべき.
import path from 'path'
import * as vscode from 'vscode'

interface Command {
  command: string
  params: object
}

/**
 * VSCode Workspace のルートディレクトリに `hello.txt` ファイルを作成する.
 *
 * @param command command=`createfile`
 * @returns Promise<void>
 */
export async function createFile(command: Command) {  // eslint-disable-line @typescript-eslint/no-unused-vars
  if (vscode.workspace.workspaceFolders === undefined) {
    return []
  }

  const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath

  // FIXME: 本来は `vscode.workspace.fs` を使うべき.
  const filePath = path.join(rootDir, 'hello.txt')
  fs.writeFileSync(filePath, 'Hello, world!')
}
