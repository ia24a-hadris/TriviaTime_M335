import { StyleSheet, Text, View } from 'react-native';
import IconButton from './IconButton';
import { sizes, text } from '@/theme';

/**
 * Einheitlicher Header für alle Menü-Screens (Erwartungskonformität):
 * links optional ← Zurück, dann Titel, rechts optional eine Aktion (z. B. ✎).
 */
export default function ScreenHeader({ title, onBack, right, onTitleLongPress }) {
  return (
    <View style={styles.row}>
      {onBack && (
        <IconButton icon="chevron-back" label="Zurück" onPress={onBack} filled={false} color="#1C1B2E" size={48} />
      )}
      <Text
        style={[text.title, styles.title]}
        accessibilityRole="header"
        onLongPress={onTitleLongPress}
        suppressHighlighting
      >
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.gap,
    minHeight: 64,
    marginBottom: sizes.gap,
  },
  title: { flex: 1 },
});
