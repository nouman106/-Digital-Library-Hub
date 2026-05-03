(function() {
  if (window.supabaseClient) return;

  // 🔴 IMPORTANT: Replace with YOUR Supabase URL and anon key
  const SUPABASE_URL = 'https://ykmsizkprilhidqvxaqq.supabase.co';   // <-- CHANGE THIS
  const SUPABASE_ANON_KEY = 'sb_publishable_UNOPedCOLNaCz878UCdo3w_5dnM-Gp-'; // <-- CHANGE THIS

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Analytics functions
  window.incrementBookViews = async function(bookId) {
    try { await window.supabaseClient.rpc('increment_views', { book_id: bookId }); } catch(e) { console.warn(e); }
  };
  window.incrementBookDownloads = async function(bookId) {
    try { await window.supabaseClient.rpc('increment_downloads', { book_id: bookId }); } catch(e) { console.warn(e); }
  };
  window.trackSiteVisit = async function(page) {
    try {
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) { sessionId = crypto.randomUUID(); localStorage.setItem('session_id', sessionId); }
      await window.supabaseClient.from('site_visits').insert([{ session_id: sessionId, page }]);
      await window.supabaseClient.from('active_sessions').upsert({ session_id: sessionId, last_seen: new Date().toISOString(), user_agent: navigator.userAgent });
    } catch(e) { console.warn(e); }
  };
  window.addEventListener('load', () => {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    window.trackSiteVisit(page);
  });
  setInterval(async () => {
    try {
      const sessionId = localStorage.getItem('session_id');
      if (sessionId) await window.supabaseClient.from('active_sessions').upsert({ session_id: sessionId, last_seen: new Date().toISOString() });
    } catch(e) {}
  }, 30000);
})();