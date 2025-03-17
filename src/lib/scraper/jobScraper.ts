/**
 * Web Scraping Module
 * 
 * This module handles scraping job listings from major job sites
 * with detection evasion techniques.
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

// Define the structure for scraped job data
export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string | null;
  url: string;
  source: string;
  postedDate: string | null;
}

/**
 * Generate a random user agent
 */
export function randomUserAgent(): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

/**
 * Job Scraper class with detection evasion techniques
 */
export class JobScraper {
  private browser: Browser | null = null;
  
  /**
   * Initialize the scraper
   */
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ]
    });
  }
  
  /**
   * Close the browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  /**
   * Create a new page with randomized settings to avoid detection
   */
  private async createStealthPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    
    const page = await this.browser.newPage();
    
    // Set random user agent
    await page.setUserAgent(randomUserAgent());
    
    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    
    // Add random mouse movements and delays
    await page.evaluateOnNewDocument(() => {
      // Overwrite navigator properties
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Add language
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Overwrite permissions
      const originalQuery = window.navigator.permissions.query;
      // @ts-ignore
      window.navigator.permissions.query = (parameters: any) => {
        if (parameters.name === 'notifications') {
          return Promise.resolve({ state: Notification.permission });
        }
        return originalQuery(parameters);
      };
    });
    
    return page;
  }
  
  /**
   * Scrape jobs from Indeed
   */
  async scrapeIndeed(title: string, location: string): Promise<ScrapedJob[]> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    
    const jobs: ScrapedJob[] = [];
    const page = await this.createStealthPage();
    
    try {
      // Format the search URL
      const formattedTitle = title.replace(/\s+/g, '+');
      const formattedLocation = location.replace(/\s+/g, '+');
      const url = `https://www.indeed.com/jobs?q=${formattedTitle}&l=${formattedLocation}`;
      
      // Navigate to the search page
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Add random delay to mimic human behavior
      await page.waitForTimeout(Math.random() * 1000 + 1000);
      
      // Extract job listings
      const jobCards = await page.$$('.jobsearch-ResultsList > .result');
      
      for (const card of jobCards) {
        try {
          // Extract job details
          const titleElement = await card.$('.jobTitle');
          const companyElement = await card.$('.companyName');
          const locationElement = await card.$('.companyLocation');
          const salaryElement = await card.$('.salary-snippet');
          const urlElement = await card.$('a.jcs-JobTitle');
          
          if (!titleElement || !companyElement || !locationElement || !urlElement) {
            continue;
          }
          
          const title = await page.evaluate(el => el.textContent?.trim(), titleElement);
          const company = await page.evaluate(el => el.textContent?.trim(), companyElement);
          const location = await page.evaluate(el => el.textContent?.trim(), locationElement);
          const salary = salaryElement 
            ? await page.evaluate(el => el.textContent?.trim(), salaryElement) 
            : null;
          const relativeUrl = await page.evaluate(el => el.getAttribute('href'), urlElement);
          
          // Click on the job to get the description
          await titleElement.click();
          
          // Wait for the job details to load
          await page.waitForSelector('.jobsearch-JobComponent-description', { timeout: 5000 });
          
          // Extract job description
          const descriptionElement = await page.$('.jobsearch-JobComponent-description');
          const description = descriptionElement 
            ? await page.evaluate(el => el.textContent?.trim(), descriptionElement) 
            : '';
          
          // Add the job to the list
          jobs.push({
            title: title || 'Unknown Title',
            company: company || 'Unknown Company',
            location: location || 'Unknown Location',
            description: description || 'No description available',
            salary,
            url: `https://www.indeed.com${relativeUrl}`,
            source: 'Indeed',
            postedDate: null // Indeed doesn't always show post date in the listing
          });
          
          // Add random delay between job extractions
          await page.waitForTimeout(Math.random() * 500 + 500);
        } catch (error) {
          console.error('Error extracting job details:', error);
          continue;
        }
      }
    } catch (error) {
      console.error('Error scraping Indeed:', error);
    } finally {
      await page.close();
    }
    
    return jobs;
  }
  
  /**
   * Scrape jobs from LinkedIn
   */
  async scrapeLinkedIn(title: string, location: string): Promise<ScrapedJob[]> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    
    const jobs: ScrapedJob[] = [];
    const page = await this.createStealthPage();
    
    try {
      // Format the search URL
      const formattedTitle = title.replace(/\s+/g, '%20');
      const formattedLocation = location.replace(/\s+/g, '%20');
      const url = `https://www.linkedin.com/jobs/search/?keywords=${formattedTitle}&location=${formattedLocation}`;
      
      // Navigate to the search page
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Add random delay to mimic human behavior
      await page.waitForTimeout(Math.random() * 1000 + 1000);
      
      // Extract job listings
      const jobCards = await page.$$('.jobs-search__results-list > li');
      
      for (const card of jobCards) {
        try {
          // Extract job details
          const titleElement = await card.$('.base-search-card__title');
          const companyElement = await card.$('.base-search-card__subtitle');
          const locationElement = await card.$('.job-search-card__location');
          const salaryElement = await card.$('.job-search-card__salary-info');
          const urlElement = await card.$('.base-card__full-link');
          
          if (!titleElement || !companyElement || !locationElement || !urlElement) {
            continue;
          }
          
          const title = await page.evaluate(el => el.textContent?.trim(), titleElement);
          const company = await page.evaluate(el => el.textContent?.trim(), companyElement);
          const location = await page.evaluate(el => el.textContent?.trim(), locationElement);
          const salary = salaryElement 
            ? await page.evaluate(el => el.textContent?.trim(), salaryElement) 
            : null;
          const url = await page.evaluate(el => el.getAttribute('href'), urlElement);
          
          // Open job details in a new tab
          const jobPage = await this.browser.newPage();
          await jobPage.setUserAgent(randomUserAgent());
          await jobPage.goto(url || '', { waitUntil: 'networkidle2' });
          
          // Wait for the job details to load
          await jobPage.waitForSelector('.show-more-less-html__markup', { timeout: 5000 });
          
          // Extract job description
          const descriptionElement = await jobPage.$('.show-more-less-html__markup');
          const description = descriptionElement 
            ? await jobPage.evaluate(el => el.textContent?.trim(), descriptionElement) 
            : '';
          
          // Extract posted date
          const dateElement = await jobPage.$('.posted-time-ago__text');
          const postedDate = dateElement 
            ? await jobPage.evaluate(el => el.textContent?.trim(), dateElement) 
            : null;
          
          // Close the job details tab
          await jobPage.close();
          
          // Add the job to the list
          jobs.push({
            title: title || 'Unknown Title',
            company: company || 'Unknown Company',
            location: location || 'Unknown Location',
            description: description || 'No description available',
            salary,
            url: url || '',
            source: 'LinkedIn',
            postedDate
          });
          
          // Add random delay between job extractions
          await page.waitForTimeout(Math.random() * 500 + 500);
        } catch (error) {
          console.error('Error extracting job details:', error);
          continue;
        }
      }
    } catch (error) {
      console.error('Error scraping LinkedIn:', error);
    } finally {
      await page.close();
    }
    
    return jobs;
  }
  
  /**
   * Main method to scrape jobs from multiple sources
   */
  async scrapeJobs(title: string, locations: string[]): Promise<ScrapedJob[]> {
    if (!this.browser) {
      await this.initialize();
    }
    
    const allJobs: ScrapedJob[] = [];
    
    for (const location of locations) {
      // Scrape Indeed
      const indeedJobs = await this.scrapeIndeed(title, location);
      allJobs.push(...indeedJobs);
      
      // Add delay between sources
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      // Scrape LinkedIn
      const linkedInJobs = await this.scrapeLinkedIn(title, location);
      allJobs.push(...linkedInJobs);
      
      // Add delay between locations
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));
    }
    
    return allJobs;
  }
}
