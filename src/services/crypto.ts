import { supabase } from './auth';

// Fetch all crypto settings
export const fetchCryptoSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('crypto_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching crypto settings:', err);
    return [];
  }
};

// Get specific crypto setting by name
export const getCryptoSettingByName = async (cryptoName: string) => {
  try {
    const { data, error } = await supabase
      .from('crypto_settings')
      .select('*')
      .eq('crypto_name', cryptoName)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching crypto setting:', err);
    return null;
  }
};

// Create or update crypto setting
export const upsertCryptoSetting = async (
  cryptoName: string,
  cryptoAddress: string,
  isActive: boolean = true
) => {
  try {
    const { data, error } = await supabase
      .from('crypto_settings')
      .upsert(
        {
          crypto_name: cryptoName,
          crypto_address: cryptoAddress,
          is_active: isActive,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'crypto_name' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error upserting crypto setting:', err);
    throw err;
  }
};

// Delete crypto setting
export const deleteCryptoSetting = async (cryptoName: string) => {
  try {
    const { error } = await supabase
      .from('crypto_settings')
      .delete()
      .eq('crypto_name', cryptoName);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting crypto setting:', err);
    throw err;
  }
};

// Update crypto deposit with crypto address
export const updateCryptoDeposit = async (
  depositId: string,
  cryptoName: string,
  cryptoAddress: string
) => {
  try {
    const { data, error } = await supabase
      .from('deposit_requests')
      .update({
        crypto_name: cryptoName,
        crypto_address: cryptoAddress,
        updated_at: new Date().toISOString()
      })
      .eq('id', depositId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating crypto deposit:', err);
    throw err;
  }
};
