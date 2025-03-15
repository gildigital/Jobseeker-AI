/**
 * AI Scoring System
 * 
 * This module handles the comparison of resumes against job descriptions
 * and provides a score on a 1-10 scale.
 */

import { ParsedResume } from '@/lib/resume/parser';

// Define the structure for AI scoring results
export interface ScoringResult {
  score: number; // 1-10 scale
  feedback: string;
  keyMatches: string[];
  missingKeywords: string[];
  recommendedImprovements: string[];
}

// Define the interface for AI providers
export interface AIProvider {
  name: string;
  scoreResume: (resume: ParsedResume, jobDescription: string) => Promise<ScoringResult>;
}

// OpenAI (GPT-4) provider
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  name = 'OpenAI (GPT-4)';
  
  async scoreResume(resume: ParsedResume, jobDescription: string): Promise<ScoringResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert ATS (Applicant Tracking System) analyzer. 
              Your task is to compare a resume against a job description and provide a score on a scale of 1-10,
              where scores below 6 indicate the resume would likely be discarded or is a bad fit.
              Provide specific feedback on why the score was given, key matching qualifications,
              missing keywords/skills, and recommended improvements.
              Format your response as JSON with the following structure:
              {
                "score": number,
                "feedback": "detailed explanation of the score",
                "keyMatches": ["list of matching qualifications"],
                "missingKeywords": ["list of important missing keywords"],
                "recommendedImprovements": ["specific suggestions to improve the resume"]
              }`
            },
            {
              role: 'user',
              content: `Resume:\n${JSON.stringify(resume, null, 2)}\n\nJob Description:\n${jobDescription}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      try {
        const result = JSON.parse(content);
        return {
          score: result.score,
          feedback: result.feedback,
          keyMatches: result.keyMatches || [],
          missingKeywords: result.missingKeywords || [],
          recommendedImprovements: result.recommendedImprovements || []
        };
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}

// Anthropic (Claude) provider
export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  name = 'Anthropic (Claude)';
  
  async scoreResume(resume: ParsedResume, jobDescription: string): Promise<ScoringResult> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          messages: [
            {
              role: 'user',
              content: `You are an expert ATS (Applicant Tracking System) analyzer. 
              Your task is to compare a resume against a job description and provide a score on a scale of 1-10,
              where scores below 6 indicate the resume would likely be discarded or is a bad fit.
              Provide specific feedback on why the score was given, key matching qualifications,
              missing keywords/skills, and recommended improvements.
              Format your response as JSON with the following structure:
              {
                "score": number,
                "feedback": "detailed explanation of the score",
                "keyMatches": ["list of matching qualifications"],
                "missingKeywords": ["list of important missing keywords"],
                "recommendedImprovements": ["specific suggestions to improve the resume"]
              }
              
              Resume:
              ${JSON.stringify(resume, null, 2)}
              
              Job Description:
              ${jobDescription}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.content[0].text;
      
      // Parse the JSON response
      try {
        const result = JSON.parse(content);
        return {
          score: result.score,
          feedback: result.feedback,
          keyMatches: result.keyMatches || [],
          missingKeywords: result.missingKeywords || [],
          recommendedImprovements: result.recommendedImprovements || []
        };
      } catch (error) {
        console.error('Error parsing Anthropic response:', error);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  }
}

// Google (Gemini) provider
export class GoogleProvider implements AIProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  name = 'Google (Gemini)';
  
  async scoreResume(resume: ParsedResume, jobDescription: string): Promise<ScoringResult> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert ATS (Applicant Tracking System) analyzer. 
                  Your task is to compare a resume against a job description and provide a score on a scale of 1-10,
                  where scores below 6 indicate the resume would likely be discarded or is a bad fit.
                  Provide specific feedback on why the score was given, key matching qualifications,
                  missing keywords/skills, and recommended improvements.
                  Format your response as JSON with the following structure:
                  {
                    "score": number,
                    "feedback": "detailed explanation of the score",
                    "keyMatches": ["list of matching qualifications"],
                    "missingKeywords": ["list of important missing keywords"],
                    "recommendedImprovements": ["specific suggestions to improve the resume"]
                  }
                  
                  Resume:
                  ${JSON.stringify(resume, null, 2)}
                  
                  Job Description:
                  ${jobDescription}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      try {
        const result = JSON.parse(content);
        return {
          score: result.score,
          feedback: result.feedback,
          keyMatches: result.keyMatches || [],
          missingKeywords: result.missingKeywords || [],
          recommendedImprovements: result.recommendedImprovements || []
        };
      } catch (error) {
        console.error('Error parsing Google response:', error);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('Error calling Google API:', error);
      throw error;
    }
  }
}

// Mistral AI provider
export class MistralProvider implements AIProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  name = 'Mistral AI';
  
  async scoreResume(resume: ParsedResume, jobDescription: string): Promise<ScoringResult> {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: `You are an expert ATS (Applicant Tracking System) analyzer.`
            },
            {
              role: 'user',
              content: `Compare this resume against the job description and provide a score on a scale of 1-10,
              where scores below 6 indicate the resume would likely be discarded or is a bad fit.
              Provide specific feedback on why the score was given, key matching qualifications,
              missing keywords/skills, and recommended improvements.
              Format your response as JSON with the following structure:
              {
                "score": number,
                "feedback": "detailed explanation of the score",
                "keyMatches": ["list of matching qualifications"],
                "missingKeywords": ["list of important missing keywords"],
                "recommendedImprovements": ["specific suggestions to improve the resume"]
              }
              
              Resume:
              ${JSON.stringify(resume, null, 2)}
              
              Job Description:
              ${jobDescription}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      try {
        const result = JSON.parse(content);
        return {
          score: result.score,
          feedback: result.feedback,
          keyMatches: result.keyMatches || [],
          missingKeywords: result.missingKeywords || [],
          recommendedImprovements: result.recommendedImprovements || []
        };
      } catch (error) {
        console.error('Error parsing Mistral response:', error);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      throw error;
    }
  }
}

// Factory function to create the appropriate AI provider
export function createAIProvider(provider: string, apiKey: string): AIProvider {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    case 'google':
      return new GoogleProvider(apiKey);
    case 'mistral':
      return new MistralProvider(apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
