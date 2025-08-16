# POS - Point of Sale Progressive Web App

Aplikasi Point of Sale (POS) yang dikonfigurasi sebagai Progressive Web App (PWA) untuk pengalaman yang optimal di tablet dan mobile device.

## 🚀 Fitur PWA

- ✅ **Service Worker** - Caching dan offline support
- ✅ **Web App Manifest** - Install prompt dan app-like experience  
- ✅ **Install Prompt** - Notifikasi untuk install app
- ✅ **Update Prompt** - Notifikasi ketika ada update tersedia
- ✅ **Offline Indicator** - Menampilkan status offline
- ✅ **Responsive Design** - Optimized untuk tablet dan mobile

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **PWA Plugin**: vite-plugin-pwa
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📱 PWA Features

### Install Prompt
Aplikasi akan menampilkan prompt untuk install ketika memenuhi kriteria PWA:
- HTTPS connection
- Valid web app manifest
- Service worker registered

### Offline Support
- Caching strategy untuk fonts dan assets
- Offline indicator
- Service worker untuk offline functionality

### Update Management
- Auto-update detection
- Update prompt untuk user
- Seamless update experience

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build PWA
npm run build:pwa

# Preview PWA build
npm run preview:pwa
```

### Production
```bash
# Build untuk production
npm run build:pwa

# Deploy ke server dengan HTTPS
```

## 🔧 PWA Configuration

### Vite PWA Plugin
- Auto-update service worker
- Runtime caching untuk fonts dan assets
- Workbox integration

### Web App Manifest
```json
{
  "name": "POS - Point of Sale",
  "short_name": "POS",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff"
}
```

## 📱 Testing PWA

### Chrome DevTools
1. Buka Chrome DevTools
2. Tab "Application" > "Manifest"
3. Tab "Application" > "Service Workers"
4. Tab "Application" > "Storage" > "Cache Storage"

### Lighthouse Audit
1. Buka Chrome DevTools
2. Tab "Lighthouse"
3. Pilih "Progressive Web App"
4. Generate report

### Mobile Testing
1. Buka di mobile browser
2. Test install prompt
3. Test offline functionality
4. Test app-like experience

## 🎨 Customization

### Icons
Ganti placeholder icons di folder `/public`:
- `pwa-192x192.png` (192x192)
- `pwa-512x512.png` (512x512)
- `apple-touch-icon.png` (180x180)
- `favicon-16x16.png` (16x16)
- `favicon-32x32.png` (32x32)

### Colors
Update colors di:
- `vite.config.ts` - manifest colors
- `scripts/generate-pwa-assets.js` - SVG icon colors

## 🌐 Browser Support

- ✅ Chrome 67+
- ✅ Firefox 67+
- ✅ Safari 11.1+
- ✅ Edge 79+
- ⚠️ IE - Not supported

## 📚 Documentation

Lihat [PWA_SETUP.md](./PWA_SETUP.md) untuk dokumentasi lengkap PWA setup dan troubleshooting.

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Untuk pertanyaan atau masalah terkait PWA, silakan buat issue di repository atau hubungi tim development.
