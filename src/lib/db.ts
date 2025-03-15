import { D1Database } from '@cloudflare/workers-types';

// Database connection
let _db: D1Database;

export const db = {
  /**
   * Execute a SQL query
   */
  async execute(query: string, params: any[] = []): Promise<{ rows: any[] }> {
    // In a real implementation, this would use the D1 database
    // For now, we'll return mock data
    console.log('Executing query:', query, 'with params:', params);
    
    // Mock implementation for development
    if (query.includes('INSERT INTO resumes')) {
      return { rows: [{ id: Math.floor(Math.random() * 1000) }] };
    }
    
    if (query.includes('SELECT * FROM resumes WHERE id =')) {
      return { 
        rows: [{
          id: params[0],
          user_id: 1,
          filename: 'resume.pdf',
          content: JSON.stringify({
            fullName: 'John Doe',
            email: 'john@example.com',
            skills: ['JavaScript', 'React', 'Node.js']
          }),
          raw_text: 'John Doe\njohn@example.com\nSkills: JavaScript, React, Node.js',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      };
    }
    
    if (query.includes('SELECT * FROM resumes WHERE user_id =')) {
      return { 
        rows: [{
          id: 123,
          user_id: params[0],
          filename: 'resume.pdf',
          content: JSON.stringify({
            fullName: 'John Doe',
            email: 'john@example.com',
            skills: ['JavaScript', 'React', 'Node.js']
          }),
          raw_text: 'John Doe\njohn@example.com\nSkills: JavaScript, React, Node.js',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      };
    }
    
    return { rows: [] };
  },
  
  /**
   * Initialize the database connection
   */
  init(d1: D1Database) {
    _db = d1;
  }
};
