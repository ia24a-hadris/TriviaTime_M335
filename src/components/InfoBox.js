import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, sizes } from '@/theme';

/** Hinweis-Kasten, z. B. «Die Fragen kommen live aus der Open Trivia DB und sind auf Englisch.» */
export default function InfoBox({ children, icon = 'information-circle-outline' }) {
  return (
    <View style={styles.box}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: sizes.radius,
    backgroundColor: colors.primarySoft,
    alignItems: 'flex-start',
  },
  text: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.text, lineHeight: 21 },
});

export const bold = { fontFamily: fonts.extraBold };
