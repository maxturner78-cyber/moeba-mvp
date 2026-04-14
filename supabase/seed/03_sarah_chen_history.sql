-- ============================================================
-- Seed: Sarah Chen — 12 weeks of historical check-ins
-- ============================================================

-- Self check-ins (weekly_check_ins_self)
-- selfCheckin arrays from sampleData.ts:
--   confidence: [8,8,7,5,6,7,7,6,5,5,5,5]
--   workload:   [6,6,7,7,7,7,6,7,9,7,7,6]
--   questionsAsked: [6,7,5,4,6,5,5,4,3,2,2,1]
--   selfRating: [7,7,6,5,6,6,6,5,5,5,5,5]
--   managerSupport: [8,8,7,7,7,7,6,6,6,6,5,5]
-- dimensions (week 12 final): ownershipFollowThrough:5.2, confidence:5.5, curiosity:4.8,
--   managerRelationship:7.1, teamConnection:7.4, feedbackApplication:8.1,
--   workloadMgmt:6.0, initiative:5.3, resilience:6.8

INSERT INTO weekly_check_ins_self (graduate_id, week_number, check_in_date, dimension_scores) VALUES
  ('gggg0001-0000-0000-0000-000000000001', 1,  CURRENT_DATE - INTERVAL '11 weeks',
   '{"confidence":8,"workload":6,"managerSupport":8,"selfRating":7,"questionsAsked":6,"ownershipFollowThrough":6.8,"curiosity":5.5,"managerRelationship":7.6,"teamConnection":7.9,"feedbackApplication":8.5,"workloadMgmt":6.3,"initiative":6.2,"resilience":7.4}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 2,  CURRENT_DATE - INTERVAL '10 weeks',
   '{"confidence":8,"workload":6,"managerSupport":8,"selfRating":7,"questionsAsked":7,"ownershipFollowThrough":6.5,"curiosity":5.8,"managerRelationship":7.8,"teamConnection":7.7,"feedbackApplication":8.6,"workloadMgmt":6.5,"initiative":6.0,"resilience":7.2}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 3,  CURRENT_DATE - INTERVAL '9 weeks',
   '{"confidence":7,"workload":7,"managerSupport":7,"selfRating":6,"questionsAsked":5,"ownershipFollowThrough":6.3,"curiosity":5.6,"managerRelationship":7.5,"teamConnection":7.8,"feedbackApplication":8.4,"workloadMgmt":6.4,"initiative":5.9,"resilience":7.3}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 4,  CURRENT_DATE - INTERVAL '8 weeks',
   '{"confidence":5,"workload":7,"managerSupport":7,"selfRating":5,"questionsAsked":4,"ownershipFollowThrough":6.0,"curiosity":5.3,"managerRelationship":7.4,"teamConnection":7.6,"feedbackApplication":8.3,"workloadMgmt":6.2,"initiative":5.7,"resilience":7.1}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 5,  CURRENT_DATE - INTERVAL '7 weeks',
   '{"confidence":6,"workload":7,"managerSupport":7,"selfRating":6,"questionsAsked":6,"ownershipFollowThrough":5.9,"curiosity":5.4,"managerRelationship":7.3,"teamConnection":7.5,"feedbackApplication":8.4,"workloadMgmt":6.1,"initiative":5.8,"resilience":7.0}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 6,  CURRENT_DATE - INTERVAL '6 weeks',
   '{"confidence":7,"workload":7,"managerSupport":7,"selfRating":6,"questionsAsked":5,"ownershipFollowThrough":5.7,"curiosity":5.2,"managerRelationship":7.2,"teamConnection":7.6,"feedbackApplication":8.2,"workloadMgmt":6.3,"initiative":5.6,"resilience":7.0}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 7,  CURRENT_DATE - INTERVAL '5 weeks',
   '{"confidence":7,"workload":6,"managerSupport":6,"selfRating":6,"questionsAsked":5,"ownershipFollowThrough":5.6,"curiosity":5.0,"managerRelationship":7.3,"teamConnection":7.5,"feedbackApplication":8.3,"workloadMgmt":6.0,"initiative":5.5,"resilience":6.9}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 8,  CURRENT_DATE - INTERVAL '4 weeks',
   '{"confidence":6,"workload":7,"managerSupport":6,"selfRating":5,"questionsAsked":4,"ownershipFollowThrough":5.5,"curiosity":4.9,"managerRelationship":7.1,"teamConnection":7.4,"feedbackApplication":8.2,"workloadMgmt":6.1,"initiative":5.4,"resilience":6.9}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 9,  CURRENT_DATE - INTERVAL '3 weeks',
   '{"confidence":5,"workload":9,"managerSupport":6,"selfRating":5,"questionsAsked":3,"ownershipFollowThrough":5.4,"curiosity":4.7,"managerRelationship":7.0,"teamConnection":7.3,"feedbackApplication":8.1,"workloadMgmt":5.8,"initiative":5.3,"resilience":6.8}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 10, CURRENT_DATE - INTERVAL '2 weeks',
   '{"confidence":5,"workload":7,"managerSupport":6,"selfRating":5,"questionsAsked":2,"ownershipFollowThrough":5.3,"curiosity":4.8,"managerRelationship":7.1,"teamConnection":7.5,"feedbackApplication":8.0,"workloadMgmt":6.0,"initiative":5.2,"resilience":6.8}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 11, CURRENT_DATE - INTERVAL '1 week',
   '{"confidence":5,"workload":7,"managerSupport":5,"selfRating":5,"questionsAsked":2,"ownershipFollowThrough":5.2,"curiosity":4.9,"managerRelationship":7.2,"teamConnection":7.4,"feedbackApplication":8.1,"workloadMgmt":6.1,"initiative":5.3,"resilience":6.7}'::jsonb),
  ('gggg0001-0000-0000-0000-000000000001', 12, CURRENT_DATE,
   '{"confidence":5,"workload":6,"managerSupport":5,"selfRating":5,"questionsAsked":1,"ownershipFollowThrough":5.2,"curiosity":4.8,"managerRelationship":7.1,"teamConnection":7.4,"feedbackApplication":8.1,"workloadMgmt":6.0,"initiative":5.3,"resilience":6.8}'::jsonb);

-- Manager check-ins (weekly_check_ins_manager) — David Liu
-- managerCheckin arrays:
--   workQuality:      [7,7,7,8,8,8,8,8,8,8,8,8]
--   proactivity:      [7,7,6,6,7,7,6,6,5,5,5,5]
--   feedbackResponse: [7,8,8,8,8,8,8,8,8,8,8,8]
--   questionsObserved:[5,6,4,3,5,4,4,3,2,2,1,1]
--   overallRating:    [7,7,7,8,8,8,8,8,8,8,8,8]

INSERT INTO weekly_check_ins_manager (manager_id, graduate_id, week_number, check_in_date, dimension_scores, questions_observed, manager_confidence) VALUES
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 1,  CURRENT_DATE - INTERVAL '11 weeks',
   '{"workQuality":7,"proactivity":7,"feedbackResponse":7,"overallRating":7}'::jsonb, 5, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 2,  CURRENT_DATE - INTERVAL '10 weeks',
   '{"workQuality":7,"proactivity":7,"feedbackResponse":8,"overallRating":7}'::jsonb, 6, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 3,  CURRENT_DATE - INTERVAL '9 weeks',
   '{"workQuality":7,"proactivity":6,"feedbackResponse":8,"overallRating":7}'::jsonb, 4, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 4,  CURRENT_DATE - INTERVAL '8 weeks',
   '{"workQuality":8,"proactivity":6,"feedbackResponse":8,"overallRating":8}'::jsonb, 3, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 5,  CURRENT_DATE - INTERVAL '7 weeks',
   '{"workQuality":8,"proactivity":7,"feedbackResponse":8,"overallRating":8}'::jsonb, 5, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 6,  CURRENT_DATE - INTERVAL '6 weeks',
   '{"workQuality":8,"proactivity":7,"feedbackResponse":8,"overallRating":8}'::jsonb, 4, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 7,  CURRENT_DATE - INTERVAL '5 weeks',
   '{"workQuality":8,"proactivity":6,"feedbackResponse":8,"overallRating":8}'::jsonb, 4, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 8,  CURRENT_DATE - INTERVAL '4 weeks',
   '{"workQuality":8,"proactivity":6,"feedbackResponse":8,"overallRating":8}'::jsonb, 3, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 9,  CURRENT_DATE - INTERVAL '3 weeks',
   '{"workQuality":8,"proactivity":5,"feedbackResponse":8,"overallRating":8}'::jsonb, 2, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 10, CURRENT_DATE - INTERVAL '2 weeks',
   '{"workQuality":8,"proactivity":5,"feedbackResponse":8,"overallRating":8}'::jsonb, 2, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 11, CURRENT_DATE - INTERVAL '1 week',
   '{"workQuality":8,"proactivity":5,"feedbackResponse":8,"overallRating":8}'::jsonb, 1, 7),
  ('mmmm0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 12, CURRENT_DATE,
   '{"workQuality":8,"proactivity":5,"feedbackResponse":8,"overallRating":8}'::jsonb, 1, 7);

-- Peer check-ins (weekly_check_ins_peer) — Alex Wright & Jess Kim
-- peerFeedback arrays (3 data points, we repeat/interpolate for 12 weeks):
--   collaboration: [7,7,8]
--   reliability:   [8,8,8]
--   communication: [7,7,7]
--   overall:       [7,7,7.5]
-- Peer 1: Alex Wright (pppp0001) — slight variation
-- Peer 2: Jess Kim   (pppp0002) — slight variation

INSERT INTO weekly_check_ins_peer (peer_id, graduate_id, week_number, check_in_date, dimension_scores) VALUES
  -- Alex Wright — weeks 1-12
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 1,  CURRENT_DATE - INTERVAL '11 weeks',
   '{"collaboration":6.5,"reliability":7.5,"communication":6.5,"overall":6.5}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 2,  CURRENT_DATE - INTERVAL '10 weeks',
   '{"collaboration":7.0,"reliability":7.8,"communication":6.8,"overall":7.0}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 3,  CURRENT_DATE - INTERVAL '9 weeks',
   '{"collaboration":6.8,"reliability":8.0,"communication":7.0,"overall":6.8}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 4,  CURRENT_DATE - INTERVAL '8 weeks',
   '{"collaboration":7.2,"reliability":7.5,"communication":7.2,"overall":7.0}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 5,  CURRENT_DATE - INTERVAL '7 weeks',
   '{"collaboration":7.0,"reliability":8.2,"communication":6.8,"overall":7.0}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 6,  CURRENT_DATE - INTERVAL '6 weeks',
   '{"collaboration":7.3,"reliability":7.8,"communication":7.0,"overall":7.2}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 7,  CURRENT_DATE - INTERVAL '5 weeks',
   '{"collaboration":7.0,"reliability":8.0,"communication":7.2,"overall":7.0}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 8,  CURRENT_DATE - INTERVAL '4 weeks',
   '{"collaboration":7.5,"reliability":8.0,"communication":7.0,"overall":7.2}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 9,  CURRENT_DATE - INTERVAL '3 weeks',
   '{"collaboration":7.8,"reliability":7.8,"communication":6.8,"overall":7.5}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 10, CURRENT_DATE - INTERVAL '2 weeks',
   '{"collaboration":8.0,"reliability":8.2,"communication":7.0,"overall":7.5}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 11, CURRENT_DATE - INTERVAL '1 week',
   '{"collaboration":7.8,"reliability":8.0,"communication":7.2,"overall":7.3}'::jsonb),
  ('pppp0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 12, CURRENT_DATE,
   '{"collaboration":8.0,"reliability":8.0,"communication":7.0,"overall":7.5}'::jsonb),

  -- Jess Kim — weeks 1-12
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 1,  CURRENT_DATE - INTERVAL '11 weeks',
   '{"collaboration":7.0,"reliability":8.0,"communication":7.0,"overall":7.0}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 2,  CURRENT_DATE - INTERVAL '10 weeks',
   '{"collaboration":6.8,"reliability":8.2,"communication":7.2,"overall":7.0}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 3,  CURRENT_DATE - INTERVAL '9 weeks',
   '{"collaboration":7.2,"reliability":7.8,"communication":6.8,"overall":7.2}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 4,  CURRENT_DATE - INTERVAL '8 weeks',
   '{"collaboration":7.0,"reliability":8.0,"communication":7.0,"overall":7.0}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 5,  CURRENT_DATE - INTERVAL '7 weeks',
   '{"collaboration":7.2,"reliability":7.5,"communication":7.2,"overall":7.2}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 6,  CURRENT_DATE - INTERVAL '6 weeks',
   '{"collaboration":6.8,"reliability":8.0,"communication":7.0,"overall":7.0}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 7,  CURRENT_DATE - INTERVAL '5 weeks',
   '{"collaboration":7.5,"reliability":8.2,"communication":6.8,"overall":7.2}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 8,  CURRENT_DATE - INTERVAL '4 weeks',
   '{"collaboration":7.0,"reliability":8.0,"communication":7.2,"overall":7.0}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 9,  CURRENT_DATE - INTERVAL '3 weeks',
   '{"collaboration":7.5,"reliability":8.0,"communication":7.0,"overall":7.5}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 10, CURRENT_DATE - INTERVAL '2 weeks',
   '{"collaboration":8.2,"reliability":7.8,"communication":7.2,"overall":7.8}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 11, CURRENT_DATE - INTERVAL '1 week',
   '{"collaboration":8.0,"reliability":8.0,"communication":7.0,"overall":7.5}'::jsonb),
  ('pppp0002-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 12, CURRENT_DATE,
   '{"collaboration":7.8,"reliability":8.2,"communication":7.2,"overall":7.5}'::jsonb);

-- Work log entries
INSERT INTO work_log_entries (graduate_id, entry_date, title, description, skill_slugs, is_first_exposure) VALUES
  ('gggg0001-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '10 weeks',
   'Team onboarding documentation review',
   'Reviewed and updated onboarding docs for audit team processes.',
   ARRAY['documentation', 'attention-detail'], false),
  ('gggg0001-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '7 weeks',
   'Internal compliance training',
   'Completed AML/CTF and ethics refresher modules.',
   ARRAY['aml-ctf', 'ethics'], false),
  ('gggg0001-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '4 weeks',
   'Meridian audit engagement',
   'First full audit engagement — assisted with planning and working papers for Meridian Corp.',
   ARRAY['audit-planning', 'documentation'], true),
  ('gggg0001-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '3 weeks',
   'Meridian audit fieldwork',
   'Continued fieldwork on Meridian engagement, reviewed financial statements and gathered audit evidence.',
   ARRAY['fin-statements', 'audit-evidence'], false),
  ('gggg0001-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 weeks',
   'Client meeting with Meridian CFO',
   'Attended client meeting to discuss audit progress and preliminary findings.',
   ARRAY['client-comm', 'presentation'], false);
