import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE = "@xevivu_favorites_v1";
const Ctx = createContext();

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE);
        if (raw) setIds(JSON.parse(raw));
      } catch (err) {
        console.warn("Failed to load favorites:", err);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE, JSON.stringify(ids)).catch((err) =>
      console.warn("Failed to save favorites:", err)
    );
  }, [ids]);

  const toggle = (carId) =>
    setIds((prev) => (prev.includes(carId) ? prev.filter((i) => i !== carId) : [carId, ...prev]));
  const isFav = (carId) => ids.includes(carId);

  return <Ctx.Provider value={{ ids, toggle, isFav }}>{children}</Ctx.Provider>;
}
export const useFavorites = () => useContext(Ctx);
