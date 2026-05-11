import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";

import HomePage from './pages/home';
import ProfilePage from './pages/profile';
import SettingsPage from './pages/settings';
import SearchPage from './pages/search';
import DetailsPage from './pages/details';
import AuthPage from './pages/auth';
import MapPage from "./pages/map";

import { House, Map, Settings2 } from "lucide-react-native";

import { colors, typography } from './theme';
import { PlateauSelectionProvider } from "./context/PlateauSelectionContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function tabIcon(routeName, focused) {
  const iconColor = focused ? colors.text : colors.textSecondary;
  if (routeName === "Home") {
    return <House size={16} color={iconColor} />;
  }
  if (routeName === "Map") {
    return <Map size={16} color={iconColor} />;
  }
  return <Settings2 size={16} color={iconColor} />;
}

function GlassTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarOuter}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          return (
            <Pressable
              key={route.key}
              style={[styles.tabItem, focused ? styles.tabItemActive : null]}
              onPress={() => navigation.navigate(route.name)}
            >
              <View style={styles.tabIcon}>{tabIcon(route.name, focused)}</View>
              <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : null]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Map" component={MapPage} />
      <Tab.Screen name="Settings" component={SettingsPage} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PlateauSelectionProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="MainTabs"
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
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfilePage} 
            options={{ 
              title: 'Profile',
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
    </PlateauSelectionProvider>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
  },
  tabBarInner: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  tabItem: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabItemActive: {
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.text,
    fontWeight: "700",
  },
});
