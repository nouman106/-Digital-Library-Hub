(function () {
  if (window.supabaseClient) return;

  const SUPABASE_URL = 'https://ykmsizkprilhidqvxaqq.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_UNOPedCOLNaCz878UCdo3w_5dnM-Gp-';

  if (typeof window.supabase === 'undefined') {
    console.error('Supabase library load nahi hui');
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.incrementBookViews = async function (bookId) {
    try { await window.supabaseClient.rpc('increment_views', { book_id: bookId }); } catch (e) {}
  };
  window.incrementBookDownloads = async function (bookId) {
    try { await window.supabaseClient.rpc('increment_downloads', { book_id: bookId }); } catch (e) {}
  };

  // FIX: try-catch — 401 se crash nahi hoga, spam bhi band
  window.trackSiteVisit = async function (page) {
    try {
      let sid = localStorage.getItem('session_id');
      if (!sid) { sid = crypto.randomUUID(); localStorage.setItem('session_id', sid); }
      await window.supabaseClient.from('site_visits').insert([{ session_id: sid, page }]);
      await window.supabaseClient.from('active_sessions').upsert({
        session_id: sid, last_seen: new Date().toISOString(), user_agent: navigator.userAgent
      });
    } catch (e) {}
  };

  setInterval(async () => {
    try {
      const sid = localStorage.getItem('session_id');
      if (sid) await window.supabaseClient.from('active_sessions')
        .upsert({ session_id: sid, last_seen: new Date().toISOString() });
    } catch (e) {}
  }, 30000);
})();
