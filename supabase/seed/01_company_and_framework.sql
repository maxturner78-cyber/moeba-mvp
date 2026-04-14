-- ============================================================
-- Seed: Company, Framework, Skill Nodes & Edges
-- ============================================================

-- 1. Company
INSERT INTO companies (id, name)
VALUES ('11111111-1111-1111-1111-111111111111', 'Swan Group');

-- 2. Competency Framework
INSERT INTO competency_frameworks (id, company_id, name, version, active)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'CA ANZ Graduate Competency Framework',
  'v1.0',
  true
);

-- 3. Skill Nodes (25 nodes matching src/data/skillsData.ts exactly)
--    Using deterministic UUIDs: aaaaaaaa-0000-4000-a000-<12-char-hex>
INSERT INTO skill_nodes (id, framework_id, slug, name, cluster, promotion_required, display_order)
VALUES
  ('aaaaaaaa-0001-4000-a000-000000000001', '22222222-2222-2222-2222-222222222222', 'communication',        'Professional Communication',     'core',       false, 1),
  ('aaaaaaaa-0002-4000-a000-000000000002', '22222222-2222-2222-2222-222222222222', 'teamwork',             'Team Collaboration',             'core',       false, 2),
  ('aaaaaaaa-0003-4000-a000-000000000003', '22222222-2222-2222-2222-222222222222', 'time-mgmt',            'Time Management',                'core',       false, 3),
  ('aaaaaaaa-0004-4000-a000-000000000004', '22222222-2222-2222-2222-222222222222', 'analytical',           'Analytical Thinking',            'core',       false, 4),
  ('aaaaaaaa-0005-4000-a000-000000000005', '22222222-2222-2222-2222-222222222222', 'adaptability',         'Adaptability',                   'core',       false, 5),
  ('aaaaaaaa-0006-4000-a000-000000000006', '22222222-2222-2222-2222-222222222222', 'attention-detail',     'Attention to Detail',            'core',       false, 6),
  ('aaaaaaaa-0007-4000-a000-000000000007', '22222222-2222-2222-2222-222222222222', 'initiative',           'Initiative & Ownership',         'core',       false, 7),
  ('aaaaaaaa-0008-4000-a000-000000000008', '22222222-2222-2222-2222-222222222222', 'confidence',           'Professional Confidence',        'core',       false, 8),
  ('aaaaaaaa-0009-4000-a000-000000000009', '22222222-2222-2222-2222-222222222222', 'audit-planning',       'Audit Planning',                 'audit',      false, 9),
  ('aaaaaaaa-0010-4000-a000-000000000010', '22222222-2222-2222-2222-222222222222', 'risk-assessment',      'Risk Assessment',                'audit',      false, 10),
  ('aaaaaaaa-0011-4000-a000-000000000011', '22222222-2222-2222-2222-222222222222', 'fin-statements',       'Financial Statement Review',     'audit',      false, 11),
  ('aaaaaaaa-0012-4000-a000-000000000012', '22222222-2222-2222-2222-222222222222', 'documentation',        'Documentation Standards',        'audit',      false, 12),
  ('aaaaaaaa-0013-4000-a000-000000000013', '22222222-2222-2222-2222-222222222222', 'sampling',             'Sampling Methodology',           'audit',      false, 13),
  ('aaaaaaaa-0014-4000-a000-000000000014', '22222222-2222-2222-2222-222222222222', 'materiality',          'Materiality Analysis',           'audit',      false, 14),
  ('aaaaaaaa-0015-4000-a000-000000000015', '22222222-2222-2222-2222-222222222222', 'audit-evidence',       'Audit Evidence',                 'audit',      false, 15),
  ('aaaaaaaa-0016-4000-a000-000000000016', '22222222-2222-2222-2222-222222222222', 'client-comm',          'Client Communication',           'client',     false, 16),
  ('aaaaaaaa-0017-4000-a000-000000000017', '22222222-2222-2222-2222-222222222222', 'stakeholder-mgmt',     'Stakeholder Management',         'client',     true,  17),
  ('aaaaaaaa-0018-4000-a000-000000000018', '22222222-2222-2222-2222-222222222222', 'client-relationship',  'Client Relationship Building',   'client',     true,  18),
  ('aaaaaaaa-0019-4000-a000-000000000019', '22222222-2222-2222-2222-222222222222', 'presentation',         'Presentation Skills',            'client',     false, 19),
  ('aaaaaaaa-0020-4000-a000-000000000020', '22222222-2222-2222-2222-222222222222', 'tax-compliance',       'Tax Compliance Basics',          'tax',        false, 20),
  ('aaaaaaaa-0021-4000-a000-000000000021', '22222222-2222-2222-2222-222222222222', 'tax-returns',          'Tax Return Preparation',         'tax',        false, 21),
  ('aaaaaaaa-0022-4000-a000-000000000022', '22222222-2222-2222-2222-222222222222', 'gst-bas',              'GST & BAS',                      'tax',        false, 22),
  ('aaaaaaaa-0023-4000-a000-000000000023', '22222222-2222-2222-2222-222222222222', 'aml-ctf',              'AML/CTF Procedures',             'compliance', false, 23),
  ('aaaaaaaa-0024-4000-a000-000000000024', '22222222-2222-2222-2222-222222222222', 'ethics',               'Ethics & Prof. Standards',       'compliance', false, 24),
  ('aaaaaaaa-0025-4000-a000-000000000025', '22222222-2222-2222-2222-222222222222', 'whs',                  'Workplace Health & Safety',      'compliance', false, 25);

-- 4. Skill Edges (matching allEdges from skillsData.ts)
--    References use the deterministic UUIDs above via a slug→id mapping approach.
--    We use a CTE for readability.
WITH node_map AS (
  SELECT id, slug FROM skill_nodes WHERE framework_id = '22222222-2222-2222-2222-222222222222'
)
INSERT INTO skill_edges (framework_id, source_node_id, target_node_id)
SELECT
  '22222222-2222-2222-2222-222222222222',
  s.id,
  t.id
FROM (VALUES
  ('communication',    'teamwork'),
  ('communication',    'client-comm'),
  ('communication',    'presentation'),
  ('teamwork',         'adaptability'),
  ('teamwork',         'confidence'),
  ('analytical',       'fin-statements'),
  ('analytical',       'risk-assessment'),
  ('analytical',       'audit-planning'),
  ('attention-detail', 'documentation'),
  ('attention-detail', 'fin-statements'),
  ('audit-planning',   'risk-assessment'),
  ('audit-planning',   'sampling'),
  ('audit-planning',   'materiality'),
  ('risk-assessment',  'materiality'),
  ('risk-assessment',  'audit-evidence'),
  ('fin-statements',   'documentation'),
  ('fin-statements',   'audit-evidence'),
  ('client-comm',      'stakeholder-mgmt'),
  ('client-comm',      'client-relationship'),
  ('client-comm',      'presentation'),
  ('presentation',     'confidence'),
  ('presentation',     'initiative'),
  ('tax-compliance',   'tax-returns'),
  ('tax-compliance',   'gst-bas'),
  ('aml-ctf',          'ethics'),
  ('ethics',           'whs'),
  ('documentation',    'ethics'),
  ('initiative',       'confidence'),
  ('initiative',       'analytical'),
  ('time-mgmt',        'adaptability'),
  ('time-mgmt',        'audit-planning')
) AS edges(source_slug, target_slug)
JOIN node_map s ON s.slug = edges.source_slug
JOIN node_map t ON t.slug = edges.target_slug;
