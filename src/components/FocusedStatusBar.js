import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Statusleiste nur für den sichtbaren Screen setzen (z. B. hell auf dem dunklen Frage- und Resultat-Screen).
 * Ein Screen bleibt im Hintergrund geladen, wenn man den Tab wechselt; ohne diesen Baustein bliebe
 * die Statusleiste dann auch auf hellen Screens hell und wäre kaum lesbar.
 */
export default function FocusedStatusBar({ style }) {
  const [focused, setFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  return focused ? <StatusBar style={style} /> : null;
}
