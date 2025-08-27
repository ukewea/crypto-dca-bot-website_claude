# Deployment Guide

This guide covers different deployment options for the DCA Bot Website.

## GitHub Pages Deployment

### Prerequisites

1. Create a new GitHub repository for the website (e.g., `crypto-dca-bot-website`)
2. Push this website code to the repository
3. Ensure your bot repository is accessible (public or with proper tokens)

### Setup Steps

1. **Repository Settings**
   - Go to your repository Settings → Pages
   - Source: GitHub Actions
   - This will enable GitHub Pages deployment via Actions

2. **Update Configuration**
   - In `vite.config.ts`, update the `base` path to match your repository name:
     ```ts
     base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
     ```
   - In `.github/workflows/sync-data.yml`, update the bot repository reference:
     ```yaml
     repository: your-username/your-bot-repo
     ```

3. **Token Setup (if bot repo is private)**
   - Create a Personal Access Token with `repo` scope
   - Add it as `BOT_REPO_TOKEN` secret in repository settings
   - Uncomment the token line in `sync-data.yml`

4. **Enable Workflows**
   - Push to `main` branch to trigger initial deployment
   - The website will be available at `https://your-username.github.io/your-repo-name/`

### Data Synchronization

The website automatically syncs data from your bot repository every 15 minutes:

- **Manual Sync**: Go to Actions → "Sync Bot Data" → Run workflow
- **Automatic**: Runs every 15 minutes via cron schedule
- **Bot Triggered**: Configure your bot to trigger sync after data updates

### Custom Domain (Optional)

1. Add a `CNAME` file to `public/` with your domain
2. Configure DNS to point to GitHub Pages
3. Enable custom domain in repository settings

## Alternative Deployments

### Netlify

1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add data sync webhook to your bot

### Vercel

1. Import repository to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Configure data sync via API routes

### Self-Hosted

1. **Build**: `npm run build`
2. **Serve**: Serve `dist/` directory with any web server
3. **Data Sync**: Set up cron job or webhook to sync data files
4. **Docker**: Use provided Dockerfile for containerized deployment

#### Docker Self-Hosted

```bash
# Build image
docker build -t dca-bot-website .

# Run with data volume from bot
docker run -d -p 80:80 \
  -v /path/to/bot/data:/usr/share/nginx/html/data:ro \
  dca-bot-website
```

#### NGINX Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Data files with no-cache headers
    location /data/ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        alias /path/to/bot/data/;
    }
}
```

## Data Sync Strategies

### Option 1: Repository Sync (Recommended for GitHub Pages)
- Data lives in website repository
- Synced from bot repository via Actions
- Simple, reliable, version controlled

### Option 2: Direct File Access
- Website reads data directly from bot's file system
- Requires same-origin deployment
- Real-time updates, no sync delay

### Option 3: API Proxy
- Bot exposes read-only API endpoints
- Website fetches data via HTTP
- Supports cross-origin deployments

### Option 4: Cloud Storage
- Bot uploads data to S3/Google Cloud Storage
- Website fetches from cloud storage
- Scalable, CDN-friendly

## Environment Variables

- `VITE_DATA_BASE_PATH`: Base path for data files (default: `/data`)
- `NODE_ENV`: Set to `production` for GitHub Pages base path

## Troubleshooting

### Data Not Updating
1. Check sync workflow logs in Actions tab
2. Verify bot repository access permissions
3. Confirm data files exist in bot repository

### 404 Errors on GitHub Pages
1. Verify repository name matches Vite config base path
2. Check that GitHub Pages is enabled and using Actions
3. Ensure all assets are using relative paths

### Build Failures
1. Check Node.js version (requires 18+)
2. Verify all dependencies are installed
3. Check TypeScript errors in build logs

### CORS Issues
1. Ensure data files are served from same origin
2. Check server CORS headers for cross-origin setups
3. Use API proxy if needed for cross-domain requests