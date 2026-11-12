// Tab-Bar mit nur zwei Tabs: «Spielen» und «Bestenliste» (Konzept 9: Navigation einfach halten).
// Während der Quizrunde (Frage-Screen) wird die Tab-Bar ausgeblendet,
// damit man nicht aus Versehen den Screen wechselt.
import { Tabs, useSegments } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/theme';

export default function TabLayout() {
  const segments = useSegments();
  const inQuiz = segments.includes('frage');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.extraBold, fontSize: 13 },
        tabBarStyle: inQuiz ? { display: 'none' } : styles.bar,
        tabBarItemStyle: { minHeight: 56 },
      }}
    >
      <Tabs.Screen
        name="(spielen)"
        options={{
          title: 'Spielen',
          tabBarAccessibilityLabel: 'Spielen',
          // Beim Wechsel zur Bestenliste den Spielen-Stack auf Home zurücksetzen:
          // Tab «Spielen» führt danach immer zur Startseite, nicht zum alten Resultat.
          popToTopOnBlur: true,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Ionicons name="play-circle-outline" size={24} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="bestenliste"
        options={{
          title: 'Bestenliste',
          tabBarAccessibilityLabel: 'Bestenliste',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Ionicons name="trophy-outline" size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

/** Aktiver Tab bekommt eine helle violette «Pille» hinter dem Icon (wie im Screendesign). */
function TabIcon({ focused, children }) {
  return <View style={[styles.pill, focused && styles.pillActive]}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
    height: 72,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: colors.card,
    borderTopColor: colors.border,
  },
  pill: { width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.primarySoft },
});
