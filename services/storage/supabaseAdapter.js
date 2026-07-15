/**
 * Supabase Adapter
 * CuanTrack Bot
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { createLogger } = require('../logger');

const log = createLogger('SupabaseAdapter');

let supabase = null;
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (url && key) {
  supabase = createClient(url, key);
  log.info('✅ Supabase adapter initialized');
} else {
  log.warn('⚠️ Supabase credentials not found in .env. Adapter disabled.');
}

/**
 * Melakukan 2-Step Upsert:
 * 1. Kirim dengan status awal (SYNCING)
 * 2. Jika berhasil, Update metadata menjadi SYNCED secara immutable
 */
async function upsert(userId, payload) {
  if (!supabase) throw new Error('Supabase client is not initialized');

  // STEP 1: Insert/Update awal dengan status SYNCING
  const { error: upsertError } = await supabase
    .from('users')
    .upsert({
      telegram_id: String(userId),
      payload: payload,
      updated_at: new Date().toISOString()
    }, { onConflict: 'telegram_id' });

  if (upsertError) throw upsertError;

  // STEP 2: Jika Step 1 sukses, buat payload baru (Immutable) untuk meresmikan status
  const finalPayload = {
    ...payload,
    meta: {
      ...payload.meta,
      sync: {
        ...payload.meta.sync,
        status: 'SYNCED',
        lastSyncAt: new Date().toISOString()
      }
    }
  };

  const { error: updateError } = await supabase
    .from('users')
    .update({
      payload: finalPayload,
      updated_at: new Date().toISOString()
    })
    .eq('telegram_id', String(userId));

  if (updateError) throw updateError;
}

module.exports = {
  upsert
};