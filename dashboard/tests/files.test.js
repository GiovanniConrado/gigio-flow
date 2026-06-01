import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validatePath, fileExists, readFile, writeFile } from '../services/files.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_WORKSPACE = path.join(__dirname, 'tmp-workspace-files');

describe('Files Service (services/files.js)', () => {
  
  beforeAll(() => {
    // Garante que o workspace temporário de testes exista
    if (!fs.existsSync(TEMP_WORKSPACE)) {
      fs.mkdirSync(TEMP_WORKSPACE, { recursive: true });
    }
  });

  afterAll(() => {
    // Remove o workspace temporário após os testes
    if (fs.existsSync(TEMP_WORKSPACE)) {
      fs.rmSync(TEMP_WORKSPACE, { recursive: true, force: true });
    }
  });

  describe('validatePath', () => {
    it('deve retornar o caminho resolvido se estiver dentro do diretorio base', () => {
      const target = path.join(TEMP_WORKSPACE, 'workflows', 'propostas', 'card.md');
      const resolved = validatePath(TEMP_WORKSPACE, target);
      expect(resolved).toBe(path.resolve(target));
    });

    it('deve aceitar o proprio diretorio base', () => {
      const resolved = validatePath(TEMP_WORKSPACE, TEMP_WORKSPACE);
      expect(resolved).toBe(path.resolve(TEMP_WORKSPACE));
    });

    it('deve lancar um erro se o caminho tentar sair do diretorio base (path traversal)', () => {
      const maliciousTarget = path.join(TEMP_WORKSPACE, '..', 'outro-diretorio');
      expect(() => {
        validatePath(TEMP_WORKSPACE, maliciousTarget);
      }).toThrow('Acesso negado');
    });

    it('deve lancar um erro se tentar acessar um arquivo do sistema absoluto fora da pasta', () => {
      // No Windows, caminhos absolutos como C:\Windows ou similares
      const maliciousTarget = path.resolve('/');
      expect(() => {
        validatePath(TEMP_WORKSPACE, maliciousTarget);
      }).toThrow('Acesso negado');
    });
  });

  describe('fileExists', () => {
    it('deve retornar true para arquivo que existe', () => {
      const testFile = path.join(TEMP_WORKSPACE, 'existe.txt');
      fs.writeFileSync(testFile, 'ola', 'utf8');
      expect(fileExists(testFile)).toBe(true);
    });

    it('deve retornar false para arquivo que nao existe', () => {
      const testFile = path.join(TEMP_WORKSPACE, 'nao-existe.txt');
      expect(fileExists(testFile)).toBe(false);
    });
  });

  describe('writeFile e readFile', () => {
    it('deve escrever e ler um arquivo com sucesso usando caminhos seguros', () => {
      const relativeDir = 'workflows/propostas';
      const fileName = 'nova-feature.md';
      const content = '# Feature X\n\nEsta e a feature X.';

      writeFile(TEMP_WORKSPACE, relativeDir, fileName, content);

      const readContent = readFile(TEMP_WORKSPACE, relativeDir, fileName);
      expect(readContent).toBe(content);
    });

    it('deve retornar string vazia se o arquivo nao existir no readFile', () => {
      const readContent = readFile(TEMP_WORKSPACE, 'workflows/propostas', 'inexistente.md');
      expect(readContent).toBe('');
    });

    it('deve retornar string vazia se tentar ler fora do workspace seguro', () => {
      const readContent = readFile(TEMP_WORKSPACE, '..', 'algum-arquivo.md');
      expect(readContent).toBe('');
    });

    it('deve lancar erro se tentar escrever fora do workspace seguro', () => {
      expect(() => {
        writeFile(TEMP_WORKSPACE, '..', 'perigoso.md', 'conteudo');
      }).toThrow('Acesso negado');
    });
  });
});
