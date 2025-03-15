import { NextRequest, NextResponse } from 'next/server';
import { saveJobCriteria } from '@/lib/jobs/criteria';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.title.trim()) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }
    
    if (!data.locations || !Array.isArray(data.locations) || data.locations.length === 0) {
      return NextResponse.json(
        { error: 'At least one location is required' },
        { status: 400 }
      );
    }
    
    if (data.minSalary === undefined || isNaN(data.minSalary)) {
      return NextResponse.json(
        { error: 'Valid minimum salary is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, we would get the user ID from the session
    // const userId = getUserIdFromSession(request);
    const userId = 1; // Mock user ID for demonstration
    
    // Save job criteria to database
    const criteriaId = await saveJobCriteria(
      userId,
      data.title.trim(),
      data.locations,
      data.minSalary
    );
    
    return NextResponse.json({
      success: true,
      criteriaId
    });
    
  } catch (error: any) {
    console.error('Error saving job criteria:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to save job search criteria' },
      { status: 500 }
    );
  }
}
