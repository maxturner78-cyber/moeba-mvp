-- ============================================================
-- Seed: Users & Peer Assignments
-- ============================================================

-- Admin (1)
INSERT INTO users (id, company_id, email, full_name, role, job_title) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'admin@swangroup.test',
   'Pilot Admin', 'admin', 'Head of Early Careers');

-- Managers (2)
INSERT INTO users (id, company_id, email, full_name, role, job_title) VALUES
  ('mmmm0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'david.liu@swangroup.test',
   'David Liu', 'manager', 'Audit Manager'),
  ('mmmm0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'rebecca.torres@swangroup.test',
   'Rebecca Torres', 'manager', 'Audit Senior Manager');

-- Graduates (6)
INSERT INTO users (id, company_id, email, full_name, role, job_title, hire_date, manager_id) VALUES
  ('gggg0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'sarah.chen@swangroup.test',
   'Sarah Chen', 'graduate', 'Graduate Associate',
   (CURRENT_DATE - INTERVAL '12 weeks'),
   'mmmm0001-0000-0000-0000-000000000001'),
  ('gggg0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'marcus.johnson@swangroup.test',
   'Marcus Johnson', 'graduate', 'Senior Associate',
   (CURRENT_DATE - INTERVAL '16 weeks'),
   'mmmm0002-0000-0000-0000-000000000002'),
  ('gggg0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'priya.patel@swangroup.test',
   'Priya Patel', 'graduate', 'Graduate Analyst',
   (CURRENT_DATE - INTERVAL '10 weeks'),
   'mmmm0002-0000-0000-0000-000000000002'),
  ('gggg0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'tyler.morrison@swangroup.test',
   'Tyler Morrison', 'graduate', 'Graduate Consultant',
   (CURRENT_DATE - INTERVAL '14 weeks'),
   'mmmm0001-0000-0000-0000-000000000001'),
  ('gggg0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'james.park@swangroup.test',
   'James Park', 'graduate', 'Graduate Analyst',
   (CURRENT_DATE - INTERVAL '11 weeks'),
   'mmmm0002-0000-0000-0000-000000000002'),
  ('gggg0006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'emily.zhang@swangroup.test',
   'Emily Zhang', 'graduate', 'Graduate Associate',
   (CURRENT_DATE - INTERVAL '13 weeks'),
   'mmmm0001-0000-0000-0000-000000000001');

-- Peers (4)
INSERT INTO users (id, company_id, email, full_name, role, job_title) VALUES
  ('pppp0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'alex.wright@swangroup.test',
   'Alex Wright', 'peer', 'Associate'),
  ('pppp0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'jess.kim@swangroup.test',
   'Jess Kim', 'peer', 'Associate'),
  ('pppp0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'raj.mehta@swangroup.test',
   'Raj Mehta', 'peer', 'Senior Associate'),
  ('pppp0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'nina.fox@swangroup.test',
   'Nina Fox', 'peer', 'Senior Associate');

-- Peer assignments: each graduate has 2 peers
INSERT INTO peer_assignments (graduate_id, peer_id, assigned_by) VALUES
  ('gggg0001-0000-0000-0000-000000000001', 'pppp0001-0000-0000-0000-000000000001', 'mmmm0001-0000-0000-0000-000000000001'),
  ('gggg0001-0000-0000-0000-000000000001', 'pppp0002-0000-0000-0000-000000000002', 'mmmm0001-0000-0000-0000-000000000001'),
  ('gggg0002-0000-0000-0000-000000000002', 'pppp0003-0000-0000-0000-000000000003', 'mmmm0002-0000-0000-0000-000000000002'),
  ('gggg0002-0000-0000-0000-000000000002', 'pppp0004-0000-0000-0000-000000000004', 'mmmm0002-0000-0000-0000-000000000002'),
  ('gggg0003-0000-0000-0000-000000000003', 'pppp0001-0000-0000-0000-000000000001', 'mmmm0002-0000-0000-0000-000000000002'),
  ('gggg0003-0000-0000-0000-000000000003', 'pppp0003-0000-0000-0000-000000000003', 'mmmm0002-0000-0000-0000-000000000002'),
  ('gggg0004-0000-0000-0000-000000000004', 'pppp0002-0000-0000-0000-000000000002', 'mmmm0001-0000-0000-0000-000000000001'),
  ('gggg0004-0000-0000-0000-000000000004', 'pppp0004-0000-0000-0000-000000000004', 'mmmm0001-0000-0000-0000-000000000001'),
  ('gggg0005-0000-0000-0000-000000000005', 'pppp0001-0000-0000-0000-000000000001', 'mmmm0002-0000-0000-0000-000000000002'),
  ('gggg0005-0000-0000-0000-000000000005', 'pppp0003-0000-0000-0000-000000000003', 'mmmm0002-0000-0000-0000-000000000002'),
  ('gggg0006-0000-0000-0000-000000000006', 'pppp0002-0000-0000-0000-000000000002', 'mmmm0001-0000-0000-0000-000000000001'),
  ('gggg0006-0000-0000-0000-000000000006', 'pppp0004-0000-0000-0000-000000000004', 'mmmm0001-0000-0000-0000-000000000001');
