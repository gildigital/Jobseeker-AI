import { db } from '@/lib/db';
import { ScrapedJob } from './jobScraper';
import { extractSalaryValue } from './utils';

/**
 * Database utility for job operations
 */

export interface JobRecord {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_info: string | null;
  url: string;
  source: string;
  created_at: string;
}

/**
 * Save a scraped job to the database
 */
export async function saveJob(job: ScrapedJob): Promise<number> {
  try {
    const result = await db.execute(
      `INSERT INTO jobs (title, company, location, description, salary_info, url, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       RETURNING id`,
      [job.title, job.company, job.location, job.description, job.salary, job.url, job.source]
    );
    
    // Increment the jobs_scraped counter
    await db.execute(
      `UPDATE counters
       SET value = value + 1
       WHERE name = 'jobs_scraped'`
    );
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error saving job:', error);
    throw new Error('Failed to save job');
  }
}

/**
 * Save multiple scraped jobs to the database
 */
export async function saveJobs(jobs: ScrapedJob[]): Promise<number[]> {
  const jobIds: number[] = [];
  
  for (const job of jobs) {
    try {
      const id = await saveJob(job);
      jobIds.push(id);
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }
  
  return jobIds;
}

/**
 * Get a job by ID
 */
export async function getJobById(jobId: number): Promise<JobRecord | null> {
  try {
    const result = await db.execute(
      `SELECT * FROM jobs WHERE id = ?`,
      [jobId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as JobRecord;
  } catch (error) {
    console.error('Error getting job:', error);
    throw new Error('Failed to get job');
  }
}

/**
 * Search for jobs based on criteria
 */
export async function searchJobs(title: string, locations: string[], minSalary: number): Promise<JobRecord[]> {
  try {
    // Build location conditions
    const locationConditions = locations.map(location => 
      `location LIKE '%${location}%' OR location LIKE '%Remote%'`
    ).join(' OR ');
    
    // Query jobs that match the criteria
    const result = await db.execute(
      `SELECT * FROM jobs 
       WHERE title LIKE ? 
       AND (${locationConditions})
       ORDER BY created_at DESC`,
      [`%${title}%`]
    );
    
    // Filter by salary if specified
    if (minSalary > 0) {
      return result.rows.filter((job: JobRecord) => {
        const salaryValue = extractSalaryValue(job.salary_info);
        return salaryValue === null || salaryValue >= minSalary;
      }) as JobRecord[];
    }
    
    return result.rows as JobRecord[];
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw new Error('Failed to search jobs');
  }
}

/**
 * Delete old jobs (older than 30 days)
 */
export async function deleteOldJobs(): Promise<number> {
  try {
    const result = await db.execute(
      `DELETE FROM jobs 
       WHERE created_at < datetime('now', '-30 day')
       RETURNING id`
    );
    
    return result.rows.length;
  } catch (error) {
    console.error('Error deleting old jobs:', error);
    throw new Error('Failed to delete old jobs');
  }
}
