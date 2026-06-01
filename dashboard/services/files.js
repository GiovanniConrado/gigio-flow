/**
 * services/files.js
 * Funções de I/O de arquivos com validação de path para segurança.
 * Todas as operações de leitura/escrita passam por validatePath() para
 * impedir path traversal attacks.
 */

import fs from 'fs';
import path from 'path';

/**
 * Valida que o targetPath está dentro do baseDir.
 * Lança erro se houver tentativa de path traversal.
 * @param {string} baseDir - Diretório raiz permitido
 * @param {string} targetPath - Caminho a ser validado (já resolvido)
 * @returns {string} O caminho resolvido e validado
 */
export function validatePath(baseDir, targetPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);

  if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
    throw new Error(`Acesso negado: o caminho "${resolvedTarget}" está fora do diretório base permitido.`);
  }

  return resolvedTarget;
}

/**
 * Verifica se um arquivo existe no sistema de arquivos.
 * @param {string} filePath - Caminho absoluto do arquivo
 * @returns {boolean}
 */
export function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Lê o conteúdo de um arquivo com segurança.
 * @param {string} baseDir - Diretório base (workspace ativo)
 * @param {string} relativeDir - Subdiretório relativo ao baseDir
 * @param {string} fileName - Nome do arquivo
 * @returns {string} Conteúdo do arquivo, ou string vazia se não existir
 */
export function readFile(baseDir, relativeDir, fileName) {
  const fullPath = path.join(baseDir, relativeDir, fileName);
  try {
    validatePath(baseDir, fullPath);
  } catch {
    return '';
  }
  if (!fileExists(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Escreve conteúdo em um arquivo com segurança.
 * Cria diretórios intermediários se necessário.
 * @param {string} baseDir - Diretório base (workspace ativo)
 * @param {string} relativeDir - Subdiretório relativo ao baseDir
 * @param {string} fileName - Nome do arquivo
 * @param {string} content - Conteúdo a escrever
 */
export function writeFile(baseDir, relativeDir, fileName, content) {
  const dirPath = path.join(baseDir, relativeDir);
  const fullPath = path.join(dirPath, fileName);
  validatePath(baseDir, fullPath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
}

/**
 * Copia uma pasta recursivamente, excluindo determinadas entradas.
 * @param {string} from - Caminho de origem
 * @param {string} to - Caminho de destino
 * @param {string[]} [excludes] - Nomes de entradas a excluir (padrão: dashboard, node_modules, .git, dist)
 */
export function copyFolderSync(from, to, excludes = ['dashboard', 'node_modules', '.git', 'dist']) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }

  fs.readdirSync(from).forEach(element => {
    if (excludes.includes(element)) return;

    const sourcePath = path.join(from, element);
    const destPath = path.join(to, element);
    const stat = fs.lstatSync(sourcePath);

    if (stat.isDirectory()) {
      copyFolderSync(sourcePath, destPath, excludes);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}
