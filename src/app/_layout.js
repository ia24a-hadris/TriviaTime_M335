// Root-Layout: lädt die Schrift Nunito und definiert den obersten Stack.
// Darin liegen die Tabs (Spielen, Bestenliste) und der Test-Screen für die UI-Bausteine.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { colors, fonts } from '@/theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  // Solange die Schrift lädt, kurz einen Ladeindikator zeigen (bei Fehler mit Systemschrift weiter)
  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.game }}>
        <ActivityIndicator color={colors.yellow} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTitleStyle: { fontFamily: fonts.black },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="bausteine" options={{ title: 'UI-Bausteine (Test)' }} />
      </Stack>
    </>
  );
}
