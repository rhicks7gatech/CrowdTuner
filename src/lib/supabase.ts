import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get environment variables from Expo config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper to get device ID for anonymous users
export const getDeviceId = async (): Promise<string> => {
  // In a real app, use expo-device or similar for a stable device ID
  // For now, generate a random one and store it
  const { data, error } = await supabase
    .from('device_sessions')
    .select('device_id')
    .limit(1);

  if (data && data.length > 0) {
    return data[0].device_id;
  }

  // Generate new device ID
  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return deviceId;
};
