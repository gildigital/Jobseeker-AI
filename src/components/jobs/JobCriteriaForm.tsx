'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface JobCriteriaFormProps {
  onSave: (criteria: JobCriteria) => void;
}

export interface JobCriteria {
  title: string;
  locations: string[];
  minSalary: number;
}

export default function JobCriteriaForm({ onSave }: JobCriteriaFormProps) {
  const [title, setTitle] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState(50000);
  
  const handleAddLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput('');
    }
  };
  
  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter(loc => loc !== location));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a job title');
      return;
    }
    
    if (locations.length === 0) {
      alert('Please add at least one location');
      return;
    }
    
    onSave({
      title: title.trim(),
      locations,
      minSalary
    });
  };
  
  return (
    <Card className="p-6 border-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="job-title">Job Title</Label>
          <Input
            id="job-title"
            placeholder="e.g. Software Engineer, Product Manager"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Locations</Label>
          <div className="flex space-x-2">
            <Input
              id="location"
              placeholder="e.g. New York, Remote"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLocation();
                }
              }}
            />
            <Button type="button" onClick={handleAddLocation}>Add</Button>
          </div>
          
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {locations.map((location) => (
                <Badge key={location} className="px-2 py-1 flex items-center">
                  {location}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(location)}
                    className="ml-1 text-xs rounded-full hover:bg-red-500 hover:text-white p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="min-salary">Minimum Salary</Label>
            <span className="text-sm font-medium">${minSalary.toLocaleString()}</span>
          </div>
          <Slider
            id="min-salary"
            min={0}
            max={200000}
            step={5000}
            value={[minSalary]}
            onValueChange={(values) => setMinSalary(values[0])}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>$0</span>
            <span>$50k</span>
            <span>$100k</span>
            <span>$150k</span>
            <span>$200k</span>
          </div>
        </div>
        
        <Button type="submit" className="w-full">Save Job Search Criteria</Button>
      </form>
    </Card>
  );
}
