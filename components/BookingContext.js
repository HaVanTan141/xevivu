import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./AuthContext";

const BookingContext = createContext();
export const useBookings = () => useContext(BookingContext);

export function BookingProvider({ children }) {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!currentUser) { setBookings([]); return; }
    const refetch = async () => {
      const q = currentUser.role === "admin"
        ? supabase.from("bookings").select("*").order("created_at", { ascending: false })
        : supabase.from("bookings").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false });
      const { data } = await q;
      setBookings(data || []);
    };
    refetch();
    const ch = supabase
      .channel("bookings-ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, refetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [currentUser]);

  const addBooking = (payload) => supabase.from("bookings").insert(payload);
  const cancelBooking = (id) => supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
  const updateStatus = (id, status) => supabase.from("bookings").update({ status }).eq("id", id);
  const removeBooking = (id) => supabase.from("bookings").delete().eq("id", id);

  const stats = useMemo(() => {
    const s = { total: bookings.length, upcoming: 0, completed: 0, cancelled: 0, revenue: 0 };
    for (const b of bookings) {
      s[b.status] = (s[b.status] || 0) + 1;
      if (b.status === "completed") s.revenue += Number(b.total_price || 0);
    }
    return s;
  }, [bookings]);

  return (
    <BookingContext.Provider value={{ bookings, addBooking, cancelBooking, updateStatus, removeBooking, stats }}>
      {children}
    </BookingContext.Provider>
  );
}
