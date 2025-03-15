import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/resume/parser';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No resume file provided' },
        { status: 400 }
      );
    }
    
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file' },
        { status: 400 }
      );
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }
    
    // Parse the resume
    const parsedResume = await parseResume(file);
    
    // In a real implementation, we would save the parsed resume to the database
    // This is a simplified version
    // const userId = getUserIdFromSession(request);
    const userId = 1; // Mock user ID for demonstration
    
    // Store resume in database
    // In a real implementation, we would use the SQL query to insert the resume
    /*
    await sql`
      INSERT INTO resumes (user_id, filename, content, raw_text, created_at, updated_at)
      VALUES (${userId}, ${file.name}, ${JSON.stringify(parsedResume)}, ${parsedResume.rawText}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    */
    
    // Increment the resumes_processed counter
    /*
    await sql`
      UPDATE counters
      SET value = value + 1
      WHERE name = 'resumes_processed'
    `;
    */
    
    return NextResponse.json({
      success: true,
      resumeId: 123, // Mock resume ID
      parsedData: parsedResume
    });
    
  } catch (error: any) {
    console.error('Error processing resume:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to process resume' },
      { status: 500 }
    );
  }
}
