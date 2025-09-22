// components/layout/Header.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../AuthContext";

// ... component Header
export default function Header() {
  const { currentUser } = useAuth();

  return (
    <View style={styles.header}>
      {/* ... logo / title ... */}
      {currentUser ? (
        <View style={styles.userBox}>
          <Text style={styles.userName} numberOfLines={1}>
            {currentUser.name || currentUser.email}
          </Text>
          {!!currentUser.phone && (
            <Text style={styles.userPhone} numberOfLines={1}>
              {currentUser.phone}
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { /* ... của bạn ... */ },
  userBox: { alignItems: "flex-end" },
  userName: { fontWeight: "700", color: "#0b132b" },
  userPhone: { color: "#334155", fontSize: 12, marginTop: 2 },
});
