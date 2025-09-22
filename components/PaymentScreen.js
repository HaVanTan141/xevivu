// components/PaymentScreen.js
import React, { useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "./AuthContext";
import { useBookings } from "./BookingContext";
import { supabase } from "./supabase";

// Upload biên lai lên bucket 'slips' (public)
async function uploadSlip(uri, userId) {
  if (!uri) return null;
  if (/^https?:\/\//i.test(uri)) return uri;
  const blob = await (await fetch(uri)).blob();
  const path = `slips/${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("slips").upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from("slips").getPublicUrl(path).data.publicUrl;
}

export default function PaymentScreen({ route, navigation }) {
  const draft = route?.params?.draft || {};
  const { currentUser } = useAuth();
  const { addBooking } = useBookings();

  const [method, setMethod] = useState("cash"); // 'cash' | 'bank'
  const [slipUri, setSlipUri] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => {
    const s = new Date(draft.startDate || Date.now());
    const e = new Date(draft.endDate || Date.now() + 86400000);
    return Math.max(1, Math.ceil((e - s) / 86400000));
  }, [draft.startDate, draft.endDate]);

  const total = useMemo(() => Number(draft.pricePerDay || 0) * days, [draft.pricePerDay, days]);

  const pickSlip = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Thiếu quyền", "Cần quyền truy cập Ảnh để tải biên lai.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) setSlipUri(res.assets?.[0]?.uri || "");
  };

  const confirm = async () => {
    try {
      setLoading(true);
      const slipUrl = method === "bank" ? await uploadSlip(slipUri, currentUser.id) : null;

      await addBooking({
        user_id: currentUser.id,
        user_email: currentUser.email,
        car_id: draft.carId,
        car_name: draft.carName,
        car_image: draft.carImage,
        price_per_day: Number(draft.pricePerDay || 0),
        location: draft.location || "",
        start_date: draft.startDate,
        end_date: draft.endDate,
        days,
        total_price: total,
        payment_method: method,
        payment_status: method === "cash" ? "cod" : slipUrl ? "paid" : "pending",
        slip_image: slipUrl,
        status: "upcoming",
      });

      Alert.alert("Thành công", "Đã tạo chuyến. Xem trong tab Chuyến.");
      navigation.replace("Trips");
    } catch (e) {
      Alert.alert("Lỗi", e?.message || "Không thể xác nhận thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Thanh toán</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Phương thức</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.method, method === "cash" && styles.methodActive]} onPress={() => setMethod("cash")}>
            <Text style={[styles.methodText, method === "cash" && styles.methodTextActive]}>Tiền mặt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.method, method === "bank" && styles.methodActive]} onPress={() => setMethod("bank")}>
            <Text style={[styles.methodText, method === "bank" && styles.methodTextActive]}>Chuyển khoản</Text>
          </TouchableOpacity>
        </View>
      </View>

      {method === "bank" && (
        <View style={styles.card}>
          <Text style={styles.label}>Biên lai chuyển khoản</Text>
          {slipUri ? <Image source={{ uri: slipUri }} style={styles.preview} /> : <View style={styles.previewEmpty}><Text>Chưa có ảnh</Text></View>}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={pickSlip}>
              <Text style={[styles.btnText, styles.btnTextOutline]}>Chọn ảnh</Text>
            </TouchableOpacity>
            {!!slipUri && (
              <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => setSlipUri("")}>
                <Text style={styles.btnText}>Xoá ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Ghi chú</Text>
        <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Thông tin thêm cho chủ xe…" multiline />
      </View>

      <View style={styles.card}>
        <Text>Đơn giá: {Number(draft.pricePerDay || 0).toLocaleString()} đ / ngày</Text>
        <Text>Số ngày: {days}</Text>
        <Text style={{ fontWeight: "800", color: "#0ea5e9" }}>Tổng: {total.toLocaleString()} đ</Text>
      </View>

      <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={confirm} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Đang xử lý..." : "Xác nhận thanh toán"}</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 12 },
  label: { fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  method: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  methodActive: { backgroundColor: "#E6F3FB", borderColor: "#0ea5e9" },
  methodText: { color: "#374151", fontWeight: "600" },
  methodTextActive: { color: "#0ea5e9" },
  preview: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
  previewEmpty: { width: "100%", height: 180, borderRadius: 10, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 10, minHeight: 80, textAlignVertical: "top" },
  btn: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  btnPrimary: { backgroundColor: "#0ea5e9" },
  btnOutline: { borderWidth: 1, borderColor: "#0ea5e9", flex: 1 },
  btnDanger: { backgroundColor: "#ef4444", flex: 1 },
  btnText: { color: "#fff", fontWeight: "700" },
  btnTextOutline: { color: "#0ea5e9", fontWeight: "700" },
});
