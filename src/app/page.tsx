'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './8bit.css';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();
  const [isAnimated, setIsAnimated] = useState(false);
  
  useEffect(() => {
    // Start animation after component mounts
    setIsAnimated(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="pixel-hero py-20">
        <div className="container mx-auto px-4">
          <h1 
            className={`text-4xl md:text-5xl font-bold mb-6 pixel-text ${isAnimated ? 'pixel-pulse' : ''}`}
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            AI for the Job Seeker
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '14px', lineHeight: '1.8' }}>
            Level up your job search with AI-powered resume scanning and job matching
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button 
              onClick={() => router.push('/main/resume')}
              className="pixel-btn"
            >
              Upload Resume
            </Button>
            <Button 
              onClick={() => router.push('/main/jobs')}
              className="pixel-btn pixel-btn-secondary"
            >
              Find Jobs
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center pixel-text">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="pixel-card text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-[url('/icons/resume.png')] bg-contain bg-no-repeat bg-center"></div>
              </div>
              <h3 className="text-xl font-bold mb-2 pixel-text">Upload Resume</h3>
              <p>Scan your resume and extract key skills and experience</p>
            </div>
            
            {/* Feature 2 */}
            <div className="pixel-card text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-[url('/icons/search.png')] bg-contain bg-no-repeat bg-center"></div>
              </div>
              <h3 className="text-xl font-bold mb-2 pixel-text">Find Jobs</h3>
              <p>Our AI scrapes job sites to find positions matching your criteria</p>
            </div>
            
            {/* Feature 3 */}
            <div className="pixel-card text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-[url('/icons/score.png')] bg-contain bg-no-repeat bg-center"></div>
              </div>
              <h3 className="text-xl font-bold mb-2 pixel-text">Get Scored</h3>
              <p>See how your resume scores against each job on a scale of 1-10</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 pixel-text">Ready to Level Up Your Job Search?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who are using AI to get an edge in their job search
          </p>
          <Button 
            onClick={() => router.push('/auth/login')}
            className="pixel-btn pixel-btn-accent"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
