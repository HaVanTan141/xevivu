import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { appGradient } from "./theme";
import { useCars } from "./CarContext";
import { useAuth } from "./AuthContext";
import SmartImage from "./SmartImage";

export default function MyCarsScreen() {
  const { currentUser } = useAuth();
  const { carsPublic, carsPending } = useCars();

  const mine = useMemo(() => {
    const all = [...carsPending, ...carsPublic];
    return all.filter((c) => c.ownerId === currentUser?.id);
  }, [carsPublic, carsPending, currentUser]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <SmartImage uri={item.imageUrl} style={styles.image} />
      <View style={{ flex:1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.brand} • {item.location}</Text>
        <Text style={styles.price}>{item.pricePerDay.toLocaleString()} đ / ngày</Text>
        <Text style={styles.status}>Trạng thái: {item.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient style={{flex:1}} colors={appGradient.colors} start={appGradient.start} end={appGradient.end}>
      <FlatList
        ListHeaderComponent={<Text style={styles.title}>Xe của tôi</Text>}
        data={mine}
        keyExtractor={(it)=>it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={()=> <View style={{height:10}}/>}
        contentContainerStyle={{ padding:16 }}
        ListEmptyComponent={<Text style={{ textAlign:"center", color:"#0b132b", opacity:0.7 }}>Bạn chưa đăng xe nào.</Text>}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title:{ fontSize:18, fontWeight:"900", color:"#0b132b", marginBottom:8 },
  card:{ flexDirection:"row", gap:12, backgroundColor:"#fff", borderRadius:12, padding:10,
    elevation:2, shadowColor:"#000", shadowOpacity:0.06, shadowRadius:6, shadowOffset:{width:0,height:2}},
  image:{ width:100, height:72, borderRadius:8 },
  name:{ fontSize:16, fontWeight:"800", color:"#0b132b" },
  meta:{ color:"#666", marginTop:2 },
  price:{ marginTop:6, fontWeight:"800", color:"#0ea5e9" },
  status:{ marginTop:4, color:"#334155" },
});
