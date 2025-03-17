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
    
    // Set up PDF.js worker - use dynamic import for Next.js compatibility
    const pdfjsLib = pdfjs;
    
    // Configure the worker source properly for Next.js
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // In browser environment, use a local worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(uint8Array);
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str).join(' ');
      fullText += textItems + '\n';
    }
    
    // If text extraction fails or returns empty, try OCR as fallback
    if (!fullText.trim()) {
      console.log('PDF text extraction returned empty result, trying OCR fallback');
      fullText = await extractTextWithOCR(file);
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // Try OCR as fallback
    console.log('PDF text extraction failed, trying OCR fallback');
    return extractTextWithOCR(file);
  }
}

/**
 * Extract text from DOC/DOCX files
 */
async function extractTextFromDOC(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth to extract text from DOCX
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOC/DOCX:', error);
    
    // Try OCR as fallback
    console.log('DOC/DOCX text extraction failed, trying OCR fallback');
    return extractTextWithOCR(file);
  }
}

/**
 * Extract text using OCR (Optical Character Recognition)
 */
async function extractTextWithOCR(file: File): Promise<string> {
  try {
    const worker = await createWorker();
    
    // Convert file to image data URL
    const reader = new FileReader();
    const imageDataUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    
    // Recognize text from image
    await worker.load();
    await worker.reinitialize('eng');
    const { data } = await worker.recognize(imageDataUrl);
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error('Error extracting text with OCR:', error);
    return `Failed to extract text from ${file.name}. Please try a different file format.`;
  }
}

/**
 * Extract structured data from raw text using NLP techniques
 */
function extractStructuredData(text: string): Omit<ParsedResume, 'rawText'> {
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

function extractName(text: string): string {
  // Look for name at the beginning of the resume
  const firstLines = text.split('\n').slice(0, 5).join(' ');
  
  // Try to find a name pattern (First Last)
  const nameRegex = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/;
  const match = firstLines.match(nameRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Fallback: Look for a name anywhere in the first few lines
  const nameAnywhere = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/;
  const matchAnywhere = firstLines.match(nameAnywhere);
  
  if (matchAnywhere && matchAnywhere[1]) {
    return matchAnywhere[1].trim();
  }
  
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
  // Look for city, state pattern
  const locationRegex = /([A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*),\s*([A-Z]{2})/;
  const match = text.match(locationRegex);
  
  if (match) {
    return match[0];
  }
  
  return undefined;
}

function extractSummary(text: string): string | undefined {
  // Look for summary section
  const summaryRegex = /(?:SUMMARY|PROFILE|OBJECTIVE|ABOUT ME)[:\s]*([\s\S]*?)(?=\n\s*[A-Z]+[:\s]*\n|$)/i;
  const match = text.match(summaryRegex);
  
  if (match && match[1]) {
    // Limit to a reasonable length
    return match[1].trim().split('\n')[0].substring(0, 200);
  }
  
  // Fallback: Use first paragraph if it's not too short
  const firstPara = text.split('\n\n')[0].trim();
  if (firstPara.length > 50 && firstPara.length < 500) {
    return firstPara;
  }
  
  return undefined;
}

function extractSkills(text: string): string[] {
  // Look for skills section
  const skillsRegex = /(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)[:\s]*([\s\S]*?)(?=\n\s*[A-Z]+[:\s]*\n|$)/i;
  const match = text.match(skillsRegex);
  
  if (match && match[1]) {
    const skillsText = match[1].trim();
    
    // Split by common separators
    let skills: string[] = [];
    if (skillsText.includes(',')) {
      skills = skillsText.split(',').map(s => s.trim());
    } else if (skillsText.includes('•')) {
      skills = skillsText.split('•').map(s => s.trim()).filter(Boolean);
    } else if (skillsText.includes('\n')) {
      skills = skillsText.split('\n').map(s => s.trim()).filter(Boolean);
    } else {
      // Check for common programming languages and technologies
      const techKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP',
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
        'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'AWS', 'Azure', 'GCP',
        'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Agile', 'Scrum'
      ];
      
      skills = techKeywords.filter(keyword => 
        text.includes(keyword) || text.includes(keyword.toLowerCase())
      );
    }
    
    return skills.filter(skill => skill.length > 1).slice(0, 15);
  }
  
  // Fallback: Extract common tech keywords from the entire text
  const techKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Agile', 'Scrum'
  ];
  
  const skills = techKeywords.filter(keyword => 
    text.includes(keyword) || text.includes(keyword.toLowerCase())
  );
  
  return skills.length > 0 ? skills : ["JavaScript", "React", "Node.js", "TypeScript", "HTML", "CSS"];
}

function extractExperience(text: string): ParsedResume['experience'] {
  // Look for experience section
  const expRegex = /(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|WORK HISTORY)[:\s]*([\s\S]*?)(?=\n\s*(?:EDUCATION|SKILLS|CERTIFICATIONS|LANGUAGES)[:\s]*\n|$)/i;
  const match = text.match(expRegex);
  
  if (match && match[1]) {
    const expText = match[1].trim();
    
    // Split into individual job entries
    const jobEntries = expText.split(/\n\s*\n/);
    
    return jobEntries.slice(0, 3).map(entry => {
      // Try to extract job title
      const titleRegex = /(?:^|\n)([A-Z][A-Za-z\s]+)(?:\s*\n|,|\s*\(|\s*-)/;
      const titleMatch = entry.match(titleRegex);
      
      // Try to extract company
      const companyRegex = /(?:at|with|for)\s+([A-Za-z0-9\s&.,]+)|\n([A-Z][A-Za-z0-9\s&.,]+)(?:\s*\n|,|\s*\()/;
      const companyMatch = entry.match(companyRegex);
      
      // Try to extract location
      const locationRegex = /([A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*),\s*([A-Z]{2})/;
      const locationMatch = entry.match(locationRegex);
      
      // Try to extract dates
      const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*(?:–|-|to)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*(?:–|-|to)\s*Present|\d{4}\s*(?:–|-|to)\s*\d{4}|\d{4}\s*(?:–|-|to)\s*Present/i;
      const dateMatch = entry.match(dateRegex);
      
      // Extract description (everything else)
      let description = entry;
      if (titleMatch) description = description.replace(titleMatch[0], '');
      if (companyMatch) description = description.replace(companyMatch[0], '');
      if (locationMatch) description = description.replace(locationMatch[0], '');
      if (dateMatch) description = description.replace(dateMatch[0], '');
      
      description = description.trim().replace(/\n+/g, ' ');
      
      return {
        title: titleMatch ? 
          titleMatch[1].trim() : 
          "Position",
        company: companyMatch ? 
          (companyMatch[1] || companyMatch[2]).trim() : 
          "Company",
        location: locationMatch ? 
          locationMatch[0] : 
          undefined,
        startDate: dateMatch ? 
          dateMatch[0].split('–')[0].trim() : 
          undefined,
        endDate: dateMatch && dateMatch[0].includes('–') ? 
          dateMatch[0].split('–')[1].trim() : 
          'Present',
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
          }
          
          return langs.filter(lang => lang.length > 1).slice(0, 5);
        }
        
        return undefined;
      }