import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGroups } from "@/context/GroupsContext";

const COLORS = [
  "#6C63FF",
  "#E24B4A",
  "#1D9E75",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#10B981",
];

export default function GroupsScreen() {
  const { groups, addGroup, deleteGroup } = useGroups();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) {
      Alert.alert("Name required", "Please enter a group name.");
      return;
    }
    const group = await addGroup(name, selectedColor);
    setNewName("");
    setSelectedColor(COLORS[0]);
    setModalVisible(false);
  }

  function confirmDelete(id: number, name: string) {
    Alert.alert("Delete group", `Delete "${name}" and all its flashcards?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteGroup(id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#1a1a2e" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>My Groups</Text>
          <Text style={styles.subtitle}>
            {groups.length} group{groups.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(g) => g.id?.toString()!}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="albums-outline" size={64} color="#D3D1C7" />
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptyHint}>
              Tap + to create your first group
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              { borderLeftColor: item.color, borderLeftWidth: 5 },
            ]}
            onPress={() =>
              router.push({
                pathname: "/flashcards",
                params: { groupId: item.id },
              })
            }
            onLongPress={() => confirmDelete(item.id!, item.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.colorDot, { backgroundColor: item.color }]}>
              <Ionicons name="albums" size={20} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.flashcards.length} flashcard
                {item.flashcards.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B4B2A9" />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create group modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New group</Text>
            <TextInput
              style={styles.input}
              placeholder="Group name…"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={async () => await handleCreate()}
            />
            <Text style={styles.colorLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnCreate, { backgroundColor: selectedColor }]}
                onPress={async () => await handleCreate()}
              >
                <Text style={styles.btnCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F7FF" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#1a1a2e" },
  subtitle: { fontSize: 14, color: "#888780", marginTop: 2 },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  colorDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a2e" },
  cardMeta: { fontSize: 13, color: "#888780", marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#B4B2A9" },
  emptyHint: { fontSize: 14, color: "#B4B2A9" },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1a1a2e",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E3FF",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 13,
    color: "#888780",
    marginBottom: 10,
    fontWeight: "500",
  },
  colorRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  colorSwatch: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: { borderWidth: 3, borderColor: "#1a1a2e" },
  modalBtns: { flexDirection: "row", gap: 12 },
  btnCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E3FF",
    alignItems: "center",
  },
  btnCancelText: { fontSize: 15, color: "#888780", fontWeight: "500" },
  btnCreate: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnCreateText: { fontSize: 15, color: "#fff", fontWeight: "600" },
});
