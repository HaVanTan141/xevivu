// components/layout/Footer.js
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../AuthContext"; // CHÚ Ý: layout/Footer.js -> ../AuthContext.js
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

export default function Footer() {
  const { currentUser, logout, booting } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [busy, setBusy] = useState(false);

  const handleAuthAction = async () => {
    if (busy || booting) return;
    try {
      setBusy(true);
      if (currentUser) {
        await logout();
        const parent = navigation.getParent?.();
        if (parent?.canGoBack?.()) {
          parent.goBack();
        } else {
          // về màn đăng nhập (nếu có trong AuthStack) hoặc Home
          navigation.navigate("Login"); // hoặc: navigation.navigate("Home")
        }
      } else {
        navigation.navigate("Login");
      }
    } catch (e) {
      Alert.alert("Đăng xuất thất bại", e?.message ?? "Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };


  const handleAddCar = () => {
    if (busy || booting) return;
    currentUser ? navigation?.navigate?.("AddCar") : navigation?.navigate?.("Login");
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 4) }]}
    >
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation?.navigate?.("Home")} // đảm bảo trong Stack có route "Home"
          hitSlop={12}
        >
          <Ionicons name="home" size={22} />
          <Text style={styles.active}>Khám phá</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation?.navigate?.("Trips")}
          hitSlop={12}
        >
          <Ionicons name="chatbubble-outline" size={22} />
          <Text style={styles.text}>Tin nhắn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation?.navigate?.("Trips")}
          hitSlop={12}
        >
          <Ionicons name="list-outline" size={22} />
          <Text style={styles.text}>Chuyến</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleAddCar} hitSlop={12}>
          <Ionicons name="add-circle" size={24} />
          <Text style={styles.text}>+ Thuê Xe</Text>
        </TouchableOpacity>

        {currentUser?.role === "admin" && (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation?.navigate?.("Admin")}
            hitSlop={12}
          >
            <Ionicons name="shield-checkmark-outline" size={22} />
            <Text style={styles.text}>Admin</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.item}
          onPress={handleAuthAction}
          hitSlop={12}
          disabled={busy || booting}
        >
          <Ionicons
            name={currentUser ? "log-out-outline" : "log-in-outline"}
            size={22}
          />
          <Text style={styles.text}>
            {currentUser ? "Đăng xuất" : "Đăng nhập"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    zIndex: 10,
    elevation: 10,
  },
  footer: {
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  item: { alignItems: "center", flex: 1 },
  text: { fontSize: 12, color: "#666" },
  active: { fontSize: 12, color: "#0ea5e9", fontWeight: "600" },
});
