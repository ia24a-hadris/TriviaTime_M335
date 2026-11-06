// Screen 4 · Resultat – Stand Fr 6.11.: Platzhalter für die Navigation (S3).
// Das Design (T5) und Punkte/Speichern (S5, S6) folgen am Mi 11.11.
//
// Wird mit Replace geöffnet → kein Zurück ins beendete Quiz.
// «Nochmals spielen» → Replace zur Frage · «Startseite» → popToTop · «Bestenliste» → Tab
import { useCallback } from 'react';
import { BackHandler, Text } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '@/components/Screen';
import ScreenHeader from '@/components/ScreenHeader';
import Card from '@/components/Card';
import AppButton from '@/components/AppButton';
import { DIFFICULTY_LABEL } from '@/services/quizApi';
import { text } from '@/theme';

export default function ResultatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Android-Zurück führt zur Startseite statt zurück ins Setup
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        router.dismissAll();
        return true;
      });
      return () => sub.remove();
    }, [router])
  );

  const { correct, ...quizParams } = params;

  return (
    <Screen
      footer={
        <>
          <AppButton title="Nochmals spielen" icon="refresh" onPress={() => router.replace({ pathname: '/frage', params: quizParams })} />
          <AppButton title="Bestenliste" variant="secondary" icon="trophy-outline" onPress={() => router.navigate('/bestenliste')} />
          <AppButton title="Startseite" variant="ghost" small onPress={() => router.dismissAll()} />
        </>
      }
    >
      <ScreenHeader title="Resultat" />
      <Card>
        <Text style={text.overline}>Platzhalter</Text>
        <Text style={text.body}>
          {params.categoryName} · {DIFFICULTY_LABEL[params.difficulty]} · {params.amount} Fragen
        </Text>
        <Text style={text.help}>Punkte, Rechenzeile und Status «Gespeichert» folgen mit S5/S6/T5.</Text>
      </Card>
    </Screen>
  );
}
