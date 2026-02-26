
import { HostingerTokenManager } from '../src/lib/hostinger-token-manager';
import fs from 'fs';
import path from 'path';

// Helper to load .env.local manually
function loadEnvLocal() {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
      console.log('Loaded .env.local');
    } else {
      console.warn('.env.local not found. Ensure environment variables are set manually.');
    }
  } catch (error) {
    console.error('Failed to load .env.local:', error);
  }
}

async function main() {
  loadEnvLocal();

  const token = process.argv[2];
  if (!token) {
    console.error('Error: Please provide the token as an argument.');
    console.log('Usage: npx tsx scripts/setup-hostinger-token.ts <YOUR_TOKEN>');
    process.exit(1);
  }

  console.log('Setting up Hostinger token...');
  
  try {
    const manager = new HostingerTokenManager();
    await manager.saveToken(token);
    console.log('Token saved successfully!');
  } catch (error) {
    console.error('Failed to save token:', error);
    process.exit(1);
  }
}

main();
