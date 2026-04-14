-- ============================================================
-- Seed: Graduates g2-g6 — single current-week snapshot
-- ============================================================

-- ---- Marcus Johnson (g2) — week 16, accelerating ----
INSERT INTO weekly_check_ins_self (graduate_id, week_number, check_in_date, dimension_scores) VALUES
  ('gggg0002-0000-0000-0000-000000000002', 16, CURRENT_DATE,
   '{"confidence":8,"workload":7,"managerSupport":8,"selfRating":8,"questionsAsked":7,"ownershipFollowThrough":8.0,"curiosity":7.5,"managerRelationship":8.4,"teamConnection":8.1,"feedbackApplication":7.8,"workloadMgmt":7.6,"initiative":8.0,"resilience":7.9}'::jsonb);

INSERT INTO weekly_check_ins_manager (manager_id, graduate_id, week_number, check_in_date, dimension_scores, questions_observed, manager_confidence) VALUES
  ('mmmm0002-0000-0000-0000-000000000002', 'gggg0002-0000-0000-0000-000000000002', 16, CURRENT_DATE,
   '{"workQuality":9,"proactivity":8,"feedbackResponse":8,"overallRating":9}'::jsonb, 7, 8);

INSERT INTO weekly_check_ins_peer (peer_id, graduate_id, week_number, dimension_scores) VALUES
  ('pppp0003-0000-0000-0000-000000000003', 'gggg0002-0000-0000-0000-000000000002', 16,
   '{"collaboration":8.5,"reliability":8.8,"communication":8.0,"overall":8.5}'::jsonb),
  ('pppp0004-0000-0000-0000-000000000004', 'gggg0002-0000-0000-0000-000000000002', 16,
   '{"collaboration":8.2,"reliability":9.0,"communication":7.8,"overall":8.3}'::jsonb);

-- ---- Priya Patel (g3) — week 10, steady ----
INSERT INTO weekly_check_ins_self (graduate_id, week_number, check_in_date, dimension_scores) VALUES
  ('gggg0003-0000-0000-0000-000000000003', 10, CURRENT_DATE,
   '{"confidence":7,"workload":6,"managerSupport":7,"selfRating":7,"questionsAsked":5,"ownershipFollowThrough":6.5,"curiosity":6.2,"managerRelationship":6.9,"teamConnection":6.5,"feedbackApplication":7.0,"workloadMgmt":6.8,"initiative":6.4,"resilience":6.6}'::jsonb);

INSERT INTO weekly_check_ins_manager (manager_id, graduate_id, week_number, check_in_date, dimension_scores, questions_observed, manager_confidence) VALUES
  ('mmmm0002-0000-0000-0000-000000000002', 'gggg0003-0000-0000-0000-000000000003', 10, CURRENT_DATE,
   '{"workQuality":7,"proactivity":6,"feedbackResponse":7,"overallRating":7}'::jsonb, 5, 7);

INSERT INTO weekly_check_ins_peer (peer_id, graduate_id, week_number, dimension_scores) VALUES
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0003-0000-0000-0000-000000000003', 10,
   '{"collaboration":6.8,"reliability":7.0,"communication":6.5,"overall":6.8}'::jsonb),
  ('pppp0003-0000-0000-0000-000000000003', 'gggg0003-0000-0000-0000-000000000003', 10,
   '{"collaboration":7.0,"reliability":6.8,"communication":6.8,"overall":7.0}'::jsonb);

-- ---- Tyler Morrison (g4) — week 14, stalling (self ~2 pts below manager) ----
INSERT INTO weekly_check_ins_self (graduate_id, week_number, check_in_date, dimension_scores) VALUES
  ('gggg0004-0000-0000-0000-000000000004', 14, CURRENT_DATE,
   '{"confidence":4,"workload":7,"managerSupport":5,"selfRating":4,"questionsAsked":3,"ownershipFollowThrough":4.5,"curiosity":4.0,"managerRelationship":4.2,"teamConnection":4.0,"feedbackApplication":5.0,"workloadMgmt":4.8,"initiative":3.5,"resilience":4.5}'::jsonb);

INSERT INTO weekly_check_ins_manager (manager_id, graduate_id, week_number, check_in_date, dimension_scores, questions_observed, manager_confidence) VALUES
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0004-0000-0000-0000-000000000004', 14, CURRENT_DATE,
   '{"workQuality":6,"proactivity":5,"feedbackResponse":6,"overallRating":6}'::jsonb, 3, 5);

INSERT INTO weekly_check_ins_peer (peer_id, graduate_id, week_number, dimension_scores) VALUES
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0004-0000-0000-0000-000000000004', 14,
   '{"collaboration":5.5,"reliability":5.8,"communication":5.0,"overall":5.5}'::jsonb),
  ('pppp0004-0000-0000-0000-000000000004', 'gggg0004-0000-0000-0000-000000000004', 14,
   '{"collaboration":5.2,"reliability":6.0,"communication":4.8,"overall":5.3}'::jsonb);

-- ---- James Park (g5) — week 11, accelerating ----
INSERT INTO weekly_check_ins_self (graduate_id, week_number, check_in_date, dimension_scores) VALUES
  ('gggg0005-0000-0000-0000-000000000005', 11, CURRENT_DATE,
   '{"confidence":7,"workload":6,"managerSupport":8,"selfRating":7,"questionsAsked":7,"ownershipFollowThrough":7.5,"curiosity":7.8,"managerRelationship":7.6,"teamConnection":7.9,"feedbackApplication":7.4,"workloadMgmt":7.0,"initiative":7.3,"resilience":7.1}'::jsonb);

INSERT INTO weekly_check_ins_manager (manager_id, graduate_id, week_number, check_in_date, dimension_scores, questions_observed, manager_confidence) VALUES
  ('mmmm0002-0000-0000-0000-000000000002', 'gggg0005-0000-0000-0000-000000000005', 11, CURRENT_DATE,
   '{"workQuality":8,"proactivity":7,"feedbackResponse":8,"overallRating":8}'::jsonb, 7, 8);

INSERT INTO weekly_check_ins_peer (peer_id, graduate_id, week_number, dimension_scores) VALUES
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0005-0000-0000-0000-000000000005', 11,
   '{"collaboration":7.8,"reliability":7.5,"communication":7.2,"overall":7.5}'::jsonb),
  ('pppp0003-0000-0000-0000-000000000003', 'gggg0005-0000-0000-0000-000000000005', 11,
   '{"collaboration":7.5,"reliability":8.0,"communication":7.0,"overall":7.5}'::jsonb);

-- ---- Emily Zhang (g6) — week 13, attention (overloaded) ----
INSERT INTO weekly_check_ins_self (graduate_id, week_number, check_in_date, dimension_scores) VALUES
  ('gggg0006-0000-0000-0000-000000000006', 13, CURRENT_DATE,
   '{"confidence":4,"workload":9,"managerSupport":4,"selfRating":5,"questionsAsked":2,"ownershipFollowThrough":5.8,"curiosity":6.0,"managerRelationship":4.8,"teamConnection":6.2,"feedbackApplication":6.8,"workloadMgmt":4.2,"initiative":5.5,"resilience":5.0}'::jsonb);

INSERT INTO weekly_check_ins_manager (manager_id, graduate_id, week_number, check_in_date, dimension_scores, questions_observed, manager_confidence) VALUES
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0006-0000-0000-0000-000000000006', 13, CURRENT_DATE,
   '{"workQuality":6,"proactivity":5,"feedbackResponse":6,"overallRating":5}'::jsonb, 2, 5);

INSERT INTO weekly_check_ins_peer (peer_id, graduate_id, week_number, dimension_scores) VALUES
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0006-0000-0000-0000-000000000006', 13,
   '{"collaboration":6.0,"reliability":6.5,"communication":5.8,"overall":6.0}'::jsonb),
  ('pppp0004-0000-0000-0000-000000000004', 'gggg0006-0000-0000-0000-000000000006', 13,
   '{"collaboration":5.8,"reliability":6.2,"communication":5.5,"overall":5.8}'::jsonb);

-- Emily work log — justifies workload=9
INSERT INTO work_log_entries (graduate_id, week_number, project_name, skill_slugs, is_first_exposure) VALUES
  ('gggg0006-0000-0000-0000-000000000006', 13,
   'Year-end audit crunch',
   ARRAY['audit-planning', 'workload-management'], false);
