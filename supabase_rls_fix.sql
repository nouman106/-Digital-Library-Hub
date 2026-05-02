-- =============================================
-- SUPABASE RLS FIX — 401 Unauthorized band karo
-- Supabase Dashboard → SQL Editor → Paste → Run
-- =============================================

-- 1. active_sessions: anon ko upsert ki ijazat
ALTER TABLE IF EXISTS active_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON active_sessions;
CREATE POLICY "anon_all" ON active_sessions FOR ALL TO anon USING (true) WITH CHECK (true);

-- 2. site_visits: anon ko insert/select ki ijazat  
ALTER TABLE IF EXISTS site_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert" ON site_visits;
CREATE POLICY "anon_insert" ON site_visits FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "anon_select" ON site_visits;
CREATE POLICY "anon_select" ON site_visits FOR SELECT TO anon USING (true);

-- 3. books: anon ko sirf allow_access=true wali kitabein dikhao
ALTER TABLE IF EXISTS books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read" ON books;
CREATE POLICY "anon_read" ON books FOR SELECT TO anon USING (allow_access = true);

-- 4. settings: anon parh sake
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read" ON settings;
CREATE POLICY "anon_read" ON settings FOR SELECT TO anon USING (true);

-- 5. contact_messages: anon bhej sake
ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert" ON contact_messages;
CREATE POLICY "anon_insert" ON contact_messages FOR INSERT TO anon WITH CHECK (true);

-- 6. increment functions — SECURITY DEFINER se anon call kar sake
CREATE OR REPLACE FUNCTION increment_views(book_id INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN UPDATE books SET views = COALESCE(views,0)+1 WHERE id = book_id; END; $$;

CREATE OR REPLACE FUNCTION increment_downloads(book_id INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN UPDATE books SET downloads = COALESCE(downloads,0)+1 WHERE id = book_id; END; $$;

-- Check karein:
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
