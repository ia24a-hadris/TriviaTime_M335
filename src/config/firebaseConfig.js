// Firebase-Konfiguration für die Online-Bestenliste (Pakete S2 / S7).
//
// Projekt «triviatime-40c70» in der Firebase-Konsole (console.firebase.google.com).
// TriviaTime_M335 schreibt in die eigene Sammlung «scores_m335» (getrennt von anderen Versionen).
//
// Der apiKey ist bei Firebase-Web-Apps KEIN Geheimnis: er steht in jeder Web-App öffentlich.
// Geschützt werden die Daten durch die Sicherheitsregeln in Firestore (siehe firestore.rules).
//
// Steht hier null, läuft die App ohne Online-Bestenliste (Plan B: nur lokal).

export const firebaseConfig = {
  apiKey: 'AIzaSyAlPDqElqbpDQSmU5xGazSQP3H1ro6os1k',
  authDomain: 'triviatime-40c70.firebaseapp.com',
  projectId: 'triviatime-40c70',
  storageBucket: 'triviatime-40c70.firebasestorage.app',
  messagingSenderId: '243952912821',
  appId: '1:243952912821:web:f335991c7e42411c2371fc',
};
