// components/CarDetailScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./supabase";

// ... phần code sẵn có của bạn

export default function CarDetailScreen({ route, navigation }) {
  const { car: initialCar } = route.params; // tuỳ app: bạn có thể nhận car từ params/CarContext
  const [car, setCar] = useState(initialCar);
  const [ownerPhone, setOwnerPhone] = useState(initialCar?.owner_phone || "");

  useEffect(() => {
    (async () => {
      if (!ownerPhone && initialCar?.owner_id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", initialCar.owner_id)
          .maybeSingle();
        if (!error && data?.phone) setOwnerPhone(data.phone);
      }
    })();
  }, [initialCar?.owner_id, ownerPhone]);

  const onCall = async () => {
    if (!ownerPhone) return Alert.alert("Chưa có số", "Không tìm thấy số điện thoại của chủ xe.");
    try {
      await Linking.openURL(`tel:${ownerPhone.replace(/\s+/g, "")}`);
    } catch {
      Alert.alert("Không thể gọi", "Thiết bị không hỗ trợ mở trình gọi.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ... các phần hiển thị thông tin xe của bạn ... */}

      <View style={styles.ownerBox}>
        <Ionicons name="person-circle-outline" size={22} color="#0ea5e9" />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.ownerTitle}>Liên hệ chủ xe</Text>
          <Text style={styles.ownerPhone}>{ownerPhone || "Đang cập nhật..."}</Text>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={onCall} disabled={!ownerPhone}>
          <Ionicons name="call-outline" size={18} color="#fff" />
          <Text style={styles.callTxt}>Gọi</Text>
        </TouchableOpacity>
      </View>

      {/* ... */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { width: "100%", height: 230, backgroundColor: "#f1f5f9" },
  card: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "800", color: "#0b132b" },
  sub: { marginTop: 4, color: "#64748b" },
  price: { marginTop: 8, color: "#0ea5e9", fontWeight: "800", fontSize: 16 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 12 },
  meta: { color: "#334155" },
  bold: { fontWeight: "700" },
  btn: { backgroundColor: "#0ea5e9", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 12 },
  btnTxt: { color: "#fff", fontWeight: "800" },
});
