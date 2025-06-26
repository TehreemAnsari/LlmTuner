import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting FastAPI backend...');

// Start the FastAPI server
const pythonProcess = spawn('python', [join(__dirname, 'main.py')], {
  stdio: 'inherit',
  cwd: process.cwd()
});

pythonProcess.on('error', (error) => {
  console.error('Failed to start FastAPI server:', error);
  process.exit(1);
});

pythonProcess.on('close', (code) => {
  console.log(`FastAPI server exited with code ${code}`);
  process.exit(code || 0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  pythonProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  pythonProcess.kill('SIGTERM');
});