// components/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * ⚠️ Khuyến nghị:
 * - Không hardcode key trong bản phát hành. Dùng biến môi trường nếu có thể.
 * - Với Expo, có thể dùng app.config.(js/ts) + process.env (Expo EAS) hoặc thư viện dotenv.
 */
export const SUPABASE_URL = 'https://hmnmynwaoiulgskrjyyu.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtbm15bndhb2l1bGdza3JqeXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4OTU0MTcsImV4cCI6MjA3MzQ3MTQxN30.e-lZGdqj5uvIXV39V5DQ5i59FwY0ko1wHDmrRlgjvsQ';

/**
 * Tạo Supabase client cho môi trường React Native/Expo
 * - Dùng AsyncStorage để lưu session
 * - Tắt detectSessionInUrl vì RN không có URL redirect
 * - Cấu hình realtime để chắc chắn dùng WebSocket môi trường RN (không kéo 'ws' của Node)
 */
export const supabase = createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim(), {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    // Tham số nhẹ nhàng, giúp tránh spam sự kiện
    params: { eventsPerSecond: 10 },
    // Không truyền transport 'ws' thủ công → để @supabase/realtime-js dùng WebSocket sẵn có của RN
  },
});

/**
 * buildCarsPublicUrl
 */
export function buildCarsPublicUrl(maybePathOrUrl) {
  if (!maybePathOrUrl || typeof maybePathOrUrl !== 'string') return null;

  const input = maybePathOrUrl.trim();
  if (/^https?:\/\//i.test(input)) return input; // đã là URL

  const bucketName = 'cars';
  let cleaned = input.replace(/^\/+/, '');
  if (!cleaned.startsWith(`${bucketName}/`)) cleaned = `${bucketName}/${cleaned}`;

  const safePath = cleaned.split('/').map((p) => encodeURIComponent(p)).join('/');
  const baseUrl = SUPABASE_URL.replace(/\/+$/, '');
  return `${baseUrl}/storage/v1/object/public/${safePath}`;
}
