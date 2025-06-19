import * as fabric from 'fabric';

export interface TextOptions {
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontWeight?: string | number;
  textAlign?: string;
}

export interface ImageOptions {
  src: string;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
}

export class CanvasManager {
  private canvas: fabric.Canvas;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  addText(options: TextOptions): fabric.Text {
    const textObject = new fabric.Text(options.text, {
      left: options.x || 100,
      top: options.y || 100,
      fontSize: options.fontSize || 24,
      fontFamily: options.fontFamily || 'Inter',
      fill: options.fill || '#ffffff',
      stroke: options.stroke || '#000000',
      strokeWidth: options.strokeWidth || 2,
      fontWeight: options.fontWeight || 'bold',
      textAlign: options.textAlign || 'center',
      originX: 'center',
      originY: 'center',
    });

    this.canvas.add(textObject);
    this.canvas.setActiveObject(textObject);
    this.canvas.renderAll();
    
    return textObject;
  }

  addImage(options: ImageOptions): Promise<fabric.Image> {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(
        options.src,
        (img) => {
          if (!img) {
            reject(new Error('Failed to load image'));
            return;
          }

          img.set({
            left: options.x || 100,
            top: options.y || 100,
            scaleX: options.scaleX || 1,
            scaleY: options.scaleY || 1,
            angle: options.angle || 0,
            opacity: options.opacity || 1,
            originX: 'center',
            originY: 'center',
          });

          this.canvas.add(img);
          this.canvas.renderAll();
          resolve(img);
        },
        { crossOrigin: 'anonymous' }
      );
    });
  }

  addMemeTemplate(templateUrl: string, textAreas: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(
        templateUrl,
        (img) => {
          if (!img) {
            reject(new Error('Failed to load template'));
            return;
          }

          // Scale image to fit canvas
          const canvasWidth = this.canvas.getWidth();
          const canvasHeight = this.canvas.getHeight();
          
          const scale = Math.min(
            canvasWidth / (img.width || 1),
            canvasHeight / (img.height || 1)
          );

          img.set({
            scaleX: scale,
            scaleY: scale,
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: 'center',
            originY: 'center',
            selectable: false, // Template background shouldn't be selectable
          });

          this.canvas.add(img);
          this.canvas.sendToBack(img);

          // Add text areas if provided
          textAreas.forEach((area, index) => {
            const text = new fabric.Text(`Text ${index + 1}`, {
              left: area.x,
              top: area.y,
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: 'bold',
              fill: '#ffffff',
              stroke: '#000000',
              strokeWidth: 2,
              originX: 'center',
              originY: 'center',
            });
            this.canvas.add(text);
          });

          this.canvas.renderAll();
          resolve();
        },
        { crossOrigin: 'anonymous' }
      );
    });
  }

  exportCanvas(format: string = 'png', quality: number = 1): string {
    return this.canvas.toDataURL({
      format,
      quality,
      multiplier: quality === 1 ? 2 : 1, // Higher resolution for better quality
    });
  }

  clearCanvas(): void {
    this.canvas.clear();
    this.canvas.backgroundColor = '#f3f4f6';
    this.canvas.renderAll();
  }

  getCanvasObjects(): fabric.Object[] {
    return this.canvas.getObjects();
  }

  removeObject(object: fabric.Object): void {
    this.canvas.remove(object);
    this.canvas.renderAll();
  }

  duplicateObject(object: fabric.Object): void {
    object.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
      });
      this.canvas.add(cloned);
      this.canvas.setActiveObject(cloned);
      this.canvas.renderAll();
    });
  }

  setCanvasSize(width: number, height: number): void {
    this.canvas.setDimensions({ width, height });
    this.canvas.renderAll();
  }

  centerObject(object: fabric.Object): void {
    const canvasCenter = this.canvas.getCenter();
    object.set({
      left: canvasCenter.left,
      top: canvasCenter.top,
    });
    this.canvas.renderAll();
  }

  alignObjects(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length < 2) return;

    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();

    activeObjects.forEach(obj => {
      switch (alignment) {
        case 'left':
          obj.set({ left: 0 });
          break;
        case 'center':
          obj.set({ left: canvasWidth / 2 });
          break;
        case 'right':
          obj.set({ left: canvasWidth });
          break;
        case 'top':
          obj.set({ top: 0 });
          break;
        case 'middle':
          obj.set({ top: canvasHeight / 2 });
          break;
        case 'bottom':
          obj.set({ top: canvasHeight });
          break;
      }
    });

    this.canvas.renderAll();
  }
}

export function createMemeText(
  text: string,
  position: 'top' | 'bottom' | 'center' = 'top',
  canvasHeight: number = 500
): fabric.Text {
  const positions = {
    top: 50,
    center: canvasHeight / 2,
    bottom: canvasHeight - 50,
  };

  return new fabric.Text(text, {
    left: 250,
    top: positions[position],
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    textAlign: 'center',
    originX: 'center',
    originY: 'center',
  });
}

export function applyMemeTextStyle(textObject: fabric.Text): void {
  textObject.set({
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    textAlign: 'center',
  });
}

export function optimizeCanvasForExport(
  canvas: fabric.Canvas,
  targetWidth: number = 1080,
  targetHeight: number = 1080
): void {
  const currentWidth = canvas.getWidth();
  const currentHeight = canvas.getHeight();
  
  const scaleX = targetWidth / currentWidth;
  const scaleY = targetHeight / currentHeight;
  const scale = Math.min(scaleX, scaleY);

  // Scale all objects
  canvas.getObjects().forEach(obj => {
    obj.scaleX = (obj.scaleX || 1) * scale;
    obj.scaleY = (obj.scaleY || 1) * scale;
    obj.left = (obj.left || 0) * scale;
    obj.top = (obj.top || 0) * scale;
  });

  canvas.setDimensions({ width: targetWidth, height: targetHeight });
  canvas.renderAll();
}
