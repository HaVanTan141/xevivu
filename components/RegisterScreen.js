import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "./AuthContext";
import { appGradient } from "./theme";

const isValidEmail = (e) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());

const isValidPhone = (p) => {
  const v = String(p || "").trim();
  // Cho phép: +84xxxxxxxxx, 0xxxxxxxxx (9–11 số), hoặc số quốc tế đơn giản
  return /^(\+?\d{9,15})$/.test(v) || /^0\d{9,11}$/.test(v) || /^\+84\d{9,11}$/.test(v);
};

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");        // <-- NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onRegister = async () => {
    setError("");
    if (!name || !phone || !email || !password) {
      return setError("Vui lòng nhập đầy đủ Họ tên, Số điện thoại, Email và Mật khẩu.");
    }
    if (!isValidEmail(email)) return setError("Email không hợp lệ.");
    if (!isValidPhone(phone)) return setError("Số điện thoại không hợp lệ. Vui lòng nhập số thật.");

    try {
      setLoading(true);
      await register({ name, email, password, phone });

      // ✅ an toàn: nếu có thể goBack thì goBack, ngược lại điều hướng fallback
      const parent = navigation.getParent?.();
      if (parent?.canGoBack?.()) {
        parent.goBack();
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Chọn 1 trong các route mà bạn chắc chắn tồn tại trong Root Stack
        // Ví dụ nếu có 'Login' trong AuthStack:
        navigation.navigate("Login");
        // hoặc nếu muốn về trang chính app:
        // navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
    } catch (e) {
      setError(e?.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={appGradient.colors}
      start={appGradient.start}
      end={appGradient.end}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="car-sport-outline" size={22} color="#0ea5e9" />
            </View>
            <Text style={styles.brand}>XEVIVU</Text>
          </View>

          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Chỉ vài bước để bắt đầu hành trình của bạn.</Text>

          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Họ tên"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={18} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại "
                placeholderTextColor="#9ca3af"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass((s) => !s)}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.7 }]}
              onPress={onRegister}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? "Đang tạo..." : "Đăng ký"}</Text>
            </TouchableOpacity>

            <Text style={styles.registerText}>
              Đã có tài khoản?{" "}
              <Text style={styles.link} onPress={() => navigation.goBack()}>
                Đăng nhập
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexGrow: 1, justifyContent: "center", padding: 20 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  brandIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E6F3FB", alignItems: "center", justifyContent: "center" },
  brand: { marginLeft: 8, letterSpacing: 2, color: "#0b132b", fontWeight: "800", fontSize: 18 },

  title: { color: "#0b132b", fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#334155", textAlign: "center", marginTop: 4, marginBottom: 14 },

  card: {
    backgroundColor: "#fff", // sửa '#ff' -> '#fff'
    borderRadius: 16,
    padding: 16,
    gap: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fafafa",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  input: { flex: 1, color: "#111827" },
  error: { color: "#ef4444", textAlign: "center", marginTop: 4 },
  btn: { backgroundColor: "#0ea5e9", paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  registerText: { textAlign: "center", marginTop: 8, color: "#334155" },
  link: { color: "#0ea5e9", fontWeight: "700" },
});
