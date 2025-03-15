import { db } from '@/lib/db';

/**
 * Database utility for resume operations
 */

export interface ResumeRecord {
  id: number;
  user_id: number;
  filename: string;
  content: string; // JSON stringified parsed resume
  raw_text: string;
  created_at: string;
  updated_at: string;
}

/**
 * Save a parsed resume to the database
 */
export async function saveResume(
  userId: number, 
  filename: string, 
  parsedContent: any, 
  rawText: string
): Promise<number> {
  try {
    const result = await db.execute(
      `INSERT INTO resumes (user_id, filename, content, raw_text, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      [userId, filename, JSON.stringify(parsedContent), rawText]
    );
    
    // Increment the resumes_processed counter
    await db.execute(
      `UPDATE counters
       SET value = value + 1
       WHERE name = 'resumes_processed'`
    );
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error saving resume:', error);
    throw new Error('Failed to save resume');
  }
}

/**
 * Get a resume by ID
 */
export async function getResumeById(resumeId: number): Promise<ResumeRecord | null> {
  try {
    const result = await db.execute(
      `SELECT * FROM resumes WHERE id = ?`,
      [resumeId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as ResumeRecord;
  } catch (error) {
    console.error('Error getting resume:', error);
    throw new Error('Failed to get resume');
  }
}

/**
 * Get all resumes for a user
 */
export async function getResumesByUserId(userId: number): Promise<ResumeRecord[]> {
  try {
    const result = await db.execute(
      `SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId]
    );
    
    return result.rows as ResumeRecord[];
  } catch (error) {
    console.error('Error getting resumes:', error);
    throw new Error('Failed to get resumes');
  }
}

/**
 * Delete a resume
 */
export async function deleteResume(resumeId: number): Promise<void> {
  try {
    await db.execute(
      `DELETE FROM resumes WHERE id = ?`,
      [resumeId]
    );
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw new Error('Failed to delete resume');
  }
}
