import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "./AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@xevivu.com");
  const [password, setPassword] = useState("123456789");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const onLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }
    try {
      setLoading(true);
      await login({ email, password });
    } catch (e) {
      setError(e.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      style={styles.screen}
      // Gradient tươi sáng: xanh ngọc -> xanh dương
      colors={["#A7F3D0", "#93C5FD"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* điểm nhấn mờ */}
      <LinearGradient
        colors={["#ffffff55", "#ffffff00"]}
        style={[styles.glow, { top: -60, right: -80 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={["#ffffff44", "#ffffff00"]}
        style={[styles.glow, { bottom: -80, left: -90, width: 220, height: 220 }]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
          {/* Logo / Title */}
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="car-sport-outline" size={22} color="#0ea5e9" />
            </View>
            <Text style={styles.brand}>XEVIVU</Text>
          </View>

          <Text style={styles.title}></Text>
          <Text style={styles.subtitle}></Text>

          {/* Card */}
          <View style={styles.card}>
            {/* Email */}
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
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowPass((s) => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Error */}
            {!!error && <Text style={styles.error}>{error}</Text>}

            {/* Submit */}
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={onLogin} disabled={loading}>
              <Text style={styles.btnText}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.divider} />
            </View>

            {/* Register link */}
            <Text style={styles.registerText}>
              Chưa có tài khoản?{" "}
              <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
                Đăng ký ngay
              </Text>
            </Text>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  wrapper: { flexGrow: 1, justifyContent: "center", padding: 20 },

  glow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 9999,
  },

  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  brandIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E6F3FB", alignItems: "center", justifyContent: "center" },
  brand: { marginLeft: 8, letterSpacing: 2, color: "#0b132b", fontWeight: "800", fontSize: 18 },

  title: { color: "#0b132b", fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#334155", textAlign: "center", marginTop: 4, marginBottom: 14 },

  card: {
    backgroundColor: "#ff",
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

  btn: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 2,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.3 },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  divider: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { color: "#9ca3af", fontSize: 12 },

  registerText: { textAlign: "center", marginTop: 6, color: "#334155" },
  link: { color: "#0ea5e9", fontWeight: "700" },

  hint: { marginTop: 8, color: "#64748b", textAlign: "center", fontSize: 12 },
});
