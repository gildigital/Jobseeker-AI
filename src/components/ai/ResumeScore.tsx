'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ScoringResult } from '@/lib/ai/scoring';

interface ResumeScoreProps {
  resumeId: number;
  jobId: number;
  jobTitle: string;
  provider: string;
  apiKey: string;
  onClose: () => void;
}

export default function ResumeScore({ resumeId, jobId, jobTitle, provider, apiKey, onClose }: ResumeScoreProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoringResult | null>(null);

  const handleScore = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeId,
          jobId,
          provider,
          apiKey
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to score resume');
      }
      
      const data = await response.json();
      
      setResult({
        score: data.score,
        feedback: data.feedback,
        keyMatches: data.keyMatches || [],
        missingKeywords: data.missingKeywords || [],
        recommendedImprovements: data.recommendedImprovements || []
      });
    } catch (err: any) {
      console.error('Error scoring resume:', err);
      setError(err.message || 'Failed to score resume');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    if (score >= 6) return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    return <XCircle className="h-6 w-6 text-red-500" />;
  };

  return (
    <Card className="p-6 border-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Resume Match Score</h3>
        <Badge variant="outline">{jobTitle}</Badge>
      </div>
      
      {!result && !isLoading && (
        <div className="text-center py-4">
          <p className="mb-4">
            Score your resume against this job description using {provider}.
          </p>
          <Button onClick={handleScore}>
            Generate Score
          </Button>
        </div>
      )}
      
      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Analyzing resume match...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 mb-4">
          <p>{error}</p>
          <Button variant="outline" className="mt-2" onClick={handleScore}>
            Try Again
          </Button>
        </div>
      )}
      
      {result && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getScoreIcon(result.score)}
              <span className="text-3xl font-bold ml-2">{result.score}/10</span>
            </div>
            <Progress value={result.score * 10} className="h-2" />
            <p className="mt-2 text-sm text-gray-500">
              {result.score >= 6 ? 'Good match!' : 'Below threshold - may be discarded'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Feedback</h4>
            <p className="text-gray-700">{result.feedback}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Key Matches</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.keyMatches.map((match, index) => (
                  <li key={index} className="text-green-700">{match}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Missing Keywords</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.missingKeywords.map((keyword, index) => (
                  <li key={index} className="text-red-700">{keyword}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Recommended Improvements</h4>
            <ul className="list-disc pl-5 space-y-1">
              {result.recommendedImprovements.map((improvement, index) => (
                <li key={index} className="text-gray-700">{improvement}</li>
              ))}
            </ul>
          </div>
          
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      )}
    </Card>
  );
}
