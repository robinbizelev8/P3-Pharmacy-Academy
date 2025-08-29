import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';
import { db } from '../../db';
import { knowledgeSourceContent } from '@shared/schema';
import { sql } from 'drizzle-orm';

export interface ScrapedContent {
  id: string;
  title: string;
  content: string;
  url: string;
  lastUpdated: Date;
  sourceType: string;
  category: string;
  priority: number;
  therapeuticArea: string;
  practiceArea: string;
  metadata?: Record<string, any>;
}

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  rateLimit: number; // milliseconds between requests
  maxRetries: number;
  timeout: number;
  userAgent: string;
  respectRobotsTxt: boolean;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  private browser?: Browser;
  private lastRequestTime: number = 0;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  /**
   * Abstract method to be implemented by specific scrapers
   */
  abstract scrape(): Promise<ScrapedContent[]>;

  /**
   * Get HTTP client with proper headers and rate limiting
   */
  protected async getHttpClient(): Promise<typeof axios> {
    const client = axios.create({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    // Add request interceptor for rate limiting
    client.interceptors.request.use(async (config) => {
      await this.enforceRateLimit();
      return config;
    });

    return client;
  }

  /**
   * Get Puppeteer browser instance for JavaScript-heavy sites
   */
  protected async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Create a new page with proper settings
   */
  protected async createPage(): Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    await page.setUserAgent(this.config.userAgent);
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Block images and other resources to speed up scraping
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    return page;
  }

  /**
   * Fetch HTML content from URL with error handling
   */
  protected async fetchHtml(url: string): Promise<string> {
    const client = await this.getHttpClient();
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`[${this.config.name}] Fetching: ${url} (attempt ${attempt})`);
        
        const response = await client.get(url);
        return response.data;
      } catch (error: any) {
        console.warn(`[${this.config.name}] Attempt ${attempt} failed for ${url}:`, error.message);
        
        if (attempt === this.config.maxRetries) {
          throw new Error(`Failed to fetch ${url} after ${this.config.maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        await this.delay(1000 * attempt);
      }
    }
    
    throw new Error(`Unexpected error fetching ${url}`);
  }

  /**
   * Parse HTML content with Cheerio
   */
  protected parseHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  /**
   * Enforce rate limiting between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.config.rateLimit) {
      const waitTime = this.config.rateLimit - timeSinceLastRequest;
      await this.delay(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Utility method for delays
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean and normalize text content
   */
  protected cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Generate content hash for change detection
   */
  protected generateContentHash(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Save scraped content to database
   */
  protected async saveContent(content: ScrapedContent[]): Promise<number> {
    let savedCount = 0;

    for (const item of content) {
      try {
        const contentHash = this.generateContentHash(item.content);
        
        await db
          .insert(knowledgeSourceContent)
          .values({
            id: item.id,
            sourceType: item.sourceType,
            title: item.title,
            content: item.content,
            lastUpdated: item.lastUpdated.toISOString(),
            url: item.url,
            category: item.category,
            priority: item.priority,
            therapeuticArea: item.therapeuticArea,
            practiceArea: item.practiceArea,
            metadata: item.metadata,
            contentHash,
          })
          .onConflictDoUpdate({
            target: knowledgeSourceContent.id,
            set: {
              title: sql`EXCLUDED.title`,
              content: sql`EXCLUDED.content`,
              lastUpdated: sql`EXCLUDED.last_updated`,
              category: sql`EXCLUDED.category`,
              priority: sql`EXCLUDED.priority`,
              therapeuticArea: sql`EXCLUDED.therapeutic_area`,
              practiceArea: sql`EXCLUDED.practice_area`,
              metadata: sql`EXCLUDED.metadata`,
              contentHash: sql`EXCLUDED.content_hash`,
            },
          });

        savedCount++;
        console.log(`[${this.config.name}] Saved: ${item.title}`);
      } catch (error: any) {
        console.error(`[${this.config.name}] Failed to save ${item.id}:`, error.message);
      }
    }

    return savedCount;
  }

  /**
   * Check if robots.txt allows scraping the given URL
   */
  protected async checkRobotsTxt(url: string): Promise<boolean> {
    if (!this.config.respectRobotsTxt) {
      return true;
    }

    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const client = await this.getHttpClient();
      const response = await client.get(robotsUrl);
      
      // Simple robots.txt parsing (basic implementation)
      const robotsContent = response.data;
      const userAgentLine = robotsContent
        .split('\n')
        .find((line: string) => line.toLowerCase().includes('user-agent: *'));
      
      if (userAgentLine) {
        const disallowLines = robotsContent
          .split('\n')
          .filter((line: string) => line.toLowerCase().startsWith('disallow:'));
        
        for (const line of disallowLines) {
          const path = line.split(':')[1]?.trim();
          if (path && url.includes(path)) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      // If robots.txt is not accessible, allow scraping
      console.warn(`[${this.config.name}] Could not access robots.txt for ${url}`);
      return true;
    }
  }

  /**
   * Run the scraper with comprehensive error handling
   */
  async run(): Promise<{ success: boolean; count: number; errors: string[] }> {
    const startTime = Date.now();
    const errors: string[] = [];
    let count = 0;

    try {
      console.log(`[${this.config.name}] Starting scrape operation...`);
      
      const content = await this.scrape();
      count = await this.saveContent(content);
      
      const duration = Date.now() - startTime;
      console.log(`[${this.config.name}] Completed successfully in ${duration}ms. Saved ${count} items.`);
      
      return { success: true, count, errors };
    } catch (error: any) {
      const errorMessage = `Scraper failed: ${error.message}`;
      errors.push(errorMessage);
      console.error(`[${this.config.name}] ${errorMessage}`);
      
      return { success: false, count: 0, errors };
    } finally {
      // Clean up browser if used
      if (this.browser) {
        await this.browser.close();
        this.browser = undefined;
      }
    }
  }
}

/**
 * Default configuration for Singapore healthcare scrapers
 */
export const DEFAULT_SCRAPER_CONFIG: Partial<ScraperConfig> = {
  rateLimit: 2000, // 2 seconds between requests
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  respectRobotsTxt: true,
};