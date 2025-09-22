import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import SmartImage from "../SmartImage";
import { useCars } from "../CarContext";

const SCREEN_W = Dimensions.get("window").width;
// card rộng vừa tay, chừa padding 16 ở container Home + gap
const CARD_W = Math.min(240, SCREEN_W * 0.68);
const CARD_H = 150;

export default function AvailableList({
  navigation,
  limit = 6,
  showHeader = true,
}) {
  const { carsApproved = [], loading } = useCars();

  const data = useMemo(() => {
    if (!Array.isArray(carsApproved)) return [];
    return carsApproved.slice(0, Math.max(0, limit));
  }, [carsApproved, limit]);

  const renderItem = ({ item, index }) => {
    const image = item.imageUrl ?? item.image_url ?? null;
    const ownerId = item.ownerId ?? item.owner_id ?? null;
    const price = Number(item.pricePerDay ?? item.price_per_day ?? 0);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.card,
          // tạo cảm giác canh lề trái đẹp khi là item đầu
          index === 0 && { marginLeft: 2 },
        ]}
        onPress={() => navigation.navigate("CarDetail", { id: item.id })}
      >
        <SmartImage uri={image} ownerId={ownerId} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name || "Không rõ tên"}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {(item.brand || "—") + " • " + (item.location || "—")}
          </Text>
          <Text style={styles.price}>
            {price.toLocaleString()} đ / ngày
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data.length) {
    return showHeader ? (
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.empty}>Chưa có xe nào.</Text>
      </View>
    ) : null;
  }

  return (
    <View>
      {showHeader && <Text style={styles.sectionTitle}>Xe đang có sẵn</Text>}
      <FlatList
        data={data}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0b132b",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  loadingBox: { paddingVertical: 12, alignItems: "center" },
  empty: { color: "#334155", opacity: 0.8, paddingVertical: 8 },

  hList: {
    paddingVertical: 6,
    paddingRight: 2,
  },

  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
    // shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    // elevation Android
    elevation: 2,
  },

  image: {
    width: "100%",
    height: CARD_H - 64, // phần ảnh lớn, info 64px
    backgroundColor: "#f1f5f9",
  },

  info: { padding: 10, gap: 2 },
  name: { fontSize: 14, fontWeight: "800", color: "#0b132b" },
  meta: { fontSize: 12, color: "#6b7280" },
  price: { marginTop: 2, fontSize: 13, fontWeight: "800", color: "#0ea5e9" },
});
