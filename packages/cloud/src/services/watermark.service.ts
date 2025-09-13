import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import { config } from '../config';
import { WatermarkService } from '../types';

export class WatermarkServiceImpl implements WatermarkService {
  constructor(private prisma: PrismaClient) {}

  async createWatermarkJob(articleId: string, userId: string, assetUrl: string): Promise<string> {
    const watermarkText = this.generateWatermarkText(userId);
    
    const job = await this.prisma.watermarkJob.create({
      data: {
        articleId,
        userId,
        assetUrl,
        watermarkText,
        status: 'PENDING',
      },
    });

    // Process job asynchronously
    this.processWatermarkJob(job.id).catch(error => {
      console.error(`Watermark job ${job.id} failed:`, error);
    });

    return job.id;
  }

  async processWatermarkJob(jobId: string): Promise<void> {
    const job = await this.prisma.watermarkJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Watermark job not found');
    }

    try {
      // Update status to processing
      await this.prisma.watermarkJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING' },
      });

      // Process the watermark
      const resultUrl = await this.addWatermark(job.assetUrl, job.watermarkText);

      // Update job with result
      await this.prisma.watermarkJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          resultUrl,
        },
      });
    } catch (error) {
      // Update job with error
      await this.prisma.watermarkJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  async getWatermarkJob(jobId: string): Promise<any> {
    return this.prisma.watermarkJob.findUnique({
      where: { id: jobId },
    });
  }

  private async addWatermark(assetUrl: string, watermarkText: string): Promise<string> {
    if (!config.watermarking.enabled) {
      return assetUrl; // Return original URL if watermarking is disabled
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1200, height: 800 });

      // Navigate to the asset URL
      await page.goto(assetUrl, { waitUntil: 'networkidle0' });

      // Add watermark overlay
      await page.evaluate((text, opacity, position) => {
        const watermark = document.createElement('div');
        watermark.textContent = text;
        watermark.style.position = 'fixed';
        watermark.style.zIndex = '9999';
        watermark.style.color = 'rgba(0, 0, 0, 0.5)';
        watermark.style.fontSize = '14px';
        watermark.style.fontFamily = 'Arial, sans-serif';
        watermark.style.pointerEvents = 'none';
        watermark.style.opacity = opacity.toString();
        watermark.style.userSelect = 'none';

        // Position the watermark
        switch (position) {
          case 'top-left':
            watermark.style.top = '10px';
            watermark.style.left = '10px';
            break;
          case 'top-right':
            watermark.style.top = '10px';
            watermark.style.right = '10px';
            break;
          case 'bottom-left':
            watermark.style.bottom = '10px';
            watermark.style.left = '10px';
            break;
          case 'bottom-right':
            watermark.style.bottom = '10px';
            watermark.style.right = '10px';
            break;
          case 'center':
            watermark.style.top = '50%';
            watermark.style.left = '50%';
            watermark.style.transform = 'translate(-50%, -50%)';
            break;
        }

        document.body.appendChild(watermark);
      }, watermarkText, config.watermarking.opacity, config.watermarking.position);

      // Generate PDF with watermark
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
      });

      // Upload watermarked PDF to S3 (or return as base64 for demo)
      const base64Pdf = pdfBuffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64Pdf}`;

      return dataUrl;
    } finally {
      await browser.close();
    }
  }

  private generateWatermarkText(userId: string): string {
    const timestamp = new Date().toISOString();
    return config.watermarking.textTemplate
      .replace('{userId}', userId)
      .replace('{timestamp}', timestamp);
  }
}
