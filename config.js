// config.js - Safe version (no duplicate declaration)
(function() {
  // Agar pehle se define hai to do nothing
  if (window.supabaseClient) return;
  
  const SUPABASE_URL = 'https://ykmsizkprilhidqvxaqq.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_UNOPedCOLNaCz878UCdo3w_5dnM-Gp-';
  
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  window.incrementBookViews = async function(bookId) {
    try { await window.supabaseClient.rpc('increment_views', { book_id: bookId }); } catch(e) { console.error(e); }
  };
  
  window.incrementBookDownloads = async function(bookId) {
    try { await window.supabaseClient.rpc('increment_downloads', { book_id: bookId }); } catch(e) { console.error(e); }
  };
  
  window.trackSiteVisit = async function(page) {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) { sessionId = crypto.randomUUID(); localStorage.setItem('session_id', sessionId); }
    await window.supabaseClient.from('site_visits').insert([{ session_id: sessionId, page }]);
    await window.supabaseClient.from('active_sessions').upsert({ session_id: sessionId, last_seen: new Date().toISOString(), user_agent: navigator.userAgent });
  };
  
  setInterval(async () => {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) await window.supabaseClient.from('active_sessions').upsert({ session_id: sessionId, last_seen: new Date().toISOString() });
  }, 30000);
})();