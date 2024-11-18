import fs from 'fs'  // FIXME: 本来は `vscode.workspace.fs` を使うべき.
import path from 'path'
import * as vscode from 'vscode'

interface Command {
  command: string
  params: {
    dir: string
  }
}

/**
 * 指定されたディレクトリ内のファイルの名称一覧を取得する.
 *
 * @param command command=`findfiles`
 * @returns Promise<string[]>
 */
export async function findFiles(command: Command) {
  if (vscode.workspace.workspaceFolders === undefined) {
    return []
  }

  const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath

  // FIXME: 本来は `vscode.workspace.fs` を使うべき.
  const dir = path.join(rootDir, command.params.dir)
  const files = fs.readdirSync(dir)

  return files
}
