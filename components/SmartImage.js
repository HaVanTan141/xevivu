// components/SmartImage.js
import React, { useMemo, useState } from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { supabase, SUPABASE_URL } from "./supabase";

// Lấy public URL an toàn từ Supabase
function toPublicUrl(value) {
  if (!value || typeof value !== "string") return null;
  if (/^https?:\/\//i.test(value)) return value; // đã là full URL
  // value đang là "u_xxx/123.jpg" -> hỏi Supabase
  const { data } = supabase.storage.from("cars").getPublicUrl(value.replace(/^\/+/, ""));
  return data?.publicUrl ?? null;
}

export default function SmartImage({ uri, style, ownerId }) {
  const [phase, setPhase] = useState("loading"); // loading | ok | error

  const finalUrl = useMemo(() => toPublicUrl(uri), [uri]);

  // log debug (copy URL này mở thử trên trình duyệt)
  // console.log("[SmartImage]", { in: uri, out: finalUrl, ownerId });

  if (!finalUrl) {
    return (
      <View style={[{ backgroundColor: "#eef2f7", alignItems: "center", justifyContent: "center" }, style]}>
        <Text style={{ color: "#94a3b8", fontSize: 12 }}>No Image</Text>
      </View>
    );
  }

  return (
    <View style={[{ overflow: "hidden", backgroundColor: "#eef2f7", borderRadius: 8 }, style]}>
      {phase === "loading" && (
        <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      )}
      {phase === "error" && (
        <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#ef4444", fontSize: 12 }}>Load ảnh lỗi</Text>
        </View>
      )}

      <Image
        source={{ uri: finalUrl }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        onLoad={() => setPhase("ok")}
        onError={() => setPhase("error")}
      />
    </View>
  );
}
