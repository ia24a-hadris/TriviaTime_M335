import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, sizes, text } from '@/theme';

/**
 * Auswahlliste (z. B. Kategorie). Antippen öffnet eine Liste in einem Modal;
 * jede Zeile ist 56 dp hoch, damit sie mit dem Daumen gut treffbar ist.
 * options: [{ id, name }]
 */
export default function SelectField({ label, value, options, onChange, error, placeholder = 'Bitte wählen' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <View style={styles.wrap}>
      <Text style={text.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected ? selected.name : placeholder}`}
        accessibilityHint="Öffnet die Auswahl"
        style={({ pressed }) => [styles.field, error && styles.fieldError, pressed && styles.pressed]}
      >
        <Text style={[styles.value, !selected && { color: colors.textMuted }]} numberOfLines={1}>
          {selected ? selected.name : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={22} color={colors.text} />
      </Pressable>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="warning" size={16} color={colors.wrong} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        {/* Eigener Provider: im Modal kennt iOS sonst die Statusleiste nicht und der Titel rutscht darunter */}
        <SafeAreaProvider>
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={[text.title, { flex: 1 }]} accessibilityRole="header">
                {label} wählen
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Schliessen"
                style={styles.close}
              >
                <Ionicons name="close" size={26} color={colors.text} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(o) => String(o.id)}
              contentContainerStyle={{ paddingBottom: 24 }}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              renderItem={({ item }) => {
                const active = item.id === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.pressed]}
                  >
                    <Text style={[styles.rowText, active && { color: colors.primary }]}>{item.name}</Text>
                    {active && <Ionicons name="checkmark" size={22} color={colors.primary} />}
                  </Pressable>
                );
              }}
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  field: {
    minHeight: sizes.mainButton,
    borderRadius: sizes.radiusSmall,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldError: { borderColor: colors.wrong, borderWidth: 2 },
  pressed: { backgroundColor: colors.primarySoft },
  value: { flex: 1, fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { fontFamily: fonts.bold, fontSize: 13, color: colors.wrong, flex: 1 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  row: {
    minHeight: sizes.mainButton,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  rowActive: { backgroundColor: colors.primarySoft },
  rowText: { flex: 1, fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  sep: { height: 1, backgroundColor: colors.border },
});
