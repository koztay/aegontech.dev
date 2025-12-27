-- Sample data for AEGONTECH LLC website

-- Insert services
INSERT INTO services (icon, title, description, sort_order) VALUES
  ('code', 'Custom Software Development', 'End-to-end development of tailored software solutions that fit your unique business needs.', 1),
  ('smartphone', 'Mobile App Development', 'Native and cross-platform mobile applications for iOS and Android platforms.', 2),
  ('cloud', 'SaaS Product Development', 'Scalable cloud-based software products designed for subscription-based delivery.', 3),
  ('palette', 'UI/UX Design', 'User-centered design that creates intuitive and beautiful digital experiences.', 4),
  ('server', 'Cloud Infrastructure', 'Robust cloud architecture and DevOps solutions for high availability and scale.', 5);

-- Insert team members
INSERT INTO team_members (name, role, bio, photo_url) VALUES
  ('Alex Chen', 'CEO & Founder', '15+ years in software development. Previously led engineering at a Fortune 500 tech company.', ''),
  ('Sarah Johnson', 'CTO', 'Full-stack architect with expertise in scalable cloud systems and microservices.', ''),
  ('Marcus Williams', 'Lead Designer', 'Award-winning designer focused on creating exceptional user experiences.', ''),
  ('Emily Rodriguez', 'Mobile Lead', 'iOS and Android specialist with 20+ apps shipped to the App Store and Play Store.', '');

-- Insert testimonials
INSERT INTO testimonials (quote, client_name, client_company, client_photo_url) VALUES
  ('AEGONTECH transformed our vision into a polished product that our users love. Their attention to detail is unmatched.', 'Michael Foster', 'TechVentures Inc.', ''),
  ('Working with AEGONTECH was seamless. They delivered on time, on budget, and exceeded our expectations.', 'Jennifer Martinez', 'StartupFlow', ''),
  ('Their mobile app development expertise helped us launch on both platforms simultaneously. Highly recommended!', 'David Park', 'MobileFirst Solutions', ''),
  ('The SaaS platform they built for us handles thousands of users daily without breaking a sweat.', 'Lisa Thompson', 'CloudScale Corp', '');

-- Insert portfolio items
INSERT INTO portfolio_items (title, description, type, screenshot, website_url, app_store_url, play_store_url) VALUES
  ('Dialable', 'International calling platform with competitive rates worldwide.', 'saas', 'https://picsum.photos/seed/dialable/400/300', 'https://www.dialable.world', NULL, NULL),
  ('Maximus IPTV Player', 'Feature-rich IPTV player for iOS with M3U and Xtream support.', 'mobile', 'https://picsum.photos/seed/maximus/400/300', NULL, 'https://apps.apple.com/app/maximus-iptv-player-m3u-xtream/id6744410529', NULL),
  ('CloudSync Pro', 'Enterprise file synchronization and collaboration platform.', 'saas', 'https://picsum.photos/seed/cloudsync/400/300', 'https://cloudsync.example.com', NULL, NULL);

-- Insert sample blog post
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, status, published_at) VALUES
  ('Building Modern SaaS Applications', 'building-modern-saas-applications', 'Learn how to build scalable SaaS applications with modern technologies.', 'Building modern SaaS applications requires careful planning and the right technology stack...', 'https://picsum.photos/seed/blog1/800/400', 'published', now());
