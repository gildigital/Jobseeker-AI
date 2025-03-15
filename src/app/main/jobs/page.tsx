'use client';

import { useState, useEffect } from 'react';
import { JobCriteriaForm, JobCriteria } from '@/components/jobs/JobCriteriaForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Search } from 'lucide-react';
import { formatJobCriteria } from '@/lib/jobs/criteria';

export default function JobsPage() {
  const [savedCriteria, setSavedCriteria] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<JobCriteria | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch saved job criteria on page load
  useEffect(() => {
    const fetchSavedCriteria = async () => {
      try {
        // In a real implementation, we would fetch from the API
        // const response = await fetch('/api/jobs/criteria');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockData = [
          {
            id: 1,
            title: 'Software Engineer',
            locations: 'San Francisco,Remote',
            min_salary: 120000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Product Manager',
            locations: 'New York,Boston',
            min_salary: 100000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setSavedCriteria(mockData.map(formatJobCriteria));
      } catch (error) {
        console.error('Error fetching saved criteria:', error);
      }
    };
    
    fetchSavedCriteria();
  }, []);

  const handleSaveCriteria = async (criteria: JobCriteria) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/jobs/criteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(criteria)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save job criteria');
      }
      
      const data = await response.json();
      
      // Add the new criteria to the list
      const newCriteria = {
        id: data.criteriaId,
        title: criteria.title,
        locations: criteria.locations,
        minSalary: criteria.minSalary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setSavedCriteria([newCriteria, ...savedCriteria]);
      setIsEditing(false);
      setCurrentCriteria(null);
    } catch (error) {
      console.error('Error saving criteria:', error);
      alert('Failed to save job search criteria. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCriteria = (criteria: any) => {
    setCurrentCriteria({
      title: criteria.title,
      locations: criteria.locations,
      minSalary: criteria.minSalary
    });
    setIsEditing(true);
  };

  const handleDeleteCriteria = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job search criteria?')) {
      return;
    }
    
    try {
      // In a real implementation, we would call the API
      // await fetch(`/api/jobs/criteria/${id}`, {
      //   method: 'DELETE'
      // });
      
      // Remove the criteria from the list
      setSavedCriteria(savedCriteria.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting criteria:', error);
      alert('Failed to delete job search criteria. Please try again.');
    }
  };

  const handleSearchJobs = (criteria: any) => {
    // This will be implemented in the web scraping module
    alert(`Searching for ${criteria.title} jobs in ${criteria.locations.join(', ')} with minimum salary $${criteria.minSalary}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Job Search Criteria</h1>
      
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        {isEditing ? (
          <>
            <JobCriteriaForm 
              onSave={handleSaveCriteria} 
            />
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setCurrentCriteria(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button 
            onClick={() => setIsEditing(true)}
            className="mb-4"
          >
            Add New Job Search Criteria
          </Button>
        )}
        
        {savedCriteria.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Saved Search Criteria</h2>
            {savedCriteria.map((criteria) => (
              <Card key={criteria.id} className="p-4 border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{criteria.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {criteria.locations.map((location: string) => (
                        <Badge key={location} variant="secondary" className="px-2 py-1">
                          {location}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Minimum Salary: ${criteria.minSalary.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditCriteria(criteria)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteCriteria(criteria.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleSearchJobs(criteria)}
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-gray-500">
            <p>No saved job search criteria. Add one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
