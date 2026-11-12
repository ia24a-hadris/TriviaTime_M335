import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, sizes } from '@/theme';

/**
 * Grundgerüst eines Screens: Safe Area oben, scrollbarer Inhalt und ein fixer Bereich unten
 * (footer) für die Hauptbuttons – damit liegen sie immer in der Daumenzone.
 *
 * Passt der Inhalt nicht ganz auf den Bildschirm (kleines Handy, grosse Schrift), bekommt der
 * Footer oben eine Linie. So sieht man, dass es darüber weitergeht und die Karte nicht abgeschnitten ist.
 */
export default function Screen({ children, footer, dark = false, scroll = true, refreshControl }) {
  const bg = dark ? colors.game : colors.background;
  // Höhe sichtbarer Bereich, Höhe Inhalt, Scroll-Position → gibt es unten noch mehr Inhalt?
  const [m, setM] = useState({ view: 0, content: 0, y: 0 });
  const moreBelow = m.content - (m.view + m.y) > 1;

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      scrollEventThrottle={32}
      onLayout={(e) => {
        const view = e.nativeEvent.layout.height;
        setM((s) => (s.view === view ? s : { ...s, view }));
      }}
      onContentSizeChange={(_, content) => setM((s) => (s.content === content ? s : { ...s, content }))}
      onScroll={(e) => {
        const y = e.nativeEvent.contentOffset.y;
        setM((s) => (s.y === y ? s : { ...s, y }));
      }}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'left', 'right']}>
      {body}
      {footer && <View style={[styles.footer, { backgroundColor: bg }, scroll && moreBelow && styles.footerEdge]}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: sizes.screenPadding, paddingBottom: sizes.screenPadding * 2, gap: sizes.gap * 2 },
  footer: {
    paddingHorizontal: sizes.screenPadding,
    paddingTop: sizes.gap * 1.5,
    paddingBottom: sizes.screenPadding,
    gap: sizes.gap * 1.5,
    borderTopWidth: 1,
    borderTopColor: 'transparent', // Platz für die Linie immer reservieren → nichts springt
  },
  footerEdge: { borderTopColor: colors.border },
});
