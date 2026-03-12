# Quick Start Guide

## Running the App

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the Expo development server**:
   ```bash
   npm start
   ```

3. **Choose your platform**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your physical device

## Available Routes

- **Home** (`/`) - Main landing page with navigation
- **Profile** - User profile information
- **Settings** - App configuration and preferences
- **Search** - Search functionality with filtering
- **Details** - Detailed item view (requires params)
- **Auth** - Login/Register screen

## Navigation Flow

```
Home
├── Profile → Details
├── Search → Details
└── Settings → Auth
```

## Development Tips

1. **Hot Reload**: Changes to code will automatically reload the app
2. **Debugging**: Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) for dev menu
3. **Console Logs**: Check terminal for console.log outputs
4. **React DevTools**: Available in the development menu

## Common Commands

```bash
npm start          # Start development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in browser
npm install <pkg>  # Install new package
```

## Next Steps

1. Customize the pages in the `pages/` directory
2. Add reusable components to `components/`
3. Configure app settings in `app.json`
4. Add your app logic and API calls
5. Style components to match your design

Enjoy building your app!
