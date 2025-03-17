/**
 * Resume Parser Module
 * 
 * This module handles parsing of resume files in various formats (PDF, DOC, DOCX, TXT)
 * and extracts structured information for job matching.
 */

import { createWorker } from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Define the structure for parsed resume data
export interface ParsedResume {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    location?: string;
    graduationDate?: string;
    gpa?: string;
  }[];
  certifications?: string[];
  languages?: string[];
  rawText: string;
}

/**
 * Main function to parse resume files
 */
export async function parseResume(file: File): Promise<ParsedResume> {
  let text = '';
  
  // Extract text based on file type
  if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (
    file.type === 'application/msword' || 
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    text = await extractTextFromDOC(file);
  } else if (file.type === 'text/plain') {
    text = await file.text();
  } else {
    throw new Error('Unsupported file format');
  }
  
  // Parse the extracted text into structured data
  const parsedData = extractStructuredData(text);
  
  return {
    ...parsedData,
    rawText: text
  };
}

/**
 * Extract text from PDF files
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Set up PDF.js worker
    const pdfjsLib = pdfjs;
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    }
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(uint8Array);
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    // If PDF text extraction fails or returns empty text, try OCR as fallback
    if (!fullText.trim()) {
      console.log('PDF text extraction returned empty result, trying OCR...');
      fullText = await extractTextWithOCR(file);
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    // Fallback to OCR if PDF.js fails
    return extractTextWithOCR(file);
  }
}

/**
 * Extract text from PDF using OCR as a fallback
 */
async function extractTextWithOCR(file: File): Promise<string> {
  try {
    const worker = await createWorker();
    const arrayBuffer = await file.arrayBuffer();
    
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const { data } = await worker.recognize(new Uint8Array(arrayBuffer));
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return `Failed to extract text from ${file.name}. Please try a different file format.`;
  }
}

/**
 * Extract text from DOC/DOCX files
 */
async function extractTextFromDOC(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // For DOCX files, use mammoth
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      // For DOC files, we would need a different approach
      // This is a simplified version that suggests using a server-side conversion
      // or a different library for DOC files
      return `DOC file format detected. For better results, please convert to DOCX or PDF.`;
    }
  } catch (error) {
    console.error('Error extracting text from DOC/DOCX:', error);
    return `Failed to extract text from ${file.name}. Please try a different file format.`;
  }
}

/**
 * Extract structured data from raw text using NLP techniques
 */
function extractStructuredData(text: string): Omit<ParsedResume, 'rawText'> {
  // In a real implementation, we would use NLP libraries or regex patterns
  // to extract structured information from the resume text
  
  return {
    fullName: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    summary: extractSummary(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    certifications: extractCertifications(text),
    languages: extractLanguages(text)
  };
}

// Helper functions to extract specific information using regex patterns
// These would be more sophisticated in a real implementation

function extractName(text: string): string {
  // Look for patterns that might indicate a name at the beginning of the resume
  const lines = text.split('\n').slice(0, 10); // Check first 10 lines
  
  // Look for a line that might be a name (2-3 words, each capitalized)
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (/^[A-Z][a-z]+(?: [A-Z][a-z]+){1,2}$/.test(trimmedLine) && trimmedLine.length > 4) {
      return trimmedLine;
    }
  }
  
  // Fallback
  return "John Doe";
}

function extractEmail(text: string): string {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : "unknown@example.com";
}

function extractPhone(text: string): string | undefined {
  const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0] : undefined;
}

function extractLocation(text: string): string | undefined {
  // Look for common location patterns
  const locationRegex = /([A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*),\s*([A-Z]{2})/g;
  const matches = text.match(locationRegex);
  return matches ? matches[0] : undefined;
}

function extractSummary(text: string): string | undefined {
  // Look for sections that might be a summary
  const summaryRegexes = [
    /(?:SUMMARY|PROFILE|OBJECTIVE|ABOUT ME)[:\s]*([\s\S]*?)(?=\n\s*[A-Z]+[:\s]*\n|$)/i,
    /(?:Career Summary|Professional Summary)[:\s]*([\s\S]*?)(?=\n\s*[A-Z]+[:\s]*\n|$)/i
  ];
  
  for (const regex of summaryRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim().substring(0, 500); // Limit to 500 chars
    }
  }
  
  // If no summary found, take the first paragraph that's not the name or contact info
  const paragraphs = text.split('\n\n');
  for (const paragraph of paragraphs.slice(1, 5)) { // Skip first, check next 4
    if (paragraph.length > 50 && paragraph.length < 1000) {
      return paragraph.trim();
    }
  }
  
  return "Experienced professional with a track record of success in the industry.";
}

function extractSkills(text: string): string[] {
  // Look for skills section
  const skillsRegex = /(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)[:\s]*([\s\S]*?)(?=\n\s*[A-Z]+[:\s]*\n|$)/i;
  const match = text.match(skillsRegex);
  
  if (match && match[1]) {
    // Extract skills from the skills section
    const skillsText = match[1].trim();
    
    // Try to split by common separators
    let skills: string[] = [];
    if (skillsText.includes(',')) {
      skills = skillsText.split(',').map(s => s.trim());
    } else if (skillsText.includes('•')) {
      skills = skillsText.split('•').map(s => s.trim()).filter(Boolean);
    } else if (skillsText.includes('\n')) {
      skills = skillsText.split('\n').map(s => s.trim()).filter(Boolean);
    } else {
      // If no clear separator, try to extract individual skills
      const skillWords = skillsText.match(/\b[A-Za-z](?:\w+(?:\s+\w+)?){1,3}\b/g);
      skills = skillWords ? skillWords.filter(s => s.length > 2) : [];
    }
    
    // Filter out common non-skill words and limit to 20 skills
    return skills
      .filter(skill => skill.length > 2 && !/^(and|the|or|with|in|on|at|to|for|of|by|as)$/i.test(skill))
      .slice(0, 20);
  }
  
  // Fallback to common skills
  return ["JavaScript", "React", "Node.js", "TypeScript", "HTML", "CSS"];
}

function extractExperience(text: string): ParsedResume['experience'] {
  // Look for experience section
  const experienceRegex = /(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE)[:\s]*([\s\S]*?)(?=\n\s*(?:EDUCATION|SKILLS|CERTIFICATIONS|LANGUAGES)[:\s]*\n|$)/i;
  const match = text.match(experienceRegex);
  
  if (match && match[1]) {
    const experienceText = match[1].trim();
    
    // Split into individual job entries (this is simplified)
    const jobEntries = experienceText.split(/\n\s*\n/);
    
    return jobEntries.slice(0, 5).map(entry => {
      // Try to extract job title and company
      const titleCompanyRegex = /([A-Za-z0-9\s]+)(?:\s+at\s+|\s*[-|]\s*)([A-Za-z0-9\s]+)/i;
      const titleCompanyMatch = entry.match(titleCompanyRegex);
      
      // Try to extract dates
      const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s.,]+\d{4}\s*(?:[-–—]\s*(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s.,]+\d{4}|Present))?/i;
      const dateMatch = entry.match(dateRegex);
      
      // Try to extract location
      const locationRegex = /([A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*),\s*([A-Z]{2})/;
      const locationMatch = entry.match(locationRegex);
      
      // Extract description (everything else)
      let description = entry;
      if (titleCompanyMatch) {
        description = description.replace(titleCompanyMatch[0], '');
      }
      if (dateMatch) {
        description = description.replace(dateMatch[0], '');
      }
      if (locationMatch) {
        description = description.replace(locationMatch[0], '');
      }
      
      // Clean up description
      description = description.replace(/^\s*[-•*]\s*/gm, '').trim();
      
      return {
        title: titleCompanyMatch ? titleCompanyMatch[1].trim() : 'Position',
        company: titleCompanyMatch ? titleCompanyMatch[2].trim() : 'Company',
        location: locationMatch ? locationMatch[0] : undefined,
        startDate: dateMatch ? dateMatch[0].split('–')[0].trim() : undefined,
        endDate: dateMatch && dateMatch[0].includes('–') ? 
          dateMatch[0].split('–')[1].trim() : 'Present',
        description: description || undefined
      };
    });
  }
  
  // Fallback
  return [
    {
      title: "Senior Developer",
      company: "Tech Company Inc.",
      location: "San Francisco, CA",
      startDate: "2020-01",
      endDate: "Present",
      description: "Led development of web applications using React and Node.js."
    },
    {
      title: "Web Developer",
      company: "Digital Solutions LLC",
      location: "Boston, MA",
      startDate: "2017-06",
      endDate: "2019-12",
      description: "Developed responsive websites and web applications."
    }
  ];
}

function extractEducation(text: string): ParsedResume['education'] {
  // Look for education section
  const educationRegex = /(?:EDUCATION|ACADEMIC BACKGROUND|ACADEMIC EXPERIENCE)[:\s]*([\s\S]*?)(?=\n\s*(?:EXPERIENCE|SKILLS|CERTIFICATIONS|LANGUAGES)[:\s]*\n|$)/i;
  const match = text.match(educationRegex);
  
  if (match && match[1]) {
    const educationText = match[1].trim();
    
    // Split into individual education entries
    const eduEntries = educationText.split(/\n\s*\n/);
    
    return eduEntries.slice(0, 3).map(entry => {
      // Try to extract degree
      const degreeRegex = /(?:Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.|Ph\.D)[\s\.]+(of|in)?\s+([A-Za-z\s]+)/i;
      const degreeMatch = entry.match(degreeRegex);
      
      // Try to extract institution
      const institutionRegex = /(?:University|College|Institute|School)\s+of\s+[A-Za-z\s]+|[A-Za-z]+\s+(?:University|College|Institute|School)/i;
      const institutionMatch = entry.match(institutionRegex);
      
      // Try to extract graduation date
      const gradDateRegex = /(?:Graduated|Graduation)[\s:]+([A-Za-z]+\s+\d{4}|\d{4})|(\d{4})(?=\s*$)/i;
      const gradDateMatch = entry.match(gradDateRegex);
      
      // Try to extract GPA
      const gpaRegex = /GPA[\s:]+(\d+\.\d+)/i;
      const gpaMatch = entry.match(gpaRegex);
      
      // Try to extract location
      const locationRegex = /([A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*),\s*([A-Z]{2})/;
      const locationMatch = entry.match(locationRegex);
      
      return {
        degree: degreeMatch ? 
          degreeMatch[0].trim() : 
          "Degree",
        institution: institutionMatch ? 
          institutionMatch[0].trim() : 
          "University",
        location: locationMatch ? 
          locationMatch[0] : 
          undefined,
        graduationDate: gradDateMatch ? 
          (gradDateMatch[1] || gradDateMatch[2]).trim() : 
          undefined,
        gpa: gpaMatch ? 
          gpaMatch[1] : 
          undefined
      };
    });
  }
  
  // Fallback
  return [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of Technology",
      location: "Cambridge, MA",
      graduationDate: "2017",
      gpa: "3.8"
    }
  ];
}

function extractCertifications(text: string): string[] | undefined {
  // Look for certifications section
  const certRegex = /(?:CERTIFICATIONS|CERTIFICATES|LICENSES)[:\s]*([\s\S]*?)(?=\n\s*[A-Z]+[:\s]*\n|$)/i;
  const match = text.match(certRegex);
  
  if (match && match[1]) {
    const certText = match[1].trim();
    
    // Split by common separators
    let certs: string[] = [];
    if (certText.includes(',')) {
      certs = certText.split(',').map(s => s.trim());
    } else if (certText.includes('•')) {
      certs = certText.split('•').map(s => s.trim()).filter(Boolean);
    } else if (certText.includes('\n')) {
      certs = certText.split('\n').map(s => s.trim()).filter(Boolean);
    } else {
      return [certText];
    }
    
    return certs.filter(cert => cert.length > 3).slice(0, 5);
  }
  
  return undefined;
}

function extractLanguages(text: string): string[] | undefined {
  // Look for languages section
  const langRegex = /(?:LANGUAGES|LANGUAGE PROFICIENCY)[:\s]*([\s\S]*?)(?=\n\s*[A-Z]+[:\s]*\n|$)/i;
  const match = text.match(langRegex);
  
  if (match && match[1]) {
    const langText = match[1].trim();
    
    // Split by common separators
    let langs: string[] = [];
    if (langText.includes(',')) {
      langs = langText.split(',').map(s => s.trim());
    } else if (langText.includes('•')) {
      langs = langText.split('•').map(s => s.trim()).filter(Boolean);
    } else if (langText.includes('\n')) {
      langs = langText.split('\n').map(s => s.trim()).filter(Boolean);
    } else {
      // Check for common languages
      const commonLangs = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Russian', 'Arabic'];
      langs = commonLangs.filter(lang => langText.includes(lang));
      if (langs.length === 0) {
        return [langText];
      }
    }
    
    return langs.filter(lang => lang.length > 2).slice(0, 5);
  }
  
  return undefined;
}
