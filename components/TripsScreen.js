import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appGradient } from "./theme";

import { useAuth } from "./AuthContext";
import { useBookings } from "./BookingContext";
import SmartImage from "./SmartImage";

export default function TripsScreen() {
  const { currentUser } = useAuth();
  const { bookings, cancelBooking } = useBookings();

  // Chỉ hiển thị chuyến của chính người dùng
  const mine = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter((b) => b.userId === currentUser.id);
  }, [bookings, currentUser]);

  const [filter, setFilter] = useState("all"); // all | upcoming | completed | cancelled
  const filtered = useMemo(() => (filter === "all" ? mine : mine.filter((b) => b.status === filter)), [mine, filter]);

  const fmtTime = (iso) => {
    const t = new Date(iso);
    const d2 = (n) => (n < 10 ? `0${n}` : n);
    return `${d2(t.getHours())}:${d2(t.getMinutes())} ${d2(t.getDate())}/${d2(t.getMonth() + 1)}`;
  };

  const canCancel = (b) => b.status === "upcoming" && new Date(b.startDate).getTime() > Date.now();
  const onCancel = (id) => cancelBooking?.(id, { byUserId: currentUser?.id, role: currentUser?.role });

  const statusLabel = (s) => (s === "upcoming" ? "Sắp diễn ra" : s === "completed" ? "Hoàn thành" : "Đã huỷ");

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* stripe gradient */}
      <LinearGradient colors={appGradient.colors} start={appGradient.start} end={appGradient.end} style={styles.cardStripe} />
      <SmartImage uri={item.carImage} style={styles.image} />
      <View style={{ flex: 1 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{item.carName}</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{statusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.inline}>
          <Ionicons name="location-outline" size={14} color="#64748b" />
          <Text style={styles.meta}>{item.location}</Text>
        </View>

        <View style={styles.inline}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.range}>
            {fmtTime(item.startDate)} → {fmtTime(item.endDate)}
          </Text>
        </View>

        <Text style={styles.price}>
          {(item.totalPrice || item.pricePerDay)?.toLocaleString()} đ{item.totalPrice ? "" : " / ngày"}
        </Text>

        {/* NEW: trạng thái thanh toán */}
        <Text style={{ color: "#64748b", marginTop: 4 }}>
          Thanh toán: {item.paymentMethod === "bank"
            ? (item.paymentStatus === "paid" ? "Đã chuyển khoản" : "Chờ chuyển khoản")
            : "Tiền mặt khi nhận xe"}
        </Text>

        {canCancel(item) && (
          <TouchableOpacity style={[styles.btn, styles.ghost]} onPress={() => onCancel(item.id)}>
            <Text style={[styles.btnText, { color: "#ef4444" }]}>Huỷ chuyến</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient style={{ flex: 1 }} colors={appGradient.colors} start={appGradient.start} end={appGradient.end}>
      <FlatList
        style={{ flex: 1 }}
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <LinearGradient colors={appGradient.colors} start={appGradient.start} end={appGradient.end} style={styles.headerCard}>
              <Text style={styles.headerTitle}>Chuyến của bạn</Text>
              <Text style={styles.headerSub}>Theo dõi lịch sử & trạng thái thanh toán</Text>
            </LinearGradient>

            <View style={styles.filterRow}>
              {[
                { k: "all", label: "Tất cả" },
                { k: "upcoming", label: "Sắp diễn ra" },
                { k: "completed", label: "Hoàn thành" },
                { k: "cancelled", label: "Đã huỷ" },
              ].map((f) => (
                <TouchableOpacity
                  key={f.k}
                  onPress={() => setFilter(f.k)}
                  style={[styles.filterBtn, filter === f.k && styles.filterBtnActive]}
                >
                  <Text style={[styles.filterText, filter === f.k && styles.filterTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#0b132b", opacity: 0.7, paddingVertical: 20 }}>
            Bạn chưa có chuyến nào {filter !== "all" ? "ở mục này" : ""}.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#0b132b" },
  headerSub: { color: "#0b132b", opacity: 0.8, marginTop: 4 },

  filterRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffffaa",
  },
  filterBtnActive: { backgroundColor: "#E6F3FB", borderColor: "#0ea5e9" },
  filterText: { color: "#475569", fontWeight: "600" },
  filterTextActive: { color: "#0ea5e9" },

  card: {
    position: "relative",
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardStripe: {
    position: "absolute",
    left: 0, right: 0, top: 0,
    height: 4,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  image: { width: 90, height: 70, borderRadius: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "900", color: "#0b132b" },
  inline: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  meta: { color: "#64748b" },
  range: { color: "#334155" },
  price: { marginTop: 6, fontWeight: "800", color: "#0ea5e9" },

  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "#E6F3FB", borderWidth: 1, borderColor: "#bee3ff" },
  chipText: { color: "#0ea5e9", fontWeight: "800", fontSize: 12 },

  btn: { marginTop: 10, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  ghost: { backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#fecaca" },
  btnText: { fontWeight: "700" },
});
