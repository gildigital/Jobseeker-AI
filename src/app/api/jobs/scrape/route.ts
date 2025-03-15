import { NextRequest, NextResponse } from 'next/server';
import { JobScraper } from '@/lib/scraper/jobScraper';
import { saveJobs, searchJobs } from '@/lib/scraper/db';

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
    
    // Initialize the scraper
    const scraper = new JobScraper();
    await scraper.initialize();
    
    try {
      // Scrape jobs from multiple sources
      const scrapedJobs = await scraper.scrapeJobs(data.title.trim(), data.locations);
      
      // Save jobs to database
      const jobIds = await saveJobs(scrapedJobs);
      
      // Search for jobs that match the criteria including minimum salary
      const minSalary = data.minSalary || 0;
      const matchingJobs = await searchJobs(data.title.trim(), data.locations, minSalary);
      
      return NextResponse.json({
        success: true,
        jobsScraped: scrapedJobs.length,
        jobsSaved: jobIds.length,
        matchingJobs: matchingJobs.length,
        jobs: matchingJobs
      });
    } finally {
      // Always close the browser
      await scraper.close();
    }
    
  } catch (error: any) {
    console.error('Error scraping jobs:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to scrape jobs' },
      { status: 500 }
    );
  }
}
