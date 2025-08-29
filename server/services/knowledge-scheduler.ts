import * as cron from 'node-cron';
import { mohScraper } from './scrapers/moh-scraper';
import { db } from '../db';
import { sql } from 'drizzle-orm';

interface ScrapingJob {
  name: string;
  schedule: string;
  scraper: any;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'error';
}

interface ScrapingResult {
  jobName: string;
  success: boolean;
  count: number;
  duration: number;
  errors: string[];
  timestamp: Date;
}

export class KnowledgeScheduler {
  private jobs: Map<string, ScrapingJob> = new Map();
  private results: ScrapingResult[] = [];
  private maxResults = 1000; // Keep last 1000 results

  constructor() {
    this.initializeJobs();
  }

  private initializeJobs(): void {
    // MOH Guidelines - Weekly on Monday at 2 AM (Singapore time)
    this.addJob({
      name: 'moh-guidelines',
      schedule: '0 2 * * 1', // Cron: Every Monday at 2:00 AM
      scraper: mohScraper,
      enabled: true,
      status: 'idle'
    });

    // Add placeholder jobs for future scrapers
    this.addJob({
      name: 'hsa-alerts',
      schedule: '0 1 * * *', // Daily at 1:00 AM
      scraper: null, // Will be implemented later
      enabled: false,
      status: 'idle'
    });

    this.addJob({
      name: 'ndf-medications',
      schedule: '0 3 * * 3', // Weekly on Wednesday at 3:00 AM
      scraper: null, // Will be implemented later
      enabled: false,
      status: 'idle'
    });

    this.addJob({
      name: 'spc-standards',
      schedule: '0 4 1 * *', // Monthly on 1st at 4:00 AM
      scraper: null, // Will be implemented later
      enabled: false,
      status: 'idle'
    });
  }

  private addJob(job: ScrapingJob): void {
    this.jobs.set(job.name, job);
    
    if (job.enabled && job.scraper) {
      this.scheduleJob(job);
    }
  }

  private scheduleJob(job: ScrapingJob): void {
    console.log(`[Scheduler] Scheduling job: ${job.name} with schedule: ${job.schedule}`);
    
    cron.schedule(job.schedule, async () => {
      await this.runJob(job.name);
    }, {
      timezone: "Asia/Singapore"
    });

    // Calculate next run time
    job.nextRun = this.getNextRunTime(job.schedule);
  }

  private getNextRunTime(schedule: string): Date {
    // Simple next run calculation - in production, use a proper cron parser
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default: 24 hours from now
    return nextRun;
  }

  /**
   * Run a specific scraping job
   */
  async runJob(jobName: string): Promise<ScrapingResult> {
    const job = this.jobs.get(jobName);
    
    if (!job) {
      throw new Error(`Job '${jobName}' not found`);
    }

    if (!job.scraper) {
      throw new Error(`Job '${jobName}' has no scraper implementation`);
    }

    if (job.status === 'running') {
      console.warn(`[Scheduler] Job '${jobName}' is already running, skipping...`);
      throw new Error(`Job '${jobName}' is already running`);
    }

    const startTime = Date.now();
    job.status = 'running';
    job.lastRun = new Date();

    try {
      console.log(`[Scheduler] Starting job: ${jobName}`);
      
      const result = await job.scraper.run();
      const duration = Date.now() - startTime;
      
      job.status = 'idle';
      job.nextRun = this.getNextRunTime(job.schedule);
      
      const scrapingResult: ScrapingResult = {
        jobName,
        success: result.success,
        count: result.count,
        duration,
        errors: result.errors,
        timestamp: new Date()
      };

      this.addResult(scrapingResult);
      
      console.log(`[Scheduler] Job '${jobName}' completed in ${duration}ms. Success: ${result.success}, Count: ${result.count}`);
      
      // Update knowledge base statistics
      await this.updateKnowledgeStats();
      
      return scrapingResult;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      job.status = 'error';
      
      const scrapingResult: ScrapingResult = {
        jobName,
        success: false,
        count: 0,
        duration,
        errors: [error.message],
        timestamp: new Date()
      };

      this.addResult(scrapingResult);
      
      console.error(`[Scheduler] Job '${jobName}' failed after ${duration}ms:`, error.message);
      
      throw error;
    }
  }

  private addResult(result: ScrapingResult): void {
    this.results.push(result);
    
    // Keep only the most recent results
    if (this.results.length > this.maxResults) {
      this.results = this.results.slice(-this.maxResults);
    }
  }

  private async updateKnowledgeStats(): Promise<void> {
    try {
      // Update cached statistics for the knowledge status API
      const result = await db.execute(sql`
        SELECT 
          COUNT(*) as total_entries,
          COUNT(DISTINCT source_type) as total_sources,
          MAX(last_updated) as last_update,
          AVG(CASE WHEN priority = 1 THEN 1 ELSE 0 END) as high_priority_ratio
        FROM knowledge_sources 
        WHERE last_updated >= NOW() - INTERVAL '30 days'
      `);

      console.log('[Scheduler] Knowledge base statistics updated:', result);
    } catch (error: any) {
      console.error('[Scheduler] Failed to update knowledge stats:', error.message);
    }
  }

  /**
   * Manually trigger a job
   */
  async triggerJob(jobName: string): Promise<ScrapingResult> {
    console.log(`[Scheduler] Manually triggering job: ${jobName}`);
    return await this.runJob(jobName);
  }

  /**
   * Enable or disable a job
   */
  setJobEnabled(jobName: string, enabled: boolean): void {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job '${jobName}' not found`);
    }

    job.enabled = enabled;
    console.log(`[Scheduler] Job '${jobName}' ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get job status
   */
  getJobStatus(jobName: string): ScrapingJob | null {
    return this.jobs.get(jobName) || null;
  }

  /**
   * Get all jobs status
   */
  getAllJobsStatus(): ScrapingJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get recent results
   */
  getRecentResults(limit: number = 50): ScrapingResult[] {
    return this.results.slice(-limit).reverse();
  }

  /**
   * Get health status of the scheduler
   */
  getHealthStatus(): {
    totalJobs: number;
    enabledJobs: number;
    runningJobs: number;
    errorJobs: number;
    lastResults: ScrapingResult[];
    overallHealth: 'healthy' | 'warning' | 'error';
  } {
    const jobs = Array.from(this.jobs.values());
    const totalJobs = jobs.length;
    const enabledJobs = jobs.filter(j => j.enabled).length;
    const runningJobs = jobs.filter(j => j.status === 'running').length;
    const errorJobs = jobs.filter(j => j.status === 'error').length;
    const lastResults = this.getRecentResults(10);

    let overallHealth: 'healthy' | 'warning' | 'error' = 'healthy';
    
    if (errorJobs > 0) {
      overallHealth = 'error';
    } else if (runningJobs > enabledJobs / 2) {
      overallHealth = 'warning';
    }

    return {
      totalJobs,
      enabledJobs,
      runningJobs,
      errorJobs,
      lastResults,
      overallHealth
    };
  }

  /**
   * Start the scheduler
   */
  start(): void {
    console.log('[Scheduler] Knowledge update scheduler started');
    console.log(`[Scheduler] Registered ${this.jobs.size} jobs`);
    
    this.jobs.forEach((job, name) => {
      if (job.enabled && job.scraper) {
        console.log(`[Scheduler] Job '${name}' scheduled for: ${job.schedule}`);
      } else {
        console.log(`[Scheduler] Job '${name}' disabled or no scraper`);
      }
    });
  }

  /**
   * Stop the scheduler (cleanup if needed)
   */
  stop(): void {
    console.log('[Scheduler] Knowledge update scheduler stopped');
  }
}

// Export singleton instance
export const knowledgeScheduler = new KnowledgeScheduler();