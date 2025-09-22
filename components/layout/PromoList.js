// components/layout/PromoList.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Dimensions,
} from "react-native";

const W = Dimensions.get("window").width;
const CARD_W = Math.min(W * 0.86, 340);
const CARD_H = 180;

const DEFAULT_PROMOS = [
  {
    id: "p1",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1400&auto=format&fit=crop",
    href: "https://example.com/promo1",
    alt: "Chủ động tay lái – Ưu đãi 8%",
  },
  {
    id: "p2",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1400&auto=format&fit=crop",
    href: "https://example.com/promo2",
    alt: "Thuê xe theo giờ – Giảm 10%",
  },
  {
    id: "p3",
    image:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1400&auto=format&fit=crop",
    href: "https://example.com/promo3",
    alt: "Cuối tuần vi vu – Tặng mã",
  },
];

export default function PromoList({ promos = DEFAULT_PROMOS, title = "Chương trình khuyến mãi" }) {
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => item.href && Linking.openURL(item.href).catch(() => {})}
      style={[styles.card, index === 0 && { marginLeft: 2 }]}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.bg}
        imageStyle={styles.bgImg}
        resizeMode="cover"
      >
        {/* Bạn có thể thêm logo/badge ở đây nếu muốn */}
      </ImageBackground>
    </TouchableOpacity>
  );

  if (!promos?.length) return null;

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        data={promos}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
        contentContainerStyle={{ paddingVertical: 8, paddingRight: 2 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0b132b",
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    overflow: "hidden",
    // shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    // elevation Android
    elevation: 3,
    backgroundColor: "#fff",
  },
  bg: { flex: 1 },
  bgImg: { borderRadius: 18 },
});
