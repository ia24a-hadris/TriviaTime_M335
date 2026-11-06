// Test-Screen für Paket T1: alle UI-Bausteine auf einen Blick.
// Erreichbar in der Entwicklung mit langem Druck auf den Titel «Trivia Time» auf Home.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '@/components/AppButton';
import Card from '@/components/Card';
import AnswerOption from '@/components/AnswerOption';
import IconButton from '@/components/IconButton';
import TextField from '@/components/TextField';
import SegmentedControl from '@/components/SegmentedControl';
import Stepper from '@/components/Stepper';
import InfoBox from '@/components/InfoBox';
import StateView from '@/components/StateView';
import { colors, sizes, text } from '@/theme';

export default function BausteineScreen() {
  const [seg, setSeg] = useState('medium');
  const [num, setNum] = useState('10');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Section title="Farben">
        <View style={styles.swatches}>
          {Object.entries(colors).map(([name, value]) => (
            <View key={name} style={styles.swatchWrap}>
              <View style={[styles.swatch, { backgroundColor: value }]} />
              <Text style={text.help}>{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Schrift (Nunito)">
        <Text style={text.title}>Titel 26 Black</Text>
        <Text style={text.label}>Label 15 ExtraBold</Text>
        <Text style={text.body}>Fliesstext 15 Regular</Text>
        <Text style={text.help}>Hilfetext 13 Regular</Text>
      </Section>

      <Section title="Buttons (56 dp / 48 dp)">
        <AppButton title="Primär" icon="play" onPress={() => {}} />
        <AppButton title="Sekundär" icon="refresh" variant="secondary" onPress={() => {}} />
        <AppButton title="Gesperrt" disabled onPress={() => {}} />
        <AppButton title="Lädt" loading onPress={() => {}} />
        <AppButton title="Ghost (48 dp)" variant="ghost" small onPress={() => {}} />
        <View style={{ flexDirection: 'row', gap: sizes.gap }}>
          <IconButton icon="pencil" label="Bearbeiten" onPress={() => {}} />
          <IconButton icon="chevron-back" label="Zurück" filled={false} color={colors.text} size={48} onPress={() => {}} />
        </View>
      </Section>

      <Section title="Karte">
        <Card>
          <Text style={text.overline}>Letztes Quiz</Text>
          <Text style={text.body}>Science & Nature · Mittel · 10 Fragen</Text>
        </Card>
      </Section>

      <Section title="Formular">
        <TextField label="Nickname" value="ab" onChangeText={() => {}} error="Zu kurz: mindestens 3 Zeichen." />
        <SegmentedControl
          label="Schwierigkeit"
          value={seg}
          onChange={setSeg}
          options={[
            { value: 'easy', label: 'Leicht' },
            { value: 'medium', label: 'Mittel' },
            { value: 'hard', label: 'Schwer' },
          ]}
        />
        <Stepper label="Anzahl" value={num} onChange={setNum} min={5} max={20} />
        <InfoBox>Die Fragen kommen live aus der Open Trivia DB und sind auf Englisch.</InfoBox>
      </Section>

      <Section title="Antwortfelder (64 dp, 10 dp Abstand)" dark>
        <AnswerOption index={0} label="Ag" state="dimmed" />
        <AnswerOption index={1} label="Au" state="correct" />
        <AnswerOption index={2} label="Gd" state="wrong" />
        <AnswerOption index={3} label="Go" state="open" onPress={() => {}} />
      </Section>

      <Section title="Zustände">
        <StateView kind="loading" title="Wird geladen …" />
        <StateView kind="error" title="Keine Verbindung" message="Prüfe dein Internet." actionTitle="Erneut versuchen" onAction={() => {}} />
        <StateView kind="empty" title="Noch keine Einträge" />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children, dark }) {
  return (
    <View style={[styles.section, dark && { backgroundColor: colors.game }]}>
      <Text style={[text.overline, dark && { color: '#C9C3EE' }]}>{title}</Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, backgroundColor: colors.background },
  section: { gap: 10, padding: 14, borderRadius: 20, backgroundColor: colors.card },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatchWrap: { width: 70, alignItems: 'center', gap: 2 },
  swatch: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
});
