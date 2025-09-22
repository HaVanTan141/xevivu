// components/CarListScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useCars } from "./CarContext";
import SmartImage from "./SmartImage";
import { appGradient } from "./theme";

const getField = (item, key) => {
  switch (key) {
    case "id":
      return item.id;
    case "image":
      return item.imageUrl ?? item.image_url ?? null;
    case "ownerId":
      return item.ownerId ?? item.owner_id ?? null;
    case "pricePerDay":
      return item.pricePerDay ?? item.price_per_day ?? 0;
    default:
      return item[key];
  }
};

export default function CarListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { carsApproved = [], loading } = useCars();

  const renderItem = ({ item }) => {
    const image = getField(item, "image");
    const ownerId = getField(item, "ownerId");
    const price = Number(getField(item, "pricePerDay") || 0);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => navigation.navigate("CarDetail", { id: item.id })}
      >
        <SmartImage uri={image} ownerId={ownerId} style={styles.image} />

        <View style={styles.cardBody}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name || "Không rõ tên"}
          </Text>

          <Text style={styles.meta} numberOfLines={1}>
            {(item.brand || "—") + " • " + (item.location || "—")}
          </Text>

          {(item.year || item.engine) ? (
            <Text style={styles.meta2} numberOfLines={1}>
              {item.year ? `Năm: ${item.year}` : ""}
              {item.year && item.engine ? " • " : ""}
              {item.engine || ""}
            </Text>
          ) : null}

          <Text style={styles.price}>{price.toLocaleString()} đ / ngày</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={[styles.emptyBox, { paddingBottom: insets.bottom + 56 }]}>
          <ActivityIndicator size="large" />
          <Text style={styles.emptyText}>Đang tải xe…</Text>
        </View>
      );
    }
    return (
      <View style={[styles.emptyBox, { paddingBottom: insets.bottom + 56 }]}>
        <Ionicons name="car-sport-outline" size={28} color="#ffffffd0" />
        <Text style={styles.emptyText}>Chưa có xe nào.</Text>
      </View>
    );
  };

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={appGradient.colors}
      start={appGradient.start}
      end={appGradient.end}
    >
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 72 },
        ]}
        data={carsApproved}
        keyExtractor={(it) => String(getField(it, "id"))}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Xe đang có sẵn</Text>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0b132b",
    marginBottom: 8,
    // vì nền sáng dần, thêm bóng chữ mỏng để dễ đọc
    textShadowColor: "rgba(255,255,255,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.92)", // trắng mềm thấy nhẹ gradient
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    // Android elevation
    elevation: 2,
  },

  image: {
    width: 110,
    height: 78,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },

  cardBody: { flex: 1, minWidth: 0 },

  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0b132b",
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: "#475569",
  },
  meta2: {
    marginTop: 2,
    fontSize: 12,
    color: "#334155",
  },
  price: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "800",
    color: "#0ea5e9", // màu chủ đạo của app
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    color: "#ffffffd0",
    fontSize: 14,
    fontWeight: "600",
  },
});
