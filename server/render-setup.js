// Render-specific setup for Puppeteer
import { execSync } from 'child_process';

console.log('Setting up Puppeteer for Render deployment...');

try {
  // Install Chrome dependencies for Render
  console.log('Installing Chrome dependencies...');
  execSync('apt-get update', { stdio: 'inherit' });
  execSync('apt-get install -y wget gnupg', { stdio: 'inherit' });
  
  // Install Google Chrome
  console.log('Installing Google Chrome...');
  execSync('wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -', { stdio: 'inherit' });
  execSync('echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list', { stdio: 'inherit' });
  execSync('apt-get update', { stdio: 'inherit' });
  execSync('apt-get install -y google-chrome-stable', { stdio: 'inherit' });
  
  console.log('Chrome installation completed successfully!');
} catch (error) {
  console.error('Error setting up Chrome:', error);
  console.log('Continuing without Chrome installation...');
}

// Set environment variable for Puppeteer
process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/google-chrome-stable';
console.log('Puppeteer executable path set to:', process.env.PUPPETEER_EXECUTABLE_PATH); 