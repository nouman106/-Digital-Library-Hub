-- ============================================================
-- KitabGhar – Fixed RLS Policies
-- ============================================================

-- ✅ FIX 1: books table
-- Anon sirf READ kar sakta hai. Sirf logged-in admin write kar sakta hai.
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_full" ON books;
DROP POLICY IF EXISTS "anon_read_books" ON books;
DROP POLICY IF EXISTS "auth_write_books" ON books;

CREATE POLICY "anon_read_books"
  ON books FOR SELECT TO anon USING (true);

CREATE POLICY "auth_write_books"
  ON books FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ✅ FIX 2: contact_messages
-- Anon sirf INSERT kar sakta hai (form submit). READ sirf admin.
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_msgs" ON contact_messages;
DROP POLICY IF EXISTS "anon_insert_msgs" ON contact_messages;
DROP POLICY IF EXISTS "auth_read_msgs" ON contact_messages;

CREATE POLICY "anon_insert_msgs"
  ON contact_messages FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "auth_all_msgs"
  ON contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ✅ FIX 3: site_visits
-- Anon track kar sakta hai, admin read kar sakta hai
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_visits" ON site_visits;
DROP POLICY IF EXISTS "anon_insert_visits" ON site_visits;

CREATE POLICY "anon_insert_visits"
  ON site_visits FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "auth_read_visits"
  ON site_visits FOR SELECT TO authenticated USING (true);


-- ✅ FIX 4: active_sessions
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_sessions" ON active_sessions;

CREATE POLICY "anon_upsert_sessions"
  ON active_sessions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_sessions"
  ON active_sessions FOR UPDATE TO anon USING (true);

CREATE POLICY "auth_read_sessions"
  ON active_sessions FOR SELECT TO authenticated USING (true);


-- ✅ FIX 5: settings table
-- Sirf admin access kare
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all" ON settings;

CREATE POLICY "auth_all_settings"
  ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ✅ FIX 6: admins table ko BILKUL protect karo
-- Pehli baar yeh table RLS policy mein add ho rahi hai
-- Koi bhi anon user admins table nahi dekh sakta
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_admins" ON admins;

-- NOTE: Supabase Auth use karne ke baad admins table ki
-- zaroorat nahi — lekin agar rakha hai toh sirf authenticated access do
CREATE POLICY "auth_only_admins"
  ON admins FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ============================================================
-- Storage Buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('books-pdf', 'books-pdf', true)
  ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('covers', 'covers', true)
  ON CONFLICT DO NOTHING;

-- ✅ Anon sirf READ kar sakta hai storage se (public bucket)
-- Sirf authenticated (admin) upload kar sakta hai
DROP POLICY IF EXISTS "anon_upload_pdf" ON storage.objects;
DROP POLICY IF EXISTS "anon_upload_covers" ON storage.objects;
DROP POLICY IF EXISTS "public_read_pdf" ON storage.objects;
DROP POLICY IF EXISTS "public_read_covers" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_pdf" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_covers" ON storage.objects;

CREATE POLICY "public_read_pdf"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'books-pdf');

CREATE POLICY "public_read_covers"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'covers');

CREATE POLICY "auth_upload_pdf"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'books-pdf')
  WITH CHECK (bucket_id = 'books-pdf');

CREATE POLICY "auth_upload_covers"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'covers')
  WITH CHECK (bucket_id = 'covers');
