// components/HomeScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appGradient } from "./theme";
import { useAuth } from "./AuthContext";
import Footer from "./layout/Footer";
import AvailableList from "./layout/AvailableList";
import PromoList from "./layout/PromoList";

export default function HomeScreen({ navigation }) {
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState("self"); // self | driver

  const name =
    currentUser?.name ||
    currentUser?.email?.split("@")?.[0] ||
    "Người dùng";

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={appGradient.colors}
      start={appGradient.start}
      end={appGradient.end}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== TOP HERO / PROFILE ====== */}
        <View style={{ height: insets.top }} />
        <View style={styles.hero}>
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 18 }}>🙂</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.username} numberOfLines={1}>
                {name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.badgeText}>Điểm thưởng</Text>
              </View>
            </View>

            <View style={styles.iconRow}>
              <Ionicons name="heart-outline" size={22} color="#0b132b" />
              <Ionicons name="gift-outline" size={22} color="#0b132b" />
            </View>
          </View>

          {/* ====== SEGMENTED TABS ====== */}
          <View style={styles.segmentWrap}>
            <TouchableOpacity
              style={[styles.segment, tab === "self" && styles.segmentActive]}
              onPress={() => setTab("self")}
              activeOpacity={0.9}
            >
              <Ionicons
                name="happy-outline"
                size={18}
                color={tab === "self" ? "#fff" : "#0b132b"}
              />
              <Text
                style={[styles.segmentText, tab === "self" && styles.segmentTextActive]}
              >
                Xe tự lái
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segment, tab === "driver" && styles.segmentActive]}
              onPress={() => setTab("driver")}
              activeOpacity={0.9}
            >
              <Ionicons
                name="bus-outline"
                size={18}
                color={tab === "driver" ? "#fff" : "#0b132b"}
              />
              <Text
                style={[
                  styles.segmentText,
                  tab === "driver" && styles.segmentTextActive,
                ]}
              >
                Xe có tài xế
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ====== SEARCH CARD ====== */}
        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Ionicons name="location-outline" size={18} color="#9ca3af" />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Địa điểm</Text>
              <Text style={styles.value} numberOfLines={1}>
                TP. Hồ Chí Minh, Việt Nam
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.searchRow}>
            <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Thời gian thuê</Text>
              <Text style={styles.value} numberOfLines={1}>
                21:00 T6, 19/09 - 20:00 T7, 20/09
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("CarList")}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>Tìm xe</Text>
          </TouchableOpacity>
        </View>

        {/* ====== AVAILABLE LIST (6 xe) ====== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Xe đang có sẵn</Text>
          <TouchableOpacity onPress={() => navigation.navigate("CarList")}>
            <Text style={styles.link}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {/* Hiển thị 6 xe, ẩn header nội bộ của AvailableList để không bị trùng */}
        <AvailableList navigation={navigation} limit={6} showHeader={false} />

        {/* ====== PROMOTIONS ====== */}
        <PromoList />
      </ScrollView>

      <Footer navigation={navigation} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  hero: {
    backgroundColor: "#ffffff40",
    borderRadius: 24,
    padding: 16,
    paddingBottom: 8,
  },
  row: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ffffff70",
  },
  username: { fontSize: 18, fontWeight: "800", color: "#0b132b" },
  badgeText: { color: "#334155", fontSize: 12 },

  iconRow: { flexDirection: "row", gap: 14, marginLeft: 12 },

  segmentWrap: {
    marginTop: 14,
    backgroundColor: "#ffffffb5",
    borderRadius: 18,
    flexDirection: "row",
    padding: 4,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 14,
  },
  segmentActive: {
    backgroundColor: "#22c55e", // xanh như ảnh
  },
  segmentText: { fontWeight: "800", color: "#0b132b" },
  segmentTextActive: { color: "#fff" },

  searchCard: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    gap: 12,
    // shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    // elevation Android
    elevation: 3,
  },
  searchRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  label: { color: "#9ca3af", fontSize: 13, fontWeight: "700" },
  value: { color: "#0b132b", fontSize: 16, fontWeight: "800", marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 4,
    opacity: 0.8,
  },
  primaryBtn: {
    marginTop: 4,
    backgroundColor: "#22c55e",
    borderRadius: 14,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0b132b" },
  link: { color: "#0ea5e9", fontWeight: "700" },
});
