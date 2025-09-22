import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Sidebar() {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.item}>Trang chủ</Text>
      <Text style={styles.item}>Xe của tôi</Text>
      <Text style={styles.item}>Khuyến mãi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar:{ backgroundColor:"#f1f5f9", padding:16 },
  item:{ paddingVertical:12, borderBottomWidth:1, borderColor:"#ddd" }
});
