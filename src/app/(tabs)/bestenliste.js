// Screen 5 · Bestenliste – Stand Fr 6.11.: Platzhalter (eigener Tab, kein Zurück).
// Umschalter Online/Lokal, Liste und Zustände folgen mit T5 (Mi 11.11.) und S7 (Do 12.11.).
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import ScreenHeader from '@/components/ScreenHeader';
import SegmentedControl from '@/components/SegmentedControl';
import StateView from '@/components/StateView';

export default function BestenlisteScreen() {
  const router = useRouter();
  const [mode, setMode] = useState('online');

  return (
    <Screen>
      <ScreenHeader title="Bestenliste" />
      <SegmentedControl
        label="Bestenliste anzeigen"
        options={[
          { value: 'online', label: 'Online' },
          { value: 'lokal', label: 'Lokal' },
        ]}
        value={mode}
        onChange={setMode}
      />
      <StateView
        kind="empty"
        title="Noch keine Einträge"
        message="Spiele ein Quiz, um hier zu erscheinen."
        actionTitle="Quiz starten"
        actionIcon="play"
        onAction={() => router.navigate('/setup')}
      />
    </Screen>
  );
}
