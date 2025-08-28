-- STEP 2: Create engagement_types table
CREATE TABLE IF NOT EXISTS engagement_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_duration_hours INTEGER,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert all engagement types from your list
INSERT INTO engagement_types (name, description, default_duration_hours, sort_order)
VALUES
('Quick Start 4-Hour', 'Quick Start engagement with 4 hour scope', 4, 1),
('Quick Start 10-Hour', 'Quick Start engagement with 10 hour scope', 10, 2),
('Quick Start 15-Hour', 'Quick Start engagement with 15 hour scope', 15, 3),
('Engage (1-19)', 'Standard Engage package for 1-19 users', 40, 4),
('Engage (1-19)+One (1) Add-on', 'Engage 1-19 with one add-on', 50, 5),
('Engage (1-19)+Two (2) Add-ons', 'Engage 1-19 with two add-ons', 60, 6),
('Engage (1-19)+three (3) Add-ons', 'Engage 1-19 with three add-ons', 70, 7),
('Engage (20-49)', 'Standard Engage package for 20-49 users', 80, 8),
('Engage (20-49)+One (1) Add-on Lite', 'Engage 20-49 with one lite add-on', 90, 9),
('Engage (20-49)+One (1) Add-on Starter', 'Engage 20-49 with one starter add-on', 95, 10),
('Engage (20-49)+Two (2) Add-ons Starter', 'Engage 20-49 with two starter add-ons', 105, 11),
('Engage (20-49)+Two (2) Add-ons Premium', 'Engage 20-49 with two premium add-ons', 110, 12),
('Engage (20-49)+Three (3) Add-ons Premium', 'Engage 20-49 with three premium add-ons', 120, 13),
('Engage (20-49)+Three (3) Add-ons Advanced', 'Engage 20-49 with three advanced add-ons', 130, 14),
('EngagePlus (20-49)', 'Enhanced Engage package for 20-49 users', 100, 15),
('Engage (50-99)', 'Standard Engage package for 50-99 users', 160, 16),
('Engage (50-99)+One (1) Add-on', 'Engage 50-99 with one add-on', 180, 17),
('Engage (50-99)+Two (2) Add-ons', 'Engage 50-99 with two add-ons', 200, 18),
('Engage (50-99)+Three (3) Add-ons', 'Engage 50-99 with three add-ons', 220, 19),
('EngagePlus (50-99)', 'Enhanced Engage package for 50-99 users', 200, 20),
('Lite Platform Add-on (1-49)', 'Lite platform add-on for 1-49 users', 20, 21),
('Starter Platform Add-on (49-100)', 'Starter platform add-on for 49-100 users', 30, 22),
('Premium Platform Add-on', 'Premium platform add-on', 40, 23),
('Advanced Platform Add-on', 'Advanced platform add-on', 50, 24),
('Basic Virtual Training (1-25)', 'Basic virtual training for 1-25 users', 16, 25),
('Preferred Virtual Training (1-100)', 'Preferred virtual training for 1-100 users', 32, 26),
('Basic Optimization (1-25)', 'Basic optimization for 1-25 users', 20, 27),
('Preferred Optimization (1-100)', 'Preferred optimization for 1-100 users', 40, 28),
('Managed Services (3 months)', '3-month managed services package', 120, 29),
('Managed Services (6 months)', '6-month managed services package', 240, 30),
('Managed Services (12 months)', '12-month managed services package', 480, 31),
('Expansion (1-19)', 'Expansion services for 1-19 users', 30, 32),
('Expansion (20-49)', 'Expansion services for 20-49 users', 60, 33),
('Expansion (50-99)', 'Expansion services for 50-99 users', 120, 34),
('4 hours of technical support', 'Technical support package - 4 hours', 4, 35),
('10 hours of technical support', 'Technical support package - 10 hours', 10, 36),
('15 hours of technical support', 'Technical support package - 15 hours', 15, 37),
('Basic Optimization', 'Basic optimization services', 20, 38),
('Basic Virtual Training', 'Basic virtual training services', 16, 39),
('Training for one user group/team', 'Focused training for specific team', 8, 40),
('Custom Scope', 'Custom scoped engagement', NULL, 41)
ON CONFLICT DO NOTHING;

-- Verify table creation
SELECT 'Engagement types status:' as info, COUNT(*) as rows FROM engagement_types;
SELECT name FROM engagement_types ORDER BY sort_order LIMIT 10;