import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./AuthContext";

const CarCtx = createContext();
export const useCars = () => useContext(CarCtx);

const mapCar = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    location: row.location,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    imageUrl: row.image_url ?? null,
    pricePerDay: Number(row.price_per_day ?? 0),
    ownerId: row.owner_id ?? null,
    ownerEmail: row.owner_email ?? null,
    // thêm
    description: row.description ?? "",
    year: row.year ?? null,
    engine: row.engine ?? "",
    fuel: row.fuel_consumption ?? "",
  };
};

export function CarProvider({ children }) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from("cars").select("*").order("created_at", { ascending: false });
      if (isAdmin) {
        // all
      } else if (currentUser?.id) {
        q = q.or(`status.eq.approved,owner_id.eq.${currentUser.id}`);
      } else {
        q = q.eq("status", "approved");
      }
      const { data, error } = await q;
      if (error) throw error;
      setCars((data || []).map(mapCar));
    } catch (e) {
      console.warn("Load cars error:", e?.message || e);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, isAdmin]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    const ch = supabase
      .channel("cars-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "cars" }, reload)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [reload]);

  const approveCar = async (id) => { const { error } = await supabase.from("cars").update({ status: "approved" }).eq("id", id); if (error) throw error; await reload(); };
  const rejectCar  = async (id) => { const { error } = await supabase.from("cars").update({ status: "rejected" }).eq("id", id); if (error) throw error; await reload(); };
  const deleteCar  = async (id) => { const { error } = await supabase.from("cars").delete().eq("id", id); if (error) throw error; await reload(); };

  const getCarById = useCallback((id) => (cars || []).find((c) => String(c.id) === String(id)) || null, [cars]);

  const carsApproved = useMemo(() => (cars || []).filter((c) => c.status === "approved"), [cars]);
  const carsPending  = useMemo(() => (cars || []).filter((c) => c.status === "pending"),  [cars]);
  const carsRejected = useMemo(() => (cars || []).filter((c) => c.status === "rejected"), [cars]);

  return (
    <CarCtx.Provider
      value={{
        cars: cars || [],
        carsApproved: carsApproved || [],
        carsPending: carsPending || [],
        carsRejected: carsRejected || [],
        loading: !!loading,
        getCarById,
        reload,
        approveCar,
        rejectCar,
        deleteCar,
      }}
    >
      {children}
    </CarCtx.Provider>
  );
}
