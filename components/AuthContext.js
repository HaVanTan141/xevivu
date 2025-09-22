// components/AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const mapUser = (user, profile) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.user_metadata?.name || "",
    phone: profile?.phone || user.user_metadata?.phone || "",   // <-- thêm phone
    role: profile?.role || "user",
  };
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const loadSessionAndProfile = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user || null;
      if (!user) {
        setCurrentUser(null);
        return;
      }

      // lấy profile (có cả phone)
      let { data: profile } = await supabase
        .from("profiles")
        .select("id, email, name, phone, role")
        .eq("id", user.id)
        .maybeSingle();

      // nếu chưa có profile thì tạo nhanh từ metadata
      if (!profile) {
        const upsertPayload = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || "",
          phone: user.user_metadata?.phone || "",   // <-- phone
        };
        const { error: upsertErr } = await supabase.from("profiles").upsert(upsertPayload);
        if (!upsertErr) {
          const { data: p2 } = await supabase
            .from("profiles")
            .select("id, email, name, phone, role")
            .eq("id", user.id)
            .maybeSingle();
          profile = p2 || null;
        }
      }

      setCurrentUser(mapUser(user, profile));
    } catch {
      // fallback dữ liệu tối thiểu nếu có
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user || null;
      setCurrentUser(mapUser(user, null));
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadSessionAndProfile();
      setBooting(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      // xử lý theo event để tránh race
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        await loadSessionAndProfile();
      }
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, [loadSessionAndProfile]);

  const login = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await loadSessionAndProfile();
  };

  // ⬇️ ĐÃ SỬA: nhận thêm phone, lưu vào user_metadata, upsert profiles kèm phone
  const register = async ({ email, password, name, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone }, // lưu vào user_metadata
        // emailRedirectTo: 'xevivu://auth' // (tuỳ chọn) nếu dùng deep link xác thực
      },
    });
    if (error) throw error;

    // Nếu có session ngay (tùy cài đặt xác minh email), load hồ sơ
    if (data?.session?.user) {
      // đồng bộ bảng profiles
      await supabase.from("profiles").upsert({
        id: data.session.user.id,
        email,
        name,
        phone,                // <-- phone
        updated_at: new Date().toISOString(),
      });
      await loadSessionAndProfile();
    }
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error; // để Footer hiển thị Alert nếu lỗi
    // setCurrentUser(null) sẽ được gọi trong handler SIGNED_OUT
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        booting,
        login,
        register,   // register đã hỗ trợ phone
        logout,
        reload: loadSessionAndProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
