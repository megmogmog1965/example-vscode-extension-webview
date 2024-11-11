import fs from 'fs'
import path from 'path'
import * as vscode from 'vscode'

interface Command {
	command: string
	params: { }
}

/**
 * VSCode Workspace のルートディレクトリに `hello.txt` ファイルを作成する.
 *
 * @param command command=`createfile`
 * @returns Promise<void>
 */
export async function createFile(command: Command) {
  if (vscode.workspace.workspaceFolders === undefined) {
    return []
  }

  const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath

  const filePath = path.join(rootDir, 'hello.txt')
  fs.writeFileSync(filePath, 'Hello, world!')
}
