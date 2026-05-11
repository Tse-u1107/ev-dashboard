# Expo Mobile App Boilerplate

A clean and simple Expo React Native mobile application boilerplate with organized page structure and navigation.

## Project Structure

```
.
├── App.js                 # Main app entry with navigation setup
├── pages/                 # All application pages/screens
│   ├── home/             # Home page - Landing screen
│   │   ├── HomePage.js
│   │   └── index.js
│   ├── profile/          # Profile page - User profile display
│   │   ├── ProfilePage.js
│   │   └── index.js
│   ├── settings/         # Settings page - App configuration
│   │   ├── SettingsPage.js
│   │   └── index.js
│   ├── search/           # Search page - Search functionality
│   │   ├── SearchPage.js
│   │   └── index.js
│   ├── details/          # Details page - Item detail view
│   │   ├── DetailsPage.js
│   │   └── index.js
│   └── auth/             # Auth page - Login/Register
│       ├── AuthPage.js
│       └── index.js
├── assets/               # Static assets (images, fonts, etc.)
├── package.json
└── README.md
```

## Pages Overview

### Home Page (`/pages/home`)
- Landing page with navigation to other sections
- Quick access buttons to Profile, Search, and Settings

### Profile Page (`/pages/profile`)
- User profile information display
- Avatar, name, email, and profile details
- Navigation to detailed view

### Settings Page (`/pages/settings`)
- App preferences and configuration
- Toggle settings (notifications, dark mode, auto-save)
- Account management options
- Logout functionality

### Search Page (`/pages/search`)
- Search functionality with real-time filtering
- List of searchable items
- Navigation to item details

### Details Page (`/pages/details`)
- Detailed view of selected items
- Displays item information passed via navigation params
- Can be accessed from Profile and Search pages

### Auth Page (`/pages/auth`)
- Authentication screen (Login/Register)
- Toggle between sign-in and sign-up modes
- Form validation ready

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (installed automatically)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platform:
```bash
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web browser
```

## Navigation

The app uses React Navigation with a stack navigator:

- **Stack Navigator**: Manages page transitions
- **Navigation Props**: Each page receives `navigation` and `route` props
- **Navigation Methods**:
  - `navigation.navigate('PageName')` - Navigate to a page
  - `navigation.navigate('PageName', { params })` - Pass parameters
  - `navigation.goBack()` - Go back to previous screen

## Dependencies

- `expo`: ~55.0.6
- `react`: 19.2.0
- `react-native`: 0.83.2
- `@react-navigation/native`: Latest
- `@react-navigation/native-stack`: Latest
- `react-native-screens`: Latest
- `react-native-safe-area-context`: Latest

## Extending the App

### Adding a New Page

1. Create a new directory in `pages/`:
```bash
mkdir pages/newpage
```

2. Create the page component:
```javascript
// pages/newpage/NewPage.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewPage({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>New Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

3. Create an index file:
```javascript
// pages/newpage/index.js
export { default } from './NewPage';
```

4. Add to navigation in `App.js`:
```javascript
import NewPage from './pages/newpage';

// In the Stack.Navigator:
<Stack.Screen 
  name="NewPage" 
  component={NewPage} 
  options={{ title: 'New Page' }}
/>
```

## Best Practices

- Keep page components in their own directories
- Use index.js files for clean imports
- Follow React Native style conventions
- Keep components simple and focused
- Use navigation params for passing data between screens

## License

MIT
