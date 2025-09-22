import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Main({ onFind }) {
  // Địa điểm
  const [locationText, setLocationText] = useState("Đang lấy vị trí...");
  // Thời gian
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));

  // DateTimePicker controls
  const [showPicker, setShowPicker] = useState(null); // "start" | "end" | null
  const [mode, setMode] = useState("datetime"); // iOS: 'datetime', Android dùng 'date' rồi 'time'

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationText("Không có quyền truy cập GPS. Nhập địa chỉ thủ công.");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const rev = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          useGoogleMaps: false,
        });
        if (rev && rev[0]) {
          const r = rev[0];
          // Ưu tiên thành phố, sau đó đến khu vực/quốc gia
          const city = r.city || r.subregion || r.region || "";
          const country = r.country || "";
          const label = [city, country].filter(Boolean).join(", ");
          setLocationText(label || "Không xác định vị trí");
        } else {
          setLocationText("Không xác định vị trí");
        }
      } catch (e) {
        setLocationText("Lỗi GPS. Nhập địa chỉ thủ công.");
      }
    })();
  }, []);

  const formatDate = (d) => {
    const pad = (n) => (n < 10 ? `0${n}` : n);
    const days = ["CN","T2","T3","T4","T5","T6","T7"];
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${days[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth()+1)}`;
  };

  const timeRangeLabel = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  // Android cần chọn 2 bước (date -> time)
  const [pendingFor, setPendingFor] = useState(null); // 'start' | 'end'
  const [tempDate, setTempDate] = useState(new Date());

  const openPicker = (which) => {
    if (Platform.OS === "android") {
      setPendingFor(which);
      setMode("date");
      setTempDate(which === "start" ? startDate : endDate);
      setShowPicker("android");
    } else {
      setMode("datetime");
      setShowPicker(which);
    }
  };

  const onChangeAndroid = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowPicker(null);
      setPendingFor(null);
      return;
    }
    if (mode === "date") {
      // Chuyển sang chọn time
      const base = selectedDate || tempDate;
      setTempDate(base);
      setMode("time");
      setShowPicker("android");
    } else {
      // Gộp date + time thành 1 Date
      const picked = selectedDate || tempDate;
      if (pendingFor === "start") {
        setStartDate(picked);
        if (picked >= endDate) setEndDate(new Date(picked.getTime() + 4 * 60 * 60 * 1000));
      } else if (pendingFor === "end") {
        setEndDate(picked);
      }
      setShowPicker(null);
      setPendingFor(null);
      setMode("date");
    }
  };

  const onChangeIOS = (event, selectedDate) => {
    if (!selectedDate) return;
    if (showPicker === "start") {
      setStartDate(selectedDate);
      if (selectedDate >= endDate) setEndDate(new Date(selectedDate.getTime() + 4 * 60 * 60 * 1000));
    } else if (showPicker === "end") {
      setEndDate(selectedDate);
    }
  };

  return (
    <View style={styles.main}>
      {/* Địa điểm (prefill từ GPS, cho phép chỉnh tay) */}
      <View style={styles.row}>
        <Ionicons name="location-outline" size={20} color="#0ea5e9" />
        <TextInput
          value={locationText}
          onChangeText={setLocationText}
          style={styles.input}
          placeholder="Nhập địa điểm"
        />
      </View>

      {/* Thời gian thuê */}
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={20} color="#0ea5e9" />
        <TouchableOpacity style={[styles.input, { paddingVertical: 8 }]} onPress={() => openPicker("start")}>
          <Text>{formatDate(startDate)}</Text>
        </TouchableOpacity>
        <Text style={{ color: "#999" }}> - </Text>
        <TouchableOpacity style={[styles.input, { paddingVertical: 8 }]} onPress={() => openPicker("end")}>
          <Text>{formatDate(endDate)}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={() => onFind?.({ location: locationText, startDate, endDate })}>
        <Text style={styles.btnText}>Tìm xe</Text>
      </TouchableOpacity>

      {/* DateTimePickers */}
      {Platform.OS === "ios" && showPicker && (
        <DateTimePicker
          value={showPicker === "start" ? startDate : endDate}
          mode={mode} // 'datetime'
          display="inline"
          onChange={onChangeIOS}
          style={{ backgroundColor: "#fff" }}
        />
      )}

      {Platform.OS === "android" && showPicker === "android" && (
        <DateTimePicker
          value={tempDate}
          mode={mode} // 'date' rồi 'time'
          is24Hour
          display="default"
          onChange={onChangeAndroid}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { backgroundColor: "#fff", padding: 16, borderRadius: 12, gap: 12, marginBottom: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 6,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 4 },
  btn: { backgroundColor: "#0ea5e9", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
