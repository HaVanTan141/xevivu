// components/AdminScreen.js
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from "react-native";
import { useAuth } from "./AuthContext";
import { useCars } from "./CarContext";
import { useBookings } from "./BookingContext";
import SmartImage from "./SmartImage";
import { LinearGradient } from "expo-linear-gradient";
import { appGradient } from "./theme";

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getCarField = (item, key) => {
  // chấp nhận cả snake_case và camelCase
  switch (key) {
    case "image":
      return item.imageUrl ?? item.image_url ?? null;
    case "ownerId":
      return item.ownerId ?? item.owner_id ?? null;
    case "ownerPhone":
      return item.ownerPhone ?? item.owner_phone ?? null;
    case "pricePerDay":
      return item.pricePerDay ?? item.price_per_day ?? 0;
    default:
      return item[key];
  }
};

export default function AdminScreen() {
  const { currentUser } = useAuth();
  const { carsPending, carsApproved, approveCar, rejectCar, deleteCar } = useCars();
  const { bookings } = useBookings();

  const [filter, setFilter] = useState("all");
  const isAdmin = currentUser?.role === "admin";

  const bookingsFiltered = useMemo(() => {
    const base = bookings || [];
    if (!isAdmin) return [];
    if (filter === "all") return base;
    return base.filter((b) => b.status === filter);
  }, [bookings, filter, isAdmin]);

  const callOwner = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${String(phone).replace(/\s+/g, "")}`).catch(() => {});
  };

  const CarCard = ({ item, approved }) => {
    const price = toNumber(getCarField(item, "pricePerDay"));
    const image = getCarField(item, "image");
    const ownerId = getCarField(item, "ownerId");
    const ownerPhone = getCarField(item, "ownerPhone");

    return (
      <View style={styles.card}>
        <SmartImage uri={image} ownerId={ownerId} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {(item.brand || "Không rõ")} • {(item.location || "—")}
          </Text>
          <Text style={styles.price}>{price.toLocaleString()} đ / ngày</Text>

          <View style={styles.ownerRow}>
            <Text style={styles.ownerLabel}>Điện thoại: </Text>
            <Text style={styles.ownerPhone}>{ownerPhone || "—"}</Text>
            {!!ownerPhone && (
              <TouchableOpacity style={styles.callBtn} onPress={() => callOwner(ownerPhone)}>
                <Text style={styles.callTxt}>Gọi</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.actions}>
            {!approved ? (
              <>
                <TouchableOpacity style={[styles.btn, styles.primary]} onPress={() => approveCar(item.id)}>
                  <Text style={styles.btnText}>Duyệt</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.danger]}
                  onPress={() =>
                    Alert.alert("Từ chối xe?", "Bạn chắc chắn muốn từ chối xe này?", [
                      { text: "Huỷ" },
                      { text: "Từ chối", style: "destructive", onPress: () => rejectCar(item.id) },
                    ])
                  }
                >
                  <Text style={styles.btnText}>Từ chối</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.danger]}
                onPress={() =>
                  Alert.alert("Xoá xe?", "Bạn chắc chắn muốn xoá xe này?", [
                    { text: "Huỷ" },
                    { text: "Xoá", style: "destructive", onPress: () => deleteCar(item.id) },
                  ])
                }
              >
                <Text style={styles.btnText}>Xoá</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!isAdmin) {
    return (
      <LinearGradient style={{ flex: 1 }} colors={appGradient.colors} start={appGradient.start} end={appGradient.end}>
        <View style={styles.center}>
          <Text style={{ color: "#0b132b", fontWeight: "700" }}>Bạn không có quyền truy cập trang này.</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient style={{ flex: 1 }} colors={appGradient.colors} start={appGradient.start} end={appGradient.end}>
      <FlatList
        style={{ flex: 1 }}
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>Bảng điều khiển Admin</Text>
              <Text style={styles.headerSub}>Duyệt xe mới, quản lý xe đã duyệt & theo dõi các chuyến</Text>
            </View>

            <Text style={styles.sectionTitle}>Xe chờ duyệt</Text>
            <FlatList
              data={carsPending || []}
              keyExtractor={(it) => "p-" + String(it.id)}
              renderItem={({ item }) => <CarCard item={item} approved={false} />}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              ListEmptyComponent={
                <Text style={{ paddingHorizontal: 16, color: "#0b132b", opacity: 0.7 }}>
                  Không có xe chờ duyệt.
                </Text>
              }
            />

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Xe đã duyệt</Text>
            <FlatList
              data={carsApproved || []}
              keyExtractor={(it) => "a-" + String(it.id)}
              renderItem={({ item }) => <CarCard item={item} approved={true} />}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              ListEmptyComponent={
                <Text style={{ paddingHorizontal: 16, color: "#0b132b", opacity: 0.7 }}>
                  Chưa có xe nào được duyệt.
                </Text>
              }
            />
          </View>
        }
        data={[]}
        renderItem={null}
        ListFooterComponent={
          <View style={{ padding: 16 }}>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Tất cả chuyến</Text>
            {/* TODO: bảng chuyến của bạn – có thể thêm hiển thị phone người thuê nếu có */}
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0b132b" },
  headerSub: { color: "#334155", marginTop: 4 },

  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0b132b" },

  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginVertical: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: 90, height: 70, borderRadius: 8, backgroundColor: "#f1f5f9" },
  name: { fontSize: 16, fontWeight: "700", color: "#0b132b" },
  meta: { color: "#666", marginTop: 2 },
  price: { marginTop: 6, fontWeight: "700", color: "#0ea5e9" },

  ownerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" },
  ownerLabel: { color: "#334155", fontWeight: "600" },
  ownerPhone: { color: "#111827" },
  callBtn: { marginLeft: 8, backgroundColor: "#0ea5e9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  callTxt: { color: "#fff", fontWeight: "700" },

  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  primary: { backgroundColor: "#0ea5e9" },
  danger: { backgroundColor: "#ef4444" },
  btnText: { color: "#fff", fontWeight: "600" },

  filterRow: { flexDirection: "row", gap: 8, marginVertical: 10 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#ffffffaa",
  },
  filterBtnActive: { backgroundColor: "#E6F3FB", borderColor: "#0ea5e9" },
  filterText: { color: "#444" },
  filterTextActive: { color: "#0ea5e9", fontWeight: "700" },
});
