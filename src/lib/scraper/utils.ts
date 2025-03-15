/**
 * Utility functions for web scraping
 */

// List of common user agents for randomization
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36 Edg/91.0.864.53',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.203',
];

/**
 * Get a random user agent from the list
 */
export function randomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Extract salary information from text
 * This function attempts to identify salary information in various formats
 */
export function extractSalaryInfo(text: string): string | null {
  if (!text) return null;
  
  // Common salary patterns
  const patterns = [
    // $X per hour/year
    /\$(\d{1,3}(,\d{3})*(\.\d+)?)\s*(\/|\s+per\s+)(hour|hr|year|yr|annually|annual)/i,
    // $X - $Y per hour/year
    /\$(\d{1,3}(,\d{3})*(\.\d+)?)\s*-\s*\$(\d{1,3}(,\d{3})*(\.\d+)?)\s*(\/|\s+per\s+)(hour|hr|year|yr|annually|annual)/i,
    // $X to $Y per hour/year
    /\$(\d{1,3}(,\d{3})*(\.\d+)?)\s*to\s*\$(\d{1,3}(,\d{3})*(\.\d+)?)\s*(\/|\s+per\s+)(hour|hr|year|yr|annually|annual)/i,
    // $X,000 - $Y,000 per year
    /\$(\d{1,3}(,\d{3})*(\.\d+)?k)\s*-\s*\$(\d{1,3}(,\d{3})*(\.\d+)?k)/i,
    // X,000 - Y,000 per year
    /(\d{1,3}(,\d{3})*(\.\d+)?k)\s*-\s*(\d{1,3}(,\d{3})*(\.\d+)?k)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

/**
 * Normalize job location
 * This function standardizes location formats
 */
export function normalizeLocation(location: string): string {
  if (!location) return 'Unknown Location';
  
  // Remove common prefixes
  let normalized = location.replace(/^location:\s*/i, '');
  
  // Handle remote indicators
  if (/remote/i.test(normalized)) {
    if (/remote in/i.test(normalized)) {
      // e.g., "Remote in US" -> "Remote (US)"
      normalized = normalized.replace(/remote in\s+([^,]+)/i, 'Remote ($1)');
    } else {
      // Just "Remote" or similar
      normalized = 'Remote';
    }
  }
  
  // Handle hybrid indicators
  if (/hybrid/i.test(normalized)) {
    // e.g., "Hybrid in New York, NY" -> "Hybrid (New York, NY)"
    normalized = normalized.replace(/hybrid in\s+([^,]+)/i, 'Hybrid ($1)');
  }
  
  return normalized.trim();
}

/**
 * Clean job description
 * This function removes unwanted elements from job descriptions
 */
export function cleanDescription(description: string): string {
  if (!description) return '';
  
  // Remove excessive whitespace
  let cleaned = description.replace(/\s+/g, ' ');
  
  // Remove common boilerplate text
  const boilerplatePatterns = [
    /about the company:?\s*.*?(?=responsibilities|requirements|qualifications|about the role|job description)/i,
    /equal opportunity employer.*/i,
    /we are an equal opportunity.*/i,
  ];
  
  for (const pattern of boilerplatePatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  return cleaned.trim();
}

/**
 * Estimate annual salary from hourly rate
 */
export function estimateAnnualSalary(hourlyRate: number): number {
  // Assuming 40 hours per week, 52 weeks per year
  return hourlyRate * 40 * 52;
}

/**
 * Extract numeric salary value from salary string
 */
export function extractSalaryValue(salaryString: string | null): number | null {
  if (!salaryString) return null;
  
  // Try to extract a numeric value
  const numericMatches = salaryString.match(/\$?(\d{1,3}(,\d{3})*(\.\d+)?)/g);
  if (!numericMatches || numericMatches.length === 0) return null;
  
  // If there are multiple matches, take the average
  if (numericMatches.length > 1) {
    const values = numericMatches.map(match => 
      parseFloat(match.replace(/[$,]/g, ''))
    );
    
    // Check if it's an hourly rate
    if (/hour|hr/i.test(salaryString)) {
      const avgHourly = values.reduce((sum, val) => sum + val, 0) / values.length;
      return estimateAnnualSalary(avgHourly);
    }
    
    // Otherwise assume it's annual
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  // Single value
  const value = parseFloat(numericMatches[0].replace(/[$,]/g, ''));
  
  // Check if it's an hourly rate
  if (/hour|hr/i.test(salaryString)) {
    return estimateAnnualSalary(value);
  }
  
  // Check if it's in thousands (k)
  if (/k/i.test(salaryString)) {
    return value * 1000;
  }
  
  return value;
}
