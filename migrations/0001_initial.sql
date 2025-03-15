-- Migration number: 0001        2025-03-15T13:55:00.000Z
DROP TABLE IF EXISTS counters;
DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS job_criteria;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS resume_job_scores;

-- User accounts table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  auth_provider TEXT NOT NULL, -- 'google' or 'linkedin'
  auth_id TEXT NOT NULL,       -- ID from the auth provider
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,       -- Parsed resume content
  raw_text TEXT NOT NULL,      -- Original text from resume
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Job search criteria table
CREATE TABLE IF NOT EXISTS job_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,         -- Job title to search for
  locations TEXT NOT NULL,     -- Comma-separated list of locations
  min_salary INTEGER,          -- Minimum salary requirement
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Jobs table (scraped job listings)
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  salary_info TEXT,
  url TEXT NOT NULL,
  source TEXT NOT NULL,        -- Which job site it was scraped from
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Resume to job scoring table
CREATE TABLE IF NOT EXISTS resume_job_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resume_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  score INTEGER NOT NULL,      -- 1-10 score
  feedback TEXT,               -- AI feedback on match
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- System tables for tracking
CREATE TABLE IF NOT EXISTS counters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  path TEXT,
  accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Initial data
INSERT INTO counters (name, value) VALUES 
  ('page_views', 0),
  ('api_calls', 0),
  ('resumes_processed', 0),
  ('jobs_scraped', 0);

-- Indexes
CREATE INDEX idx_access_logs_accessed_at ON access_logs(accessed_at);
CREATE INDEX idx_counters_name ON counters(name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth ON users(auth_provider, auth_id);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_job_criteria_user_id ON job_criteria(user_id);
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_resume_job_scores_resume_id ON resume_job_scores(resume_id);
CREATE INDEX idx_resume_job_scores_job_id ON resume_job_scores(job_id);
