import sharp from 'sharp';
import { fabric } from 'fabric';
import fs from 'fs';
import path from 'path';

export interface ProcessingOptions {
  format: 'png' | 'jpg' | 'gif';
  quality: 'low' | 'medium' | 'high';
  optimizeFor: 'social' | 'print';
  width?: number;
  height?: number;
}

export async function processCanvasExport(
  canvasDataUrl: string,
  options: ProcessingOptions
): Promise<Buffer> {
  try {
    // Remove data URL prefix
    const base64Data = canvasDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    let sharpInstance = sharp(imageBuffer);

    // Set quality based on options
    const qualityMap = {
      low: 60,
      medium: 80,
      high: 95
    };

    // Optimize dimensions for platform
    if (options.optimizeFor === 'social') {
      // Common social media sizes
      const socialSizes = {
        square: { width: 1080, height: 1080 },
        landscape: { width: 1200, height: 630 },
        story: { width: 1080, height: 1920 }
      };
      
      if (options.width && options.height) {
        sharpInstance = sharpInstance.resize(options.width, options.height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        });
      }
    }

    // Process based on format
    switch (options.format) {
      case 'jpg':
        return await sharpInstance
          .jpeg({ quality: qualityMap[options.quality] })
          .toBuffer();
      
      case 'png':
        return await sharpInstance
          .png({ 
            quality: qualityMap[options.quality],
            compressionLevel: options.quality === 'low' ? 9 : 6
          })
          .toBuffer();
      
      case 'gif':
        // For GIF, we'll convert to PNG as sharp doesn't handle animated GIFs well
        return await sharpInstance
          .png({ quality: qualityMap[options.quality] })
          .toBuffer();
      
      default:
        return await sharpInstance.png().toBuffer();
    }
  } catch (error) {
    console.error('Error processing canvas export:', error);
    throw new Error('Failed to process canvas export');
  }
}

export async function optimizeImageForUpload(
  buffer: Buffer,
  originalName: string
): Promise<{ buffer: Buffer; metadata: any }> {
  try {
    const sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();

    // Optimize the image
    let optimizedBuffer = buffer;

    // Resize if too large
    if (metadata.width && metadata.width > 2048) {
      optimizedBuffer = await sharpInstance
        .resize(2048, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    return {
      buffer: optimizedBuffer,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: optimizedBuffer.length
      }
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error('Failed to optimize image');
  }
}

export function generateThumbnail(buffer: Buffer, size: number = 200): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export async function createMemeFromTemplate(
  templateUrl: string,
  textElements: Array<{
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    strokeColor?: string;
    strokeWidth?: number;
  }>
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = new fabric.Canvas(null, {
        width: 500,
        height: 500
      });

      // Load template image
      fabric.Image.fromURL(templateUrl, (img) => {
        if (!img) {
          reject(new Error('Failed to load template image'));
          return;
        }

        img.scaleToWidth(500);
        img.scaleToHeight(500);
        canvas.add(img);

        // Add text elements
        textElements.forEach(textEl => {
          const text = new fabric.Text(textEl.text, {
            left: textEl.x,
            top: textEl.y,
            fontSize: textEl.fontSize,
            fontFamily: textEl.fontFamily,
            fill: textEl.color,
            stroke: textEl.strokeColor || '#000000',
            strokeWidth: textEl.strokeWidth || 2,
            textAlign: 'center',
            originX: 'center',
            originY: 'center'
          });
          canvas.add(text);
        });

        canvas.renderAll();
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      }, { crossOrigin: 'anonymous' });
    } catch (error) {
      reject(error);
    }
  });
}
