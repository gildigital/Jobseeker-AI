'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, Briefcase, Building, MapPin, DollarSign } from 'lucide-react';
import { ScrapedJob } from '@/lib/scraper/jobScraper';

interface JobListProps {
  criteriaId?: number;
  title: string;
  locations: string[];
  minSalary: number;
}

export default function JobList({ criteriaId, title, locations, minSalary }: JobListProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    jobsScraped: number;
    jobsSaved: number;
    matchingJobs: number;
  } | null>(null);

  const handleScrapeJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/jobs/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          locations,
          minSalary
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape jobs');
      }
      
      const data = await response.json();
      
      setJobs(data.jobs || []);
      setStats({
        jobsScraped: data.jobsScraped || 0,
        jobsSaved: data.jobsSaved || 0,
        matchingJobs: data.matchingJobs || 0
      });
    } catch (err: any) {
      console.error('Error scraping jobs:', err);
      setError(err.message || 'Failed to scrape jobs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Job Search Results</h2>
        <Button 
          onClick={handleScrapeJobs}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scraping...
            </>
          ) : (
            'Scrape Jobs'
          )}
        </Button>
      </div>
      
      {error && (
        <Card className="p-4 bg-red-50 border-red-200 text-red-800">
          <p>{error}</p>
        </Card>
      )}
      
      {stats && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Jobs Scraped</p>
              <p className="text-2xl font-bold">{stats.jobsScraped}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jobs Saved</p>
              <p className="text-2xl font-bold">{stats.jobsSaved}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Matching Jobs</p>
              <p className="text-2xl font-bold">{stats.matchingJobs}</p>
            </div>
          </div>
        </Card>
      )}
      
      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-4 border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-primary" />
                    {job.title}
                  </h3>
                  <p className="text-gray-700 flex items-center mt-1">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    {job.company}
                  </p>
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {job.location}
                  </p>
                  {job.salary_info && (
                    <p className="text-gray-600 flex items-center mt-1">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      {job.salary_info}
                    </p>
                  )}
                  <div className="mt-2">
                    <Badge variant="outline" className="mr-2">
                      {job.source}
                    </Badge>
                  </div>
                </div>
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center"
                >
                  View Job
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {job.description.substring(0, 300)}...
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <Card className="p-6 text-center text-gray-500">
            <p>No jobs found. Click "Scrape Jobs" to search for jobs matching your criteria.</p>
          </Card>
        )
      )}
    </div>
  );
}
