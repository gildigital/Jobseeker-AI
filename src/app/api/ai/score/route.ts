import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/scoring';
import { getResumeById } from '@/lib/resume/db';
import { getJobById } from '@/lib/scraper/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }
    
    if (!data.jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    if (!data.provider || !data.apiKey) {
      return NextResponse.json(
        { error: 'AI provider and API key are required' },
        { status: 400 }
      );
    }
    
    // Get resume and job data
    const resume = await getResumeById(data.resumeId);
    const job = await getJobById(data.jobId);
    
    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Parse resume content from JSON string
    const parsedResume = JSON.parse(resume.content);
    
    // Create AI provider
    const aiProvider = createAIProvider(data.provider, data.apiKey);
    
    // Score the resume against the job description
    const scoringResult = await aiProvider.scoreResume(parsedResume, job.description);
    
    // Save the score to the database (in a real implementation)
    // await saveResumeJobScore(data.resumeId, data.jobId, scoringResult);
    
    return NextResponse.json({
      success: true,
      resumeId: data.resumeId,
      jobId: data.jobId,
      score: scoringResult.score,
      feedback: scoringResult.feedback,
      keyMatches: scoringResult.keyMatches,
      missingKeywords: scoringResult.missingKeywords,
      recommendedImprovements: scoringResult.recommendedImprovements
    });
    
  } catch (error: any) {
    console.error('Error scoring resume:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to score resume' },
      { status: 500 }
    );
  }
}
