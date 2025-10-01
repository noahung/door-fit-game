# GitHub Pages Deployment Guide

## Overview
Your Door Fit Game is now configured for GitHub Pages deployment with two distinct URLs:

- **Settings Page**: `https://noahung.github.io/door-game/` (Main configuration page)
- **Game Interface**: `https://noahung.github.io/door-game/game` (Clean interface for iframe embedding)

## Setup Instructions

### 1. Create GitHub Repository
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub and push
git remote add origin https://github.com/noahung/door-game.git
git branch -M main
git push -u origin main
```

### 2. Deploy to GitHub Pages
```bash
# Build and deploy
npm run deploy
```

This command will:
- Build the project for production
- Create a `gh-pages` branch
- Deploy the built files to GitHub Pages

### 3. Enable GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose the **gh-pages** branch
5. Click **Save**

## Usage

### Settings Page
- **URL**: `https://noahung.github.io/door-game/`
- **Purpose**: Full configuration interface
- **Features**: Upload images, configure game settings, test gameplay

### Game Interface (for iframe)
- **URL**: `https://noahung.github.io/door-game/game`
- **Purpose**: Clean game interface for WordPress iframe embedding
- **Features**: Game canvas only, no settings navigation

## WordPress Integration

### Iframe Code for WordPress
```html
<iframe 
  src="https://noahung.github.io/door-game/game" 
  width="100%" 
  height="800" 
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="Sliding Door Challenge Game">
</iframe>
```

### Responsive Iframe (Recommended)
```html
<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
  <iframe 
    src="https://noahung.github.io/door-game/game" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;"
    frameborder="0"
    title="Sliding Door Challenge Game">
  </iframe>
</div>
```

## Development Commands

```bash
# Development server
npm run dev

# Build for GitHub Pages
npm run build:gh-pages

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## File Structure
```
/door-game/               # Settings page
/door-game/game          # Game interface (iframe-ready)
```

## Notes
- The game interface at `/game` has no "Back to Settings" button
- Both URLs use the same game logic and assets
- Settings are configured through the main page but persist for the game interface
- The game interface is optimized for iframe embedding on WordPress

## Troubleshooting

### If deployment fails:
1. Ensure you have push permissions to the repository
2. Check that the repository name matches the base path in `vite.config.ts`
3. Verify GitHub Pages is enabled in repository settings

### If routes don't work:
- GitHub Pages serves static files, so client-side routing requires a 404.html fallback
- The app uses hash routing which works better with GitHub Pages