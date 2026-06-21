import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { StoreProvider, useSessionStore } from './src/stores';
import { colors, fonts } from './src/theme';
import TabBar from './src/navigation/TabBar';
import ScanScreen from './src/screens/ScanScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LockScreen from './src/screens/LockScreen';

const Tab = createBottomTabNavigator();

function Splash({ label }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.gold} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

// Gates the app behind onboarding + the vault lock.
const AuthGate = observer(() => {
  const session = useSessionStore();
  if (!session.hydrated) return <Splash label="Opening the vault…" />;
  if (!session.onboarded) return <OnboardingScreen />;
  if (session.locked) return <LockScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        initialRouteName="Scan"
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tab.Screen name="Collection" component={CollectionScreen} />
        <Tab.Screen name="Scan" component={ScanScreen} />
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
});

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.base,
    card: colors.surface,
    text: colors.ivory,
    border: colors.hairline,
    primary: colors.gold,
  },
};

export default function App() {
  const [loaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!loaded) return <Splash label="Opening the vault…" />;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <AuthGate />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    color: colors.muted,
    fontSize: 14,
    fontFamily: fonts.body,
  },
});
