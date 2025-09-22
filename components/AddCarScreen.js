// components/AddCarScreen.js
import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, StyleSheet, Platform, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "./AuthContext";
import { supabase, SUPABASE_URL } from "./supabase";

const guessMimeFromUri = (uri) => {
  const u = (uri || "").toLowerCase();
  if (u.endsWith(".png")) return "image/png";
  if (u.endsWith(".webp")) return "image/webp";
  if (u.endsWith(".heic") || u.endsWith(".heif")) return "image/heic";
  if (u.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
};
const extFromMime = (mime) => (mime.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "");

/** Upload trực tiếp bằng FileSystem.uploadAsync (không dùng Blob) */
const uploadLocalFileToSupabase = async (bucket, path, fileUri, mime) => {
  const baseUrl = SUPABASE_URL.replace(/\/+$/, "");
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;

  const { data: { session } = {} } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Không có phiên đăng nhập để upload.");

  const res = await FileSystem.uploadAsync(url, fileUri, {
    httpMethod: "PUT",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": mime,
      "x-upsert": "false",
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Upload HTTP ${res.status}: ${res.body?.slice(0, 200)}`);
  }
  return path;
};

/** Nhận local uri hoặc http url → upload → trả { path, usedDirectUrl } */
const uploadAndGetPath = async (inputUriOrHttp, userId) => {
  const isHttp = /^https?:\/\//i.test(inputUriOrHttp);
  const isLocal = inputUriOrHttp.startsWith("file://") || inputUriOrHttp.startsWith("content://");
  const bucket = "cars";

  try {
    let localUri = inputUriOrHttp;
    let mime = guessMimeFromUri(inputUriOrHttp);

    if (isHttp) {
      const tmp = `${FileSystem.cacheDirectory}xevivu_${Date.now()}`;
      const dl = await FileSystem.downloadAsync(inputUriOrHttp, tmp);
      localUri = dl.uri;
      mime = guessMimeFromUri(inputUriOrHttp) || "image/jpeg";
    } else if (!isLocal) {
      throw new Error("URI ảnh không hợp lệ.");
    }

    const path = `u_${userId}/${Date.now()}.${extFromMime(mime)}`;
    await uploadLocalFileToSupabase(bucket, path, localUri, mime);
    return { path, usedDirectUrl: false };
  } catch (err) {
    console.log("[uploadAndGetPath] upload failed →", err);
    if (isHttp) return { path: inputUriOrHttp, usedDirectUrl: true }; // fallback để không kẹt luồng
    throw err;
  }
};

export default function AddCarScreen({ navigation }) {
  const { currentUser } = useAuth();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [location, setLocation] = useState("");

  // fields chi tiết
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");
  const [fuel, setFuel] = useState("");
  const [description, setDescription] = useState("");

  // ảnh
  const [imageUri, setImageUri] = useState(null); // local picker
  const [imageLink, setImageLink] = useState(""); // http(s) pasted
  const [imgError, setImgError] = useState(false);

  const [loading, setLoading] = useState(false);

  // Preview: ưu tiên local, sau đó link http
  const previewUri = useMemo(() => {
    if (imageUri) return imageUri;
    const link = imageLink.trim();
    if (/^https?:\/\//i.test(link)) return link;
    return null;
  }, [imageUri, imageLink]);

  const clearPreview = () => {
    setImageUri(null);
    setImageLink("");
    setImgError(false);
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Quyền ảnh", "Cần cấp quyền truy cập thư viện ảnh.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      });
      if (!res.canceled) {
        setImageUri(res.assets?.[0]?.uri || null);
        setImageLink("");
        setImgError(false);
      }
    } catch (e) {
      console.log("pickImage error:", e);
      Alert.alert("Lỗi", "Không mở được thư viện ảnh.");
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return Alert.alert("Chưa đăng nhập", "Vui lòng đăng nhập để đăng xe.");
    if (!name.trim()) return Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên xe.");
    if (!previewUri) return Alert.alert("Thiếu ảnh", "Vui lòng chọn ảnh hoặc dán link ảnh hợp lệ.");
    if (imgError) return Alert.alert("Ảnh không hợp lệ", "Ảnh xem trước bị lỗi, hãy chọn ảnh khác.");

    setLoading(true);
    try {
      const { path, usedDirectUrl } = await uploadAndGetPath(previewUri, currentUser.id);

      const { error } = await supabase.from("cars").insert([{
        name: name.trim(),
        brand: brand.trim(),
        price_per_day: Number(pricePerDay) || 0,
        location: location.trim(),
        image_url: path,                    // PATH trong bucket 'cars' hoặc URL fallback
        owner_id: currentUser.id,
        owner_email: currentUser.email || null,
        owner_phone: currentUser.phone || null, // đồng bộ số điện thoại
        status: "pending",
        year: year ? Number(year) : null,
        engine: engine.trim(),
        fuel_consumption: fuel.trim(),
        description: description.trim(),
      }]);
      if (error) throw error;

      if (usedDirectUrl) {
        Alert.alert(
          "Đã đăng xe (dùng URL ảnh)",
          "Upload ảnh lên Supabase gặp lỗi mạng, nên tạm dùng URL ảnh trực tiếp. Bạn có thể sửa lại sau."
        );
      } else {
        Alert.alert("Thành công", "Xe đã gửi chờ duyệt.");
      }

      navigation.navigate("CarList");
    } catch (e) {
      console.log("Add car error:", e);
      const msg = String(e?.message || e);
      if (msg.includes("bucket")) {
        Alert.alert("Thiếu bucket", "Bucket 'cars' chưa tồn tại hoặc chưa Public.");
      } else if (msg.includes("permission denied")) {
        Alert.alert("Quyền bị chặn", "Kiểm tra policy 'cars_insert_owner' (owner_id = auth.uid()).");
      } else if (msg.toLowerCase().includes("network request failed")) {
        Alert.alert(
          "Lỗi mạng khi upload",
          "Thiết bị/emulator không gọi được Supabase Storage. Kiểm tra Internet/VPN/Firewall, hoặc test trên điện thoại thật."
        );
      } else {
        Alert.alert("Lỗi", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#3debd3", "#1fa2ff"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title}>Đăng xe cho thuê</Text>

          <Text style={styles.label}>Tên xe</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Toyota Vios 2020"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Hãng xe</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Toyota"
            value={brand}
            onChangeText={setBrand}
          />

          <Text style={styles.label}>Giá thuê / ngày (VND)</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: 650000"
            keyboardType={Platform.select({ ios: "number-pad", android: "numeric", default: "numeric" })}
            value={String(pricePerDay)}
            onChangeText={setPricePerDay}
          />

          <Text style={styles.label}>Khu vực</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Nha Trang"
            value={location}
            onChangeText={setLocation}
          />

          {/* Chi tiết */}
          <Text style={styles.label}>Năm sản xuất</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: 2020"
            keyboardType="numeric"
            value={String(year)}
            onChangeText={setYear}
          />

          <Text style={styles.label}>Động cơ</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: 1.5L I4, AT"
            value={engine}
            onChangeText={setEngine}
          />

          <Text style={styles.label}>Tiêu hao nhiên liệu</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: 6L/100km"
            value={fuel}
            onChangeText={setFuel}
          />

          <Text style={styles.label}>Mô tả chi tiết</Text>
          <TextInput
            style={[styles.input, { height: 90 }]}
            multiline
            placeholder="Thông tin thêm về xe, trang bị, nội thất..."
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Ảnh xe</Text>

          {previewUri ? (
            <View style={styles.previewWrap}>
              <Image
                source={{ uri: previewUri }}
                style={styles.preview}
                resizeMode="cover"
                onError={() => setImgError(true)}
                onLoadEnd={() => setImgError(false)}
              />
              <TouchableOpacity style={styles.removeBtn} onPress={clearPreview}>
                <Text style={styles.removeTxt}>✕</Text>
              </TouchableOpacity>
              {imgError ? <Text style={styles.previewErr}>Ảnh không hợp lệ, hãy chọn ảnh khác.</Text> : null}
            </View>
          ) : null}

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.btn} onPress={pickImage}>
              <Text style={styles.btnText}>Chọn ảnh</Text>
            </TouchableOpacity>
            {imageUri ? (
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={clearPreview}>
                <Text style={[styles.btnText, { color: "#0ea5e9" }]}>Xoá ảnh</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Ô dán link ảnh */}
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Hoặc dán link ảnh (https://...)"
            value={imageLink}
            onChangeText={(t) => { setImageLink(t); if (t) setImageUri(null); }}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.btnPrimary, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Đăng xe</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  btn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#e6f3fb" },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#0ea5e9" },
  btnText: { fontWeight: "700", color: "#111827" },
  btnPrimary: { marginTop: 12, backgroundColor: "#0ea5e9", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  previewWrap: { marginTop: 8, position: "relative" },
  preview: { width: "100%", height: 200, borderRadius: 12, backgroundColor: "#f1f5f9" },
  removeBtn: { position: "absolute", top: 8, right: 8, backgroundColor: "#0009", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  removeTxt: { color: "#fff", fontWeight: "800" },
  previewErr: { marginTop: 6, color: "#ef4444" },
});
