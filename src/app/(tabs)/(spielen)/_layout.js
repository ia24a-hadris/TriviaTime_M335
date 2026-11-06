// Stack im Tab «Spielen»: Home → Quiz-Setup → Frage → Resultat (Workflow 7.1).
// - Frage: kein Wisch-Zurück; ✕ und Android-Zurück öffnen das Modal «Quiz abbrechen?»
// - Resultat: wird mit Replace geöffnet, darum kein Zurück ins beendete Quiz
import { Stack } from 'expo-router';
import { colors } from '@/theme';

export const unstable_settings = {
  anchor: 'index', // Home liegt immer unten im Stack (auch bei Deep Links)
};

export default function SpielenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="frage" options={{ gestureEnabled: false, contentStyle: { backgroundColor: colors.game } }} />
      <Stack.Screen name="resultat" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
