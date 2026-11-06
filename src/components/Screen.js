import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, sizes } from '@/theme';

/**
 * Grundgerüst eines Screens: Safe Area oben, scrollbarer Inhalt und ein fixer Bereich unten
 * (footer) für die Hauptbuttons – damit liegen sie immer in der Daumenzone.
 */
export default function Screen({ children, footer, dark = false, scroll = true }) {
  const bg = dark ? colors.game : colors.background;
  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? { contentContainerStyle: styles.content, keyboardShouldPersistTaps: 'handled' }
    : { style: [styles.content, { flex: 1 }] };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'left', 'right']}>
      <Body {...bodyProps}>{children}</Body>
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: sizes.screenPadding, paddingBottom: sizes.screenPadding * 2, gap: sizes.gap * 2 },
  footer: { paddingHorizontal: sizes.screenPadding, paddingBottom: sizes.screenPadding, gap: sizes.gap * 1.5 },
});
