import fs from 'fs';
import path from 'path';

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate a simple SVG icon for PWA
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3B82F6"/>
  <rect x="128" y="128" width="256" height="256" rx="16" fill="white"/>
  <rect x="160" y="160" width="64" height="64" rx="8" fill="#3B82F6"/>
  <rect x="240" y="160" width="64" height="64" rx="8" fill="#3B82F6"/>
  <rect x="320" y="160" width="32" height="64" rx="8" fill="#3B82F6"/>
  <rect x="160" y="240" width="64" height="64" rx="8" fill="#3B82F6"/>
  <rect x="240" y="240" width="64" height="64" rx="8" fill="#3B82F6"/>
  <rect x="320" y="240" width="32" height="64" rx="8" fill="#3B82F6"/>
  <rect x="160" y="320" width="192" height="32" rx="8" fill="#3B82F6"/>
</svg>`;

// Generate a simple maskable icon
const maskableIcon = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3B82F6"/>
  <rect x="64" y="64" width="384" height="384" rx="32" fill="white"/>
  <rect x="96" y="96" width="80" height="80" rx="12" fill="#3B82F6"/>
  <rect x="200" y="96" width="80" height="80" rx="12" fill="#3B82F6"/>
  <rect x="304" y="96" width="80" height="80" rx="12" fill="#3B82F6"/>
  <rect x="96" y="200" width="80" height="80" rx="12" fill="#3B82F6"/>
  <rect x="200" y="200" width="80" height="80" rx="12" fill="#3B82F6"/>
  <rect x="304" y="200" width="80" height="80" rx="12" fill="#3B82F6"/>
  <rect x="96" y="304" width="80" height="80" rx="12" fill="#3B82F6"/>
  <rect x="200" y="304" width="80" height="80" rx="12" fill="#3B82F6"/>
  <rect x="304" y="304" width="80" height="80" rx="12" fill="#3B82F6"/>
  <rect x="96" y="408" width="288" height="40" rx="12" fill="#3B82F6"/>
</svg>`;

// Generate manifest file
const manifest = {
  name: "POS - Point of Sale",
  short_name: "POS",
  description: "Point of Sale application for inventory and sales management",
  theme_color: "#3B82F6",
  background_color: "#ffffff",
  display: "standalone",
  orientation: "portrait-primary",
  scope: "/",
  start_url: "/",
  icons: [
    {
      src: "/pwa-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/pwa-512x512.png",
      sizes: "512x512",
      type: "image/png"
    },
    {
      src: "/pwa-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable"
    }
  ],
  categories: ["business", "productivity"],
  lang: "en",
  dir: "ltr"
};

// Write files
try {
  // Write SVG icons
  fs.writeFileSync(path.join(publicDir, 'masked-icon.svg'), svgIcon);
  fs.writeFileSync(path.join(publicDir, 'maskable-icon.svg'), maskableIcon);
  
  // Write manifest
  fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
  
  // Create placeholder icon files (you should replace these with actual PNG icons)
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), '');
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), '');
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), '');
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), '');
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), '');
  
  console.log('✅ PWA assets generated successfully!');
  console.log('📁 Files created in /public directory:');
  console.log('   - manifest.webmanifest');
  console.log('   - masked-icon.svg');
  console.log('   - maskable-icon.svg');
  console.log('   - Placeholder icon files');
  console.log('');
  console.log('⚠️  Note: Replace placeholder icon files with actual PNG icons for production');
  console.log('   Recommended sizes: 16x16, 32x32, 192x192, 512x512, and apple-touch-icon (180x180)');
} catch (error) {
  console.error('❌ Error generating PWA assets:', error);
  process.exit(1);
}
