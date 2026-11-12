import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DIFFICULTY_LABEL, POINTS } from '@/services/quizApi';
import { DIFFICULTIES } from '@/services/leaderboard';
import { colors, fonts, sizes } from '@/theme';

/**
 * Bestenliste in drei Seiten: Leicht → Mittel → Schwer.
 * - Wischen nach links/rechts wechselt die Seite (horizontales ScrollView mit pagingEnabled, läuft in Expo Go).
 * - Die Reiter oben zeigen die aktuelle Seite; Antippen wechselt ebenfalls (Bedienung ohne Wischgeste).
 * - Die Seiten sind unterschiedlich lang: Der Pager nimmt jeweils die Höhe der sichtbaren Seite an,
 *   damit unter einer kurzen Liste keine leere Fläche bleibt.
 * value: 'easy' | 'medium' | 'hard' · onChange(difficulty) · renderPage(difficulty)
 */
export default function DifficultyPager({ value, onChange, renderPage }) {
  const scrollRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState({});
  const index = Math.max(0, DIFFICULTIES.indexOf(value));

  const x = useRef(0); // aktuelle Scroll-Position
  const target = useRef(null); // Seite, zu der gerade per Code gescrollt wird

  // Seite anzeigen, wenn sich value von aussen ändert (Reiter, Link vom Resultat) oder die Breite feststeht
  useEffect(() => {
    if (!width || Math.abs(x.current - index * width) < 2) return;
    target.current = index;
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  }, [index, width]);

  // Erst wenn eine Seite ganz eingerastet ist, gilt sie als gewählt
  function handleScroll(e) {
    if (!width) return;
    x.current = e.nativeEvent.contentOffset.x;
    const i = Math.min(Math.max(Math.round(x.current / width), 0), DIFFICULTIES.length - 1);
    if (Math.abs(x.current - i * width) >= 2) return;
    if (target.current !== null) {
      // Scrollen nach Antippen eines Reiters: Zwischenseiten überspringen
      if (i === target.current) target.current = null;
      return;
    }
    if (DIFFICULTIES[i] !== value) onChange(DIFFICULTIES[i]);
  }

  return (
    <View style={{ gap: sizes.gap * 1.5 }}>
      <View style={styles.tabs} accessibilityRole="tablist" accessibilityLabel="Schwierigkeit">
        {DIFFICULTIES.map((d) => {
          const active = d === value;
          return (
            <Pressable
              key={d}
              onPress={() => onChange(d)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Bestenliste ${DIFFICULTY_LABEL[d]}`}
              style={({ pressed }) => [styles.tab, pressed && !active && { opacity: 0.6 }]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{DIFFICULTY_LABEL[d]}</Text>
              <Text style={[styles.tabSub, active && { color: colors.primary }]}>{POINTS[d]} P. pro Frage</Text>
              <View style={[styles.indicator, active && styles.indicatorActive]} />
            </Pressable>
          );
        })}
      </View>

      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={32}
            onScroll={handleScroll}
            onScrollBeginDrag={() => (target.current = null)}
            style={heights[value] ? { height: heights[value] } : null}
            contentContainerStyle={{ alignItems: 'flex-start' }}
          >
            {DIFFICULTIES.map((d) => (
              <View
                key={d}
                style={{ width }}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  setHeights((s) => (s[d] === h ? s : { ...s, [d]: h }));
                }}
                accessibilityElementsHidden={d !== value}
                importantForAccessibility={d === value ? 'auto' : 'no-hide-descendants'}
              >
                {renderPage(d)}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingTop: 6, minHeight: sizes.touchMin, gap: 2 },
  tabText: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  tabSub: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textMuted },
  indicator: { alignSelf: 'stretch', height: 3, marginTop: 6, borderRadius: 2, backgroundColor: 'transparent' },
  indicatorActive: { backgroundColor: colors.primary },
});
