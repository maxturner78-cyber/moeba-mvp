-- ============================================================
-- Seed: Users & Peer Assignments
-- ============================================================

-- Admin (1)
INSERT INTO users (id, company_id, email, full_name, role, job_title) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'admin@swangroup.test',
   'Pilot Admin', 'admin', 'Head of Early Careers');

-- Managers (2)
INSERT INTO users (id, company_id, email, full_name, role, job_title) VALUES
  ('dddd0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'david.liu@swangroup.test',
   'David Liu', 'manager', 'Audit Manager'),
  ('dddd0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'rebecca.torres@swangroup.test',
   'Rebecca Torres', 'manager', 'Audit Senior Manager');

-- Graduates (6)
INSERT INTO users (id, company_id, email, full_name, role, job_title, hire_date, manager_id) VALUES
  ('cccc0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'sarah.chen@swangroup.test',
   'Sarah Chen', 'graduate', 'Graduate Associate',
   (CURRENT_DATE - INTERVAL '12 weeks'),
   'dddd0001-0000-0000-0000-000000000001'),
  ('cccc0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'marcus.johnson@swangroup.test',
   'Marcus Johnson', 'graduate', 'Senior Associate',
   (CURRENT_DATE - INTERVAL '16 weeks'),
   'dddd0002-0000-0000-0000-000000000002'),
  ('cccc0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'priya.patel@swangroup.test',
   'Priya Patel', 'graduate', 'Graduate Analyst',
   (CURRENT_DATE - INTERVAL '10 weeks'),
   'dddd0002-0000-0000-0000-000000000002'),
  ('cccc0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'tyler.morrison@swangroup.test',
   'Tyler Morrison', 'graduate', 'Graduate Consultant',
   (CURRENT_DATE - INTERVAL '14 weeks'),
   'dddd0001-0000-0000-0000-000000000001'),
  ('cccc0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'james.park@swangroup.test',
   'James Park', 'graduate', 'Graduate Analyst',
   (CURRENT_DATE - INTERVAL '11 weeks'),
   'dddd0002-0000-0000-0000-000000000002'),
  ('cccc0006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'emily.zhang@swangroup.test',
   'Emily Zhang', 'graduate', 'Graduate Associate',
   (CURRENT_DATE - INTERVAL '13 weeks'),
   'dddd0001-0000-0000-0000-000000000001');

-- Peers (4)
INSERT INTO users (id, company_id, email, full_name, role, job_title) VALUES
  ('bbbb0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'alex.wright@swangroup.test',
   'Alex Wright', 'peer', 'Associate'),
  ('bbbb0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'jess.kim@swangroup.test',
   'Jess Kim', 'peer', 'Associate'),
  ('bbbb0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'raj.mehta@swangroup.test',
   'Raj Mehta', 'peer', 'Senior Associate'),
  ('bbbb0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'nina.fox@swangroup.test',
   'Nina Fox', 'peer', 'Senior Associate');

-- Peer assignments: each graduate has 2 peers
INSERT INTO peer_assignments (graduate_id, peer_id, assigned_by) VALUES
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'dddd0001-0000-0000-0000-000000000001'),
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0002-0000-0000-0000-000000000002', 'dddd0001-0000-0000-0000-000000000001'),
  ('cccc0002-0000-0000-0000-000000000002', 'bbbb0003-0000-0000-0000-000000000003', 'dddd0002-0000-0000-0000-000000000002'),
  ('cccc0002-0000-0000-0000-000000000002', 'bbbb0004-0000-0000-0000-000000000004', 'dddd0002-0000-0000-0000-000000000002'),
  ('cccc0003-0000-0000-0000-000000000003', 'bbbb0001-0000-0000-0000-000000000001', 'dddd0002-0000-0000-0000-000000000002'),
  ('cccc0003-0000-0000-0000-000000000003', 'bbbb0003-0000-0000-0000-000000000003', 'dddd0002-0000-0000-0000-000000000002'),
  ('cccc0004-0000-0000-0000-000000000004', 'bbbb0002-0000-0000-0000-000000000002', 'dddd0001-0000-0000-0000-000000000001'),
  ('cccc0004-0000-0000-0000-000000000004', 'bbbb0004-0000-0000-0000-000000000004', 'dddd0001-0000-0000-0000-000000000001'),
  ('cccc0005-0000-0000-0000-000000000005', 'bbbb0001-0000-0000-0000-000000000001', 'dddd0002-0000-0000-0000-000000000002'),
  ('cccc0005-0000-0000-0000-000000000005', 'bbbb0003-0000-0000-0000-000000000003', 'dddd0002-0000-0000-0000-000000000002'),
  ('cccc0006-0000-0000-0000-000000000006', 'bbbb0002-0000-0000-0000-000000000002', 'dddd0001-0000-0000-0000-000000000001'),
  ('cccc0006-0000-0000-0000-000000000006', 'bbbb0004-0000-0000-0000-000000000004', 'dddd0001-0000-0000-0000-000000000001');
