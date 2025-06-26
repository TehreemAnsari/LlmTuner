import { spawn } from "child_process";

// Start FastAPI server directly
console.log("Starting FastAPI backend...");
const fastapi = spawn("python", ["server/main.py"], {
  stdio: "inherit"
});

process.on('SIGINT', () => {
  fastapi.kill();
  process.exit();
});