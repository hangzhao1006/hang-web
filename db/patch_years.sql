-- db/patch_years.sql

-- 把 0/空串 统一置为 NULL
UPDATE projects
SET year = NULL
WHERE year = 0 OR TRIM(CAST(year AS TEXT)) = '';

-- 用 created_at 的年份回填
UPDATE projects
SET year = CAST(substr(created_at, 1, 4) AS INTEGER)
WHERE year IS NULL
  AND created_at GLOB '____-__-__ __:__:__';
