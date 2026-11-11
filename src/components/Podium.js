import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { answerStyles, colors, fonts } from '@/theme';

/**
 * Siegertreppchen für die Top 3 (Gold, Silber, Bronze) – wie Ranglisten aus Spielen
 * (Erwartungskonformität). Reihenfolge auf dem Bildschirm: 2 · 1 · 3.
 * entries: bereits sortiert, [0] = Rang 1
 */
export default function Podium({ entries }) {
  const places = [
    { rank: 2, entry: entries[1], height: 92, color: colors.silver, avatar: answerStyles[1].color },
    { rank: 1, entry: entries[0], height: 132, color: colors.yellow, avatar: answerStyles[0].color },
    { rank: 3, entry: entries[2], height: 68, color: colors.bronze, avatar: answerStyles[3].color },
  ];

  return (
    <View style={styles.box} accessibilityRole="list" accessibilityLabel="Top 3">
      {places.map(({ rank, entry, height, color, avatar }) => (
        <View key={rank} style={styles.col} accessible accessibilityLabel={entry ? `Rang ${rank}: ${entry.nickname}, ${entry.points} Punkte` : `Rang ${rank}: frei`}>
          {entry ? (
            <>
              {rank === 1 && <MaterialCommunityIcons name="crown" size={24} color={colors.yellow} />}
              <View style={[styles.avatar, { backgroundColor: avatar }]}>
                <Text style={styles.avatarText}>{entry.nickname.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {entry.nickname}
              </Text>
              <Text style={styles.points}>{entry.points}</Text>
            </>
          ) : (
            <Text style={styles.free}>–</Text>
          )}
          <View style={[styles.step, { height, backgroundColor: color }]}>
            <Text style={styles.rank}>{rank}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    backgroundColor: colors.game,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    overflow: 'hidden',
  },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.black, fontSize: 20, color: colors.white },
  name: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.white, maxWidth: '100%' },
  points: { fontFamily: fonts.semiBold, fontSize: 14, color: '#D6D0F5' },
  free: { fontFamily: fonts.bold, fontSize: 16, color: '#8F86C8', marginBottom: 6 },
  step: {
    alignSelf: 'stretch',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 6,
  },
  rank: { fontFamily: fonts.black, fontSize: 26, color: colors.text },
});
