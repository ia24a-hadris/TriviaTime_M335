import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '@/theme';

/** Gelber Ring «8 / 10 richtig» im Resultat. */
export default function ScoreRing({ correct, amount, size = 190, stroke = 18 }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = amount ? correct / amount : 0;

  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`${correct} von ${amount} richtig`}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.yellow}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.big}>
          {correct} / {amount}
        </Text>
        <Text style={styles.small}>richtig</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Text über dem Ring zentrieren (absoluteFillObject gibt es in React Native 0.88 nicht mehr)
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  big: { fontFamily: fonts.black, fontSize: 42, color: colors.white },
  small: { fontFamily: fonts.bold, fontSize: 16, color: '#D6D0F5', marginTop: -4 },
});
