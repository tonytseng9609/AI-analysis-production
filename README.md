<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it seamlessly.

View your app in AI Studio: https://ai.studio/apps/72a34f23-da47-459d-a7f5-a6ea80a3d88c

## Changes Made:
- **`package.json`**: The `package.json` is fully configured for a Vite React TypeScript project. Due to Node.js/npm not being installed or available in your command line PATH, it could not be run locally to verify. You'll need to install Node to test this locally.
- **`.gitignore`**: Added a standard, comprehensive set of rules to prevent uploading `/node_modules`, `/dist`, environment variables, and IDE setting files.
- **GitHub Action (`deploy.yml`)**: Created a CI/CD workflow to directly build and deploy to **GitHub Pages** whenever you push to the `main` or `master` branch.
- **Vite Config**: Added `base: './'` to `vite.config.ts` to ensure assets load correctly on GitHub Pages.

## Run Locally

**Prerequisites:** Node.js (v20 or newer recommended)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key (you can copy `.env.example`).
3. Run the app:
   ```bash
   npm run dev
   ```

## Deploying

This project is set up to automatically deploy to GitHub Pages! 
1. Make sure your repository has GitHub Pages enabled (Settings -> Pages -> Source: GitHub Actions).
2. Commit and push your code to `main` (or trigger it manually in the Actions tab).
