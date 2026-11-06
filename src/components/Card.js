import { StyleSheet, View } from 'react-native';
import { colors, sizes } from '@/theme';

/** Weisse Karte für Menü-Screens (Home, Bestenliste). dark=true: Begrüssungskarte im Spiel-Violett. */
export default function Card({ children, dark = false, style }) {
  return <View style={[styles.card, dark && styles.dark, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEEDF5',
    shadowColor: '#1C1B2E',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  dark: { backgroundColor: colors.game, borderColor: colors.game },
});

export const cardGap = sizes.gap * 2;
