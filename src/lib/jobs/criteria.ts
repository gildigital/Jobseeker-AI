import { db } from '@/lib/db';

/**
 * Database utility for job criteria operations
 */

export interface JobCriteriaRecord {
  id: number;
  user_id: number;
  title: string;
  locations: string;
  min_salary: number;
  created_at: string;
  updated_at: string;
}

/**
 * Save job search criteria to the database
 */
export async function saveJobCriteria(
  userId: number, 
  title: string, 
  locations: string[], 
  minSalary: number
): Promise<number> {
  try {
    const result = await db.execute(
      `INSERT INTO job_criteria (user_id, title, locations, min_salary, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      [userId, title, locations.join(','), minSalary]
    );
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error saving job criteria:', error);
    throw new Error('Failed to save job search criteria');
  }
}

/**
 * Get job criteria by ID
 */
export async function getJobCriteriaById(criteriaId: number): Promise<JobCriteriaRecord | null> {
  try {
    const result = await db.execute(
      `SELECT * FROM job_criteria WHERE id = ?`,
      [criteriaId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as JobCriteriaRecord;
  } catch (error) {
    console.error('Error getting job criteria:', error);
    throw new Error('Failed to get job search criteria');
  }
}

/**
 * Get all job criteria for a user
 */
export async function getJobCriteriaByUserId(userId: number): Promise<JobCriteriaRecord[]> {
  try {
    const result = await db.execute(
      `SELECT * FROM job_criteria WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId]
    );
    
    return result.rows as JobCriteriaRecord[];
  } catch (error) {
    console.error('Error getting job criteria:', error);
    throw new Error('Failed to get job search criteria');
  }
}

/**
 * Delete job criteria
 */
export async function deleteJobCriteria(criteriaId: number): Promise<void> {
  try {
    await db.execute(
      `DELETE FROM job_criteria WHERE id = ?`,
      [criteriaId]
    );
  } catch (error) {
    console.error('Error deleting job criteria:', error);
    throw new Error('Failed to delete job search criteria');
  }
}

/**
 * Format job criteria for display
 */
export function formatJobCriteria(criteria: JobCriteriaRecord) {
  return {
    id: criteria.id,
    title: criteria.title,
    locations: criteria.locations.split(','),
    minSalary: criteria.min_salary,
    createdAt: criteria.created_at,
    updatedAt: criteria.updated_at
  };
}
