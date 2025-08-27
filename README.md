# DCA Bot Website

A lightweight web interface for the Crypto DCA Bot portfolio tracker. Built with React, TypeScript, and Tailwind CSS.

## Features

- 📊 **Dashboard**: Real-time portfolio overview with KPIs and positions table
- 📈 **Charts**: Time-series visualization of portfolio performance
- 📋 **Transactions**: Complete transaction history with filtering
- 🌓 **Dark/Light Mode**: Automatic theme switching with manual override
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🚀 **Fast Loading**: Optimized for quick data updates and rendering

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker

```bash
# Build image
docker build -t dca-bot-website .

# Run container
docker run -p 80:80 -v /path/to/data:/usr/share/nginx/html/data dca-bot-website
```

### GitHub Pages

```bash
# Copy data from bot repository
./scripts/sync-data.sh /path/to/bot/repo

# Create GitHub repository and push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ukewea/crypto-dca-bot-website_claude.git
git push -u origin main

# Enable GitHub Pages in repository settings
# The site will be available at: https://ukewea.github.io/crypto-dca-bot-website_claude/
```

## Data Sources

The website reads JSON/NDJSON files from the `/data` directory:

- `positions_current.json` - Current portfolio positions and totals
- `snapshots.ndjson` - Historical portfolio snapshots for charts
- `transactions.ndjson` - Transaction history (optional)
- `prices.ndjson` - Price history (optional)

## License

MIT License
