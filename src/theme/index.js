// Theme gemäss Farbkonzept (Konzept Kapitel 8.1) und Schrift Nunito (Kapitel 8.4).
// «Spiel bunt, Menü ruhig»: Menü-Screens hell mit einer Akzentfarbe,
// Frage-Screen dunkel mit vier kräftigen Antwortfarben.

export const colors = {
  primary: '#5B3FD9', // Hauptbuttons, aktiver Tab, eigene Zeile
  primaryPressed: '#4A31BD',
  primarySoft: '#ECE8FB', // aktiver Tab-Hintergrund, Info-Box
  background: '#F6F5FB', // Menü-Screens
  card: '#FFFFFF',
  border: '#E3E1EE',
  text: '#1C1B2E',
  textMuted: '#5E5C74',
  game: '#24175E', // Frage-Screen, Kopf Resultat, Begrüssungskarte
  yellow: '#FFC83D', // Punkte, Fortschritt, «Weiter», Gold
  answerA: '#7C3AED', // Stern
  answerB: '#1D6FD8', // Blitz
  answerC: '#D9480F', // Herz
  answerD: '#DB2777', // Mond
  correct: '#1E8E3E', // nur Feedback/Fehler, immer mit Symbol + Text
  wrong: '#C5221F',
  silver: '#DCDBE6',
  bronze: '#EBC3A0',
  disabled: '#C9C7D6',
  white: '#FFFFFF',
};

// Die vier Antworten: Farbe + Symbol + Buchstabe (auch für Farbenblinde unterscheidbar).
export const answerStyles = [
  { letter: 'A', color: colors.answerA, icon: 'star' },
  { letter: 'B', color: colors.answerB, icon: 'flash' },
  { letter: 'C', color: colors.answerC, icon: 'heart' },
  { letter: 'D', color: colors.answerD, icon: 'moon' },
];

export const fonts = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
};

// Mindestgrössen (Konzept 8.5): Touch-Targets ≥ 48 dp, Hauptbuttons 56 dp, Abstand ≥ 8 dp.
export const sizes = {
  touchMin: 48,
  mainButton: 56,
  answer: 64,
  gap: 8,
  screenPadding: 16,
  radius: 16,
  radiusSmall: 12,
};

export const text = {
  title: { fontFamily: fonts.black, fontSize: 26, color: colors.text },
  question: { fontFamily: fonts.black, fontSize: 23, color: colors.white },
  label: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.text },
  overline: {
    fontFamily: fonts.extraBold,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  help: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  button: { fontFamily: fonts.extraBold, fontSize: 17 },
};
