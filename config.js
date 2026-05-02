// config.js
const SUPABASE_URL = 'https://ykmsizkprilhidqvxaqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UNOPedCOLNaCz878UCdo3w_5dnM-Gp-';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function incrementBookViews(bookId) {
  try { await supabase.rpc('increment_views', { book_id: bookId }); } catch(e) { console.error(e); }
}
async function incrementBookDownloads(bookId) {
  try { await supabase.rpc('increment_downloads', { book_id: bookId }); } catch(e) { console.error(e); }
}
async function trackSiteVisit(page) {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) { sessionId = crypto.randomUUID(); localStorage.setItem('session_id', sessionId); }
  await supabase.from('site_visits').insert([{ session_id: sessionId, page }]);
  await supabase.from('active_sessions').upsert({ session_id: sessionId, last_seen: new Date().toISOString(), user_agent: navigator.userAgent });
}
setInterval(async () => {
  const sessionId = localStorage.getItem('session_id');
  if (sessionId) await supabase.from('active_sessions').upsert({ session_id: sessionId, last_seen: new Date().toISOString() });
}, 30000);