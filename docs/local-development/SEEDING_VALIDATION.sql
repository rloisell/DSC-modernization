-- DSC Database Seeding Validation Queries
-- ==================================
-- These queries validate that test data has been successfully seeded into the development database
-- Run these queries after calling: POST /api/admin/seed/test-data

-- 1. SUMMARY COUNTS
-- ================
SELECT 'Activity Codes' as TableName, COUNT(*) as RecordCount FROM ActivityCodes
UNION ALL
SELECT 'Network Numbers', COUNT(*) FROM NetworkNumbers
UNION ALL
SELECT 'Projects', COUNT(*) FROM Projects
UNION ALL
SELECT 'Departments', COUNT(*) FROM Departments
UNION ALL
SELECT 'Roles', COUNT(*) FROM Roles
UNION ALL
SELECT 'Users', COUNT(*) FROM Users;

-- 2. ACTIVITY CODES - All records with details
-- =============================================
SELECT 
    Id,
    Code,
    Description,
    IsActive,
    CreatedAt,
    ModifiedAt
FROM ActivityCodes
ORDER BY Code ASC;

-- 3. NETWORK NUMBERS - All records with details
-- ==============================================
SELECT 
    Id,
    Number,
    Description,
    IsActive,
    CreatedAt,
    ModifiedAt
FROM NetworkNumbers
ORDER BY Number ASC;

-- 4. PROJECTS - All records with details
-- ======================================
SELECT 
    Id,
    ProjectNo,
    Name,
    Description,
    IsActive,
    CreatedAt,
    ModifiedAt
FROM Projects
ORDER BY ProjectNo ASC;

-- 5. DEPARTMENTS - All records with details
-- =========================================
SELECT 
    Id,
    Name,
    ManagerName,
    IsActive,
    CreatedAt,
    ModifiedAt
FROM Departments
ORDER BY Name ASC;

-- 6. ROLES - All records with details
-- ===================================
SELECT 
    Id,
    Name,
    Description,
    IsActive,
    CreatedAt,
    ModifiedAt
FROM Roles
ORDER BY Name ASC;

-- 7. VERIFICATION CHECKS - Expected seeded data present
-- =====================================================

-- Verify expected activity codes exist
SELECT 'Activity Code Verification' as Check, 
       CASE 
           WHEN COUNT(*) = 10 THEN 'PASS: All 10 new activity codes present'
           ELSE CONCAT('FAIL: Expected 10 new codes, found ', COUNT(*))
       END as Result
FROM ActivityCodes 
WHERE Code IN ('DEV', 'TEST', 'DOC', 'ADMIN', 'MEET', 'TRAIN', 'BUG', 'REV', 'ARCH', 'DEPLOY');

-- Verify expected network numbers exist
SELECT 'Network Number Verification' as Check,
       CASE
           WHEN COUNT(*) = 9 THEN 'PASS: All 9 new network numbers present'
           ELSE CONCAT('FAIL: Expected 9 new numbers, found ', COUNT(*))
       END as Result
FROM NetworkNumbers
WHERE Number IN (110, 111, 120, 121, 130, 200, 201, 210, 220);

-- Verify expected projects exist
SELECT 'Project Verification' as Check,
       CASE
           WHEN COUNT(*) = 7 THEN 'PASS: All 7 new projects present'
           ELSE CONCAT('FAIL: Expected 7 new projects, found ', COUNT(*))
       END as Result
FROM Projects
WHERE ProjectNo IN ('P1001', 'P1002', 'P1003', 'P1004', 'P1005', 'P2001', 'P2002');

-- Verify expected departments exist
SELECT 'Department Verification' as Check,
       CASE
           WHEN COUNT(*) = 3 THEN 'PASS: All 3 new departments present'
           ELSE CONCAT('FAIL: Expected 3 new departments, found ', COUNT(*))
       END as Result
FROM Departments
WHERE Name IN ('Engineering', 'Quality Assurance', 'Product Management');
