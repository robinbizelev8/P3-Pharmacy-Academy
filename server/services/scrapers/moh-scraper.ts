import { BaseScraper, ScrapedContent, ScraperConfig, DEFAULT_SCRAPER_CONFIG } from './base-scraper';
// import pdfParse from 'pdf-parse';
import axios from 'axios';

export class MOHScraper extends BaseScraper {
  private readonly guidelinesUrls = [
    'https://www.moh.gov.sg/hpp/doctors/guidelines/GuidelineDetails/diabetes-mellitus',
    'https://www.moh.gov.sg/hpp/doctors/guidelines/GuidelineDetails/hypertension',
    'https://www.moh.gov.sg/hpp/doctors/guidelines/GuidelineDetails/antimicrobial-stewardship',
    'https://www.moh.gov.sg/hpp/doctors/guidelines/GuidelineDetails/chronic-kidney-disease',
    'https://www.moh.gov.sg/hpp/doctors/guidelines/GuidelineDetails/cardiac-rehabilitation'
  ];

  constructor() {
    const config: ScraperConfig = {
      ...DEFAULT_SCRAPER_CONFIG,
      name: 'MOH Guidelines',
      baseUrl: 'https://www.moh.gov.sg',
      rateLimit: 3000, // Be respectful to government servers
      maxRetries: 2,
    } as ScraperConfig;

    super(config);
  }

  async scrape(): Promise<ScrapedContent[]> {
    const results: ScrapedContent[] = [];

    for (const url of this.guidelinesUrls) {
      try {
        const allowed = await this.checkRobotsTxt(url);
        if (!allowed) {
          console.log(`[MOH] Skipping ${url} - blocked by robots.txt`);
          continue;
        }

        const html = await this.fetchHtml(url);
        const $ = this.parseHtml(html);
        
        // Extract guideline information
        const content = await this.extractGuidelineContent($, url);
        if (content) {
          results.push(content);
        }
      } catch (error: any) {
        console.error(`[MOH] Failed to scrape ${url}:`, error.message);
      }
    }

    return results;
  }

  private async extractGuidelineContent($: cheerio.CheerioAPI, url: string): Promise<ScrapedContent | null> {
    try {
      // Extract title
      let title = $('h1').first().text().trim() || 
                 $('.page-title').text().trim() || 
                 $('title').text().trim();
      
      if (!title) {
        title = this.extractTitleFromUrl(url);
      }

      // Extract main content
      let content = '';
      const contentSelectors = [
        '.content-area',
        '.main-content', 
        '.article-content',
        '#main-content',
        '.page-content'
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length) {
          content = element.text().trim();
          break;
        }
      }

      // Fallback: get all paragraph content
      if (!content) {
        content = $('p').map((_, el) => $(el).text()).get().join('\n');
      }

      // Check for PDF links and extract PDF content
      const pdfLinks = this.extractPdfLinks($, url);
      if (pdfLinks.length > 0) {
        const pdfContent = await this.extractPdfContent(pdfLinks[0]);
        if (pdfContent) {
          content = content ? `${content}\n\n${pdfContent}` : pdfContent;
        }
      }

      // Clean the content
      content = this.cleanText(content);

      if (!content || content.length < 100) {
        console.warn(`[MOH] Insufficient content for ${url}`);
        return null;
      }

      // Determine therapeutic area and practice area from URL/content
      const { therapeuticArea, practiceArea } = this.categorizeContent(url, content);

      // Generate unique ID
      const id = `moh-${this.generateIdFromUrl(url)}`;

      return {
        id,
        title: this.cleanText(title),
        content,
        url,
        lastUpdated: new Date(),
        sourceType: 'moh',
        category: 'Clinical Guidelines',
        priority: 1, // High priority for MOH guidelines
        therapeuticArea,
        practiceArea,
        metadata: {
          scrapedAt: new Date().toISOString(),
          wordCount: content.split(/\s+/).length,
          hasVideo: $('video').length > 0,
          hasPdf: pdfLinks.length > 0,
          pdfLinks,
        }
      };

    } catch (error: any) {
      console.error(`[MOH] Error extracting content from ${url}:`, error.message);
      return null;
    }
  }

  private extractTitleFromUrl(url: string): string {
    const pathParts = url.split('/').pop() || '';
    return pathParts
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private extractPdfLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const pdfLinks: string[] = [];
    
    $('a[href*=".pdf"]').each((_, element) => {
      let href = $(element).attr('href');
      if (href) {
        // Convert relative URLs to absolute
        if (href.startsWith('/')) {
          href = new URL(href, baseUrl).toString();
        } else if (!href.startsWith('http')) {
          href = new URL(href, baseUrl).toString();
        }
        pdfLinks.push(href);
      }
    });

    return pdfLinks;
  }

  private async extractPdfContent(pdfUrl: string): Promise<string | null> {
    try {
      console.log(`[MOH] Extracting PDF content from: ${pdfUrl}`);
      
      // Temporarily disabled PDF extraction to avoid dependency issues
      // const client = await this.getHttpClient();
      // const response = await client.get(pdfUrl, { 
      //   responseType: 'arraybuffer',
      //   maxContentLength: 50 * 1024 * 1024, // 50MB limit
      // });

      // const pdfBuffer = Buffer.from(response.data);
      // const pdfData = await pdfParse(pdfBuffer);
      
      // return this.cleanText(pdfData.text);
      console.warn(`[MOH] PDF extraction temporarily disabled`);
      return null;
    } catch (error: any) {
      console.warn(`[MOH] Failed to extract PDF content from ${pdfUrl}:`, error.message);
      return null;
    }
  }

  private categorizeContent(url: string, content: string): { therapeuticArea: string; practiceArea: string } {
    const urlLower = url.toLowerCase();
    const contentLower = content.toLowerCase();

    // Determine therapeutic area
    let therapeuticArea = 'general';
    
    if (urlLower.includes('diabetes') || contentLower.includes('diabetes')) {
      therapeuticArea = 'endocrine';
    } else if (urlLower.includes('hypertension') || contentLower.includes('hypertension')) {
      therapeuticArea = 'cardiovascular';
    } else if (urlLower.includes('antimicrobial') || contentLower.includes('antibiotic')) {
      therapeuticArea = 'infectious_diseases';
    } else if (urlLower.includes('kidney') || contentLower.includes('renal')) {
      therapeuticArea = 'renal';
    } else if (urlLower.includes('cardiac') || contentLower.includes('heart')) {
      therapeuticArea = 'cardiovascular';
    } else if (urlLower.includes('respiratory') || contentLower.includes('asthma')) {
      therapeuticArea = 'respiratory';
    } else if (urlLower.includes('gastro') || contentLower.includes('stomach')) {
      therapeuticArea = 'gastrointestinal';
    }

    // Determine practice area (most MOH guidelines apply to both)
    let practiceArea = 'both';
    
    if (contentLower.includes('hospital') && !contentLower.includes('community')) {
      practiceArea = 'hospital_pharmacy';
    } else if (contentLower.includes('community') && !contentLower.includes('hospital')) {
      practiceArea = 'community_pharmacy';
    }

    return { therapeuticArea, practiceArea };
  }

  private generateIdFromUrl(url: string): string {
    // Extract the guideline identifier from URL
    const pathParts = url.split('/');
    const identifier = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
    return identifier.toLowerCase().replace(/[^a-z0-9-]/g, '');
  }
}

// Export singleton instance
export const mohScraper = new MOHScraper();