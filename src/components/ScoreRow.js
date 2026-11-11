import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, sizes } from '@/theme';

/** Eine Zeile der Bestenliste. own=true: eigene Zeile «Du» violett hervorgehoben. */
export default function ScoreRow({ rank, nickname, points, meta, own = false }) {
  return (
    <View
      style={[styles.row, own && styles.own]}
      accessible
      accessibilityLabel={`Rang ${rank}: ${nickname}${own ? ' (du)' : ''}, ${points} Punkte, ${meta}`}
    >
      <View style={[styles.rankCircle, own && styles.rankOwn]}>
        <Text style={[styles.rank, own && { color: colors.white }]}>{rank}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {nickname}
          </Text>
          {own && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Du</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      <Text style={styles.points}>{points}</Text>
    </View>
  );
}

/** Grauer Platzhalter für den Zustand «lädt». */
export function ScoreRowSkeleton() {
  return (
    <View style={styles.row}>
      <View style={[styles.rankCircle, styles.skeleton]} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={[styles.skeleton, { width: '55%', height: 14, borderRadius: 7 }]} />
        <View style={[styles.skeleton, { width: '35%', height: 10, borderRadius: 5 }]} />
      </View>
      <View style={[styles.skeleton, { width: 40, height: 16, borderRadius: 8 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderRadius: sizes.radius,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  own: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFEEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankOwn: { backgroundColor: colors.primary },
  rank: { fontFamily: fonts.black, fontSize: 16, color: colors.text },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: fonts.black, fontSize: 17, color: colors.text, flexShrink: 1 },
  badge: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 1 },
  badgeText: { fontFamily: fonts.extraBold, fontSize: 13, color: colors.white },
  meta: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
  points: { fontFamily: fonts.black, fontSize: 20, color: colors.text },
  skeleton: { backgroundColor: '#ECEBF3' },
});
