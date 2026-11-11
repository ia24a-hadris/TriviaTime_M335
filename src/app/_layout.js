// Root-Layout: lädt die Schrift Nunito, sendet wartende Scores (S7) und definiert den obersten Stack.
// Darin liegen die Tabs (Spielen, Bestenliste) und der Test-Screen für die UI-Bausteine.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { syncScores } from '@/services/scoreSync';
import { colors, fonts } from '@/theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  // S7: Scores aus der Warteschlange senden – beim Start und wenn die App wieder aktiv wird
  useEffect(() => {
    syncScores().catch(() => {});
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncScores().catch(() => {});
    });
    return () => sub.remove();
  }, []);

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
