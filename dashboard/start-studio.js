import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n\x1b[36m%s\x1b[0m', '🚀 Iniciando o Gigio Flow Studio...');

// 1. Start backend server
const serverProcess = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// 2. Start Vite client dev server
const clientProcess = spawn('npx', ['vite'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Log processes exit
serverProcess.on('exit', (code) => {
  console.log(`[Backend] Processo finalizado com código ${code}`);
  clientProcess.kill();
  process.exit(code);
});

clientProcess.on('exit', (code) => {
  console.log(`[Frontend] Processo finalizado com código ${code}`);
  serverProcess.kill();
  process.exit(code);
});

// Handle termination signals
const handleExit = () => {
  console.log('\n\x1b[33m%s\x1b[0m', '⏹️  Finalizando Gigio Flow Studio...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
