import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomePage from './pages/home';
import ProfilePage from './pages/profile';
import SettingsPage from './pages/settings';
import SearchPage from './pages/search';
import DetailsPage from './pages/details';
import AuthPage from './pages/auth';

import { colors, typography } from './theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomePage} 
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfilePage} 
          options={{ 
            title: 'Profile',
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsPage} 
          options={{ 
            title: 'Settings',
          }}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchPage} 
          options={{ 
            title: 'Find Charger',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsPage} 
          options={{ 
            title: 'Trip Details',
          }}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthPage} 
          options={{ 
            title: 'Sign In',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
