import { singaporeHealthcareService } from './singapore-healthcare.js';

/**
 * Knowledge Update Scheduler
 * Manages automated updates for Singapore healthcare knowledge base
 * Implements scheduled sync for HSA, MOH, NDF and other official sources
 */
class KnowledgeUpdateScheduler {
  private updateIntervals: Map<string, NodeJS.Timer> = new Map();
  private isRunning = false;

  constructor() {
    this.setupGracefulShutdown();
  }

  /**
   * Start all scheduled update processes
   */
  async startScheduler(): Promise<void> {
    if (this.isRunning) {
      console.log('Knowledge update scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting Singapore healthcare knowledge update scheduler...');

    // Initial sync on startup
    await this.performInitialSync();

    // Schedule regular updates
    this.scheduleHSAUpdates();
    this.scheduleMOHUpdates();
    this.scheduleNDFUpdates();
    this.scheduleKnowledgeCacheCleanup();

    console.log('Knowledge update scheduler started successfully');
  }

  /**
   * Stop all scheduled updates
   */
  stopScheduler(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping knowledge update scheduler...');
    
    // Clear all intervals
    this.updateIntervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`Stopped ${name} update schedule`);
    });
    
    this.updateIntervals.clear();
    this.isRunning = false;
    
    console.log('Knowledge update scheduler stopped');
  }

  /**
   * Perform initial sync on startup
   */
  private async performInitialSync(): Promise<void> {
    console.log('Performing initial Singapore healthcare knowledge sync...');
    
    try {
      const results = await singaporeHealthcareService.syncAllSources();
      
      const totalProcessed = results.hsa.processed + results.moh.processed + results.ndf.processed;
      const totalErrors = results.hsa.errors.length + results.moh.errors.length + results.ndf.errors.length;
      
      console.log(`Initial sync completed: ${totalProcessed} items processed, ${totalErrors} errors`);
      
      if (totalErrors > 0) {
        console.warn('Initial sync errors:', {
          hsa: results.hsa.errors,
          moh: results.moh.errors,
          ndf: results.ndf.errors
        });
      }
      
    } catch (error) {
      console.error('Initial sync failed:', error);
    }
  }

  /**
   * Schedule daily HSA updates
   */
  private scheduleHSAUpdates(): void {
    // Update HSA alerts daily at 9 AM SGT (1 AM UTC)
    const hsaInterval = this.createDailyInterval('09:00', async () => {
      console.log('Starting scheduled HSA alerts sync...');
      try {
        const result = await singaporeHealthcareService.syncHSAAlerts();
        console.log(`HSA sync completed: ${result.processed} alerts, ${result.errors.length} errors`);
        
        if (result.errors.length > 0) {
          console.warn('HSA sync errors:', result.errors);
        }
      } catch (error) {
        console.error('Scheduled HSA sync failed:', error);
      }
    });
    
    this.updateIntervals.set('HSA_daily', hsaInterval);
    console.log('Scheduled daily HSA updates at 9:00 AM SGT');
  }

  /**
   * Schedule weekly MOH guidelines updates
   */
  private scheduleMOHUpdates(): void {
    // Update MOH guidelines weekly on Monday at 10 AM SGT (2 AM UTC)
    const mohInterval = this.createWeeklyInterval(1, '10:00', async () => {
      console.log('Starting scheduled MOH guidelines sync...');
      try {
        const result = await singaporeHealthcareService.syncMOHGuidelines();
        console.log(`MOH sync completed: ${result.processed} guidelines, ${result.errors.length} errors`);
        
        if (result.errors.length > 0) {
          console.warn('MOH sync errors:', result.errors);
        }
      } catch (error) {
        console.error('Scheduled MOH sync failed:', error);
      }
    });
    
    this.updateIntervals.set('MOH_weekly', mohInterval);
    console.log('Scheduled weekly MOH updates on Monday at 10:00 AM SGT');
  }

  /**
   * Schedule monthly NDF updates
   */
  private scheduleNDFUpdates(): void {
    // Update NDF data monthly on the 1st at 11 AM SGT (3 AM UTC)
    const ndfInterval = this.createMonthlyInterval(1, '11:00', async () => {
      console.log('Starting scheduled NDF sync...');
      try {
        const result = await singaporeHealthcareService.syncNDFData();
        console.log(`NDF sync completed: ${result.processed} drugs, ${result.errors.length} errors`);
        
        if (result.errors.length > 0) {
          console.warn('NDF sync errors:', result.errors);
        }
      } catch (error) {
        console.error('Scheduled NDF sync failed:', error);
      }
    });
    
    this.updateIntervals.set('NDF_monthly', ndfInterval);
    console.log('Scheduled monthly NDF updates on 1st of month at 11:00 AM SGT');
  }

  /**
   * Schedule AI knowledge cache cleanup
   */
  private scheduleKnowledgeCacheCleanup(): void {
    // Clean expired cache entries every 6 hours
    const cleanupInterval = setInterval(async () => {
      console.log('Starting AI knowledge cache cleanup...');
      try {
        await this.cleanupExpiredKnowledgeCache();
        console.log('Knowledge cache cleanup completed');
      } catch (error) {
        console.error('Knowledge cache cleanup failed:', error);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    this.updateIntervals.set('cache_cleanup', cleanupInterval);
    console.log('Scheduled AI knowledge cache cleanup every 6 hours');
  }

  /**
   * Clean up expired knowledge cache entries
   */
  private async cleanupExpiredKnowledgeCache(): Promise<void> {
    // This would connect to the database and remove expired entries
    // For now, we'll just log the action
    console.log('Cleaning up expired AI knowledge cache entries...');
    
    // In production, implement:
    // await db.delete(aiKnowledgeCache).where(lte(aiKnowledgeCache.expiresAt, new Date()));
  }

  /**
   * Create a daily interval for a specific time (Singapore time)
   */
  private createDailyInterval(time: string, callback: () => Promise<void>): NodeJS.Timer {
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleNext = () => {
      const now = new Date();
      const sgTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8 for Singapore
      const nextRun = new Date(sgTime);
      
      nextRun.setHours(hours, minutes, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (nextRun <= sgTime) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      const delay = nextRun.getTime() - sgTime.getTime();
      
      setTimeout(async () => {
        await callback();
        // Reschedule for next day
        const dailyInterval = setInterval(callback, 24 * 60 * 60 * 1000);
        this.updateIntervals.set('daily_recurring', dailyInterval);
      }, delay);
      
      console.log(`Next run scheduled for: ${nextRun.toISOString()} (${delay}ms from now)`);
    };
    
    scheduleNext();
    
    // Return a dummy interval for the Map, the real scheduling is handled above
    return setInterval(() => {}, 24 * 60 * 60 * 1000);
  }

  /**
   * Create a weekly interval for a specific day and time
   */
  private createWeeklyInterval(dayOfWeek: number, time: string, callback: () => Promise<void>): NodeJS.Timer {
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleNext = () => {
      const now = new Date();
      const sgTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const nextRun = new Date(sgTime);
      
      // Set to target day of week
      const currentDay = nextRun.getDay();
      const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
      nextRun.setDate(nextRun.getDate() + daysUntilTarget);
      nextRun.setHours(hours, minutes, 0, 0);
      
      // If it's today but the time has passed, schedule for next week
      if (daysUntilTarget === 0 && nextRun <= sgTime) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      
      const delay = nextRun.getTime() - sgTime.getTime();
      
      setTimeout(async () => {
        await callback();
        // Reschedule for next week
        const weeklyInterval = setInterval(callback, 7 * 24 * 60 * 60 * 1000);
        this.updateIntervals.set('weekly_recurring', weeklyInterval);
      }, delay);
      
      console.log(`Next weekly run scheduled for: ${nextRun.toISOString()}`);
    };
    
    scheduleNext();
    return setInterval(() => {}, 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Create a monthly interval for a specific day and time
   */
  private createMonthlyInterval(dayOfMonth: number, time: string, callback: () => Promise<void>): NodeJS.Timer {
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleNext = () => {
      const now = new Date();
      const sgTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const nextRun = new Date(sgTime);
      
      nextRun.setDate(dayOfMonth);
      nextRun.setHours(hours, minutes, 0, 0);
      
      // If this month's date has passed, schedule for next month
      if (nextRun <= sgTime) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      
      const delay = nextRun.getTime() - sgTime.getTime();
      
      setTimeout(async () => {
        await callback();
        // Schedule next month
        scheduleNext();
      }, delay);
      
      console.log(`Next monthly run scheduled for: ${nextRun.toISOString()}`);
    };
    
    scheduleNext();
    return setInterval(() => {}, 30 * 24 * 60 * 60 * 1000);
  }

  /**
   * Manual trigger for emergency updates
   */
  async triggerEmergencyUpdate(source: 'hsa' | 'moh' | 'ndf' | 'all'): Promise<void> {
    console.log(`Triggering emergency update for: ${source}`);
    
    try {
      switch (source) {
        case 'hsa':
          const hsaResult = await singaporeHealthcareService.syncHSAAlerts();
          console.log(`Emergency HSA update: ${hsaResult.processed} processed, ${hsaResult.errors.length} errors`);
          break;
          
        case 'moh':
          const mohResult = await singaporeHealthcareService.syncMOHGuidelines();
          console.log(`Emergency MOH update: ${mohResult.processed} processed, ${mohResult.errors.length} errors`);
          break;
          
        case 'ndf':
          const ndfResult = await singaporeHealthcareService.syncNDFData();
          console.log(`Emergency NDF update: ${ndfResult.processed} processed, ${ndfResult.errors.length} errors`);
          break;
          
        case 'all':
          const allResults = await singaporeHealthcareService.syncAllSources();
          const total = allResults.hsa.processed + allResults.moh.processed + allResults.ndf.processed;
          console.log(`Emergency full update: ${total} total items processed`);
          break;
      }
    } catch (error) {
      console.error(`Emergency update failed for ${source}:`, error);
      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; scheduledTasks: string[]; uptime?: number } {
    return {
      isRunning: this.isRunning,
      scheduledTasks: Array.from(this.updateIntervals.keys()),
      uptime: this.isRunning ? process.uptime() : undefined
    };
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = () => {
      console.log('Received shutdown signal, stopping knowledge update scheduler...');
      this.stopScheduler();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception in knowledge update scheduler:', error);
      this.stopScheduler();
      process.exit(1);
    });
  }
}

export const knowledgeUpdateScheduler = new KnowledgeUpdateScheduler();