import { fabric } from 'fabric';

export interface HistoryEntry {
  state: string;
  timestamp: number;
}

export interface MemeTextStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: string | number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  textAlign: string;
  shadow?: fabric.Shadow;
}

export interface ObjectBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export class FabricHelpers {
  private canvas: fabric.Canvas;
  private history: HistoryEntry[] = [];
  private historyStep: number = -1;
  private maxHistorySize: number = 50;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:added', () => this.saveState());
    this.canvas.on('object:removed', () => this.saveState());
    this.canvas.on('object:modified', () => this.saveState());
  }

  // History Management
  saveState(): void {
    const state = JSON.stringify(this.canvas.toJSON());
    const entry: HistoryEntry = {
      state,
      timestamp: Date.now()
    };

    // Remove any future history if we're not at the end
    if (this.historyStep < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyStep + 1);
    }

    this.history.push(entry);
    this.historyStep = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
      this.historyStep = this.history.length - 1;
    }
  }

  undo(): boolean {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.loadState(this.history[this.historyStep].state);
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.loadState(this.history[this.historyStep].state);
      return true;
    }
    return false;
  }

  canUndo(): boolean {
    return this.historyStep > 0;
  }

  canRedo(): boolean {
    return this.historyStep < this.history.length - 1;
  }

  private loadState(state: string): void {
    this.canvas.loadFromJSON(state, () => {
      this.canvas.renderAll();
    });
  }

  // Text Utilities
  createMemeText(
    text: string,
    position: 'top' | 'center' | 'bottom' = 'top',
    style: Partial<MemeTextStyle> = {}
  ): fabric.Text {
    const canvasHeight = this.canvas.getHeight();
    const canvasWidth = this.canvas.getWidth();
    
    const positions = {
      top: canvasHeight * 0.1,
      center: canvasHeight * 0.5,
      bottom: canvasHeight * 0.9
    };

    const defaultStyle: MemeTextStyle = {
      fontSize: 32,
      fontFamily: 'Inter',
      fontWeight: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      textAlign: 'center'
    };

    const finalStyle = { ...defaultStyle, ...style };

    const textObject = new fabric.Text(text, {
      left: canvasWidth / 2,
      top: positions[position],
      originX: 'center',
      originY: 'center',
      ...finalStyle
    });

    this.canvas.add(textObject);
    this.canvas.setActiveObject(textObject);
    return textObject;
  }

  applyMemeTextShadow(textObject: fabric.Text, shadowStyle: Partial<fabric.Shadow> = {}): void {
    const defaultShadow = {
      color: 'rgba(0,0,0,0.8)',
      blur: 3,
      offsetX: 2,
      offsetY: 2
    };

    const shadow = new fabric.Shadow({ ...defaultShadow, ...shadowStyle });
    textObject.set('shadow', shadow);
    this.canvas.renderAll();
  }

  // Object Manipulation
  duplicateActiveObject(): fabric.Object | null {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return null;

    let clonedObject: fabric.Object | null = null;
    
    activeObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
        evented: true,
      });
      
      if (cloned instanceof fabric.ActiveSelection) {
        // Handle group selection
        cloned.canvas = this.canvas;
        cloned.forEachObject((obj: fabric.Object) => {
          this.canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        this.canvas.add(cloned);
      }
      
      this.canvas.setActiveObject(cloned);
      clonedObject = cloned;
    });

    return clonedObject;
  }

  deleteActiveObject(): boolean {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return false;

    if (activeObject instanceof fabric.ActiveSelection) {
      activeObject.forEachObject((obj: fabric.Object) => {
        this.canvas.remove(obj);
      });
    } else {
      this.canvas.remove(activeObject);
    }

    this.canvas.discardActiveObject();
    return true;
  }

  // Alignment and Distribution
  alignObjects(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void {
    const activeSelection = this.canvas.getActiveObject();
    if (!activeSelection || !(activeSelection instanceof fabric.ActiveSelection)) return;

    const objects = activeSelection.getObjects();
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();

    objects.forEach(obj => {
      switch (alignment) {
        case 'left':
          obj.set({ left: obj.getBoundingRect().width / 2 });
          break;
        case 'center':
          obj.set({ left: canvasWidth / 2 });
          break;
        case 'right':
          obj.set({ left: canvasWidth - obj.getBoundingRect().width / 2 });
          break;
        case 'top':
          obj.set({ top: obj.getBoundingRect().height / 2 });
          break;
        case 'middle':
          obj.set({ top: canvasHeight / 2 });
          break;
        case 'bottom':
          obj.set({ top: canvasHeight - obj.getBoundingRect().height / 2 });
          break;
      }
      obj.setCoords();
    });

    this.canvas.renderAll();
  }

  distributeObjects(distribution: 'horizontal' | 'vertical'): void {
    const activeSelection = this.canvas.getActiveObject();
    if (!activeSelection || !(activeSelection instanceof fabric.ActiveSelection)) return;

    const objects = activeSelection.getObjects();
    if (objects.length < 3) return;

    objects.sort((a, b) => {
      if (distribution === 'horizontal') {
        return (a.left || 0) - (b.left || 0);
      } else {
        return (a.top || 0) - (b.top || 0);
      }
    });

    const first = objects[0];
    const last = objects[objects.length - 1];
    
    if (distribution === 'horizontal') {
      const totalWidth = (last.left || 0) - (first.left || 0);
      const spacing = totalWidth / (objects.length - 1);
      
      objects.forEach((obj, index) => {
        obj.set({ left: (first.left || 0) + spacing * index });
        obj.setCoords();
      });
    } else {
      const totalHeight = (last.top || 0) - (first.top || 0);
      const spacing = totalHeight / (objects.length - 1);
      
      objects.forEach((obj, index) => {
        obj.set({ top: (first.top || 0) + spacing * index });
        obj.setCoords();
      });
    }

    this.canvas.renderAll();
  }

  // Layer Management
  bringToFront(object?: fabric.Object): void {
    const targetObject = object || this.canvas.getActiveObject();
    if (targetObject) {
      this.canvas.bringToFront(targetObject);
    }
  }

  sendToBack(object?: fabric.Object): void {
    const targetObject = object || this.canvas.getActiveObject();
    if (targetObject) {
      this.canvas.sendToBack(targetObject);
    }
  }

  bringForward(object?: fabric.Object): void {
    const targetObject = object || this.canvas.getActiveObject();
    if (targetObject) {
      this.canvas.bringForward(targetObject);
    }
  }

  sendBackward(object?: fabric.Object): void {
    const targetObject = object || this.canvas.getActiveObject();
    if (targetObject) {
      this.canvas.sendBackward(targetObject);
    }
  }

  // Canvas Utilities
  fitToCanvas(object: fabric.Object, padding: number = 20): void {
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    const objBounds = object.getBoundingRect();

    const availableWidth = canvasWidth - padding * 2;
    const availableHeight = canvasHeight - padding * 2;

    const scaleX = availableWidth / objBounds.width;
    const scaleY = availableHeight / objBounds.height;
    const scale = Math.min(scaleX, scaleY);

    object.scale(scale);
    object.center();
    object.setCoords();
    this.canvas.renderAll();
  }

  centerObject(object?: fabric.Object): void {
    const targetObject = object || this.canvas.getActiveObject();
    if (targetObject) {
      targetObject.center();
      targetObject.setCoords();
      this.canvas.renderAll();
    }
  }

  // Export Utilities
  exportWithBackground(
    backgroundColor: string = '#ffffff',
    format: string = 'png',
    quality: number = 1
  ): string {
    const originalBackground = this.canvas.backgroundColor;
    this.canvas.setBackgroundColor(backgroundColor, () => {
      this.canvas.renderAll();
    });

    const dataURL = this.canvas.toDataURL({
      format,
      quality,
      multiplier: quality === 1 ? 2 : 1
    });

    // Restore original background
    this.canvas.setBackgroundColor(originalBackground, () => {
      this.canvas.renderAll();
    });

    return dataURL;
  }

  exportArea(bounds: ObjectBounds, format: string = 'png'): string {
    const originalViewport = this.canvas.viewportTransform;
    
    // Create a temporary canvas element
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = bounds.width;
    tempCanvas.height = bounds.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // Draw the specific area
      tempCtx.drawImage(
        this.canvas.getElement(),
        bounds.left, bounds.top, bounds.width, bounds.height,
        0, 0, bounds.width, bounds.height
      );
    }

    return tempCanvas.toDataURL(`image/${format}`);
  }

  // Animation Utilities
  animateObjectEntry(object: fabric.Object, animationType: 'fadeIn' | 'slideIn' | 'scaleIn' = 'fadeIn'): void {
    switch (animationType) {
      case 'fadeIn':
        object.set('opacity', 0);
        object.animate('opacity', 1, {
          duration: 500,
          onChange: () => this.canvas.renderAll()
        });
        break;
      
      case 'slideIn':
        const originalLeft = object.left;
        object.set('left', (object.left || 0) - 100);
        object.animate('left', originalLeft, {
          duration: 500,
          easing: fabric.util.ease.easeOutCubic,
          onChange: () => this.canvas.renderAll()
        });
        break;
      
      case 'scaleIn':
        const originalScaleX = object.scaleX;
        const originalScaleY = object.scaleY;
        object.set({ scaleX: 0, scaleY: 0 });
        object.animate({ scaleX: originalScaleX, scaleY: originalScaleY }, {
          duration: 500,
          easing: fabric.util.ease.easeOutBack,
          onChange: () => this.canvas.renderAll()
        });
        break;
    }
  }

  // Snap and Grid
  enableSnapping(snapDistance: number = 10): void {
    this.canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;

      const canvasObjects = this.canvas.getObjects().filter(o => o !== obj);
      const objBounds = obj.getBoundingRect();

      canvasObjects.forEach(otherObj => {
        const otherBounds = otherObj.getBoundingRect();
        
        // Snap to left edge
        if (Math.abs(objBounds.left - otherBounds.left) < snapDistance) {
          obj.set('left', (obj.left || 0) + (otherBounds.left - objBounds.left));
        }
        
        // Snap to right edge
        if (Math.abs((objBounds.left + objBounds.width) - (otherBounds.left + otherBounds.width)) < snapDistance) {
          obj.set('left', (obj.left || 0) + ((otherBounds.left + otherBounds.width) - (objBounds.left + objBounds.width)));
        }
        
        // Snap to top edge
        if (Math.abs(objBounds.top - otherBounds.top) < snapDistance) {
          obj.set('top', (obj.top || 0) + (otherBounds.top - objBounds.top));
        }
        
        // Snap to bottom edge
        if (Math.abs((objBounds.top + objBounds.height) - (otherBounds.top + otherBounds.height)) < snapDistance) {
          obj.set('top', (obj.top || 0) + ((otherBounds.top + otherBounds.height) - (objBounds.top + objBounds.height)));
        }
      });

      obj.setCoords();
    });
  }

  // Filters and Effects
  applyImageFilter(
    imageObject: fabric.Image,
    filterType: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sepia' | 'grayscale',
    value: number
  ): void {
    const filters = imageObject.filters || [];
    
    // Remove existing filter of the same type
    const filteredFilters = filters.filter(f => {
      const filterName = f.constructor.name.toLowerCase();
      return !filterName.includes(filterType);
    });

    let newFilter: fabric.IBaseFilter | null = null;

    switch (filterType) {
      case 'brightness':
        newFilter = new fabric.Image.filters.Brightness({ brightness: value });
        break;
      case 'contrast':
        newFilter = new fabric.Image.filters.Contrast({ contrast: value });
        break;
      case 'saturation':
        newFilter = new fabric.Image.filters.Saturation({ saturation: value });
        break;
      case 'blur':
        newFilter = new fabric.Image.filters.Blur({ blur: value });
        break;
      case 'sepia':
        newFilter = new fabric.Image.filters.Sepia();
        break;
      case 'grayscale':
        newFilter = new fabric.Image.filters.Grayscale();
        break;
    }

    if (newFilter) {
      filteredFilters.push(newFilter);
    }

    imageObject.filters = filteredFilters;
    imageObject.applyFilters();
    this.canvas.renderAll();
  }

  // Utility Methods
  getObjectsByType(type: string): fabric.Object[] {
    return this.canvas.getObjects().filter(obj => obj.type === type);
  }

  getTextObjects(): fabric.Text[] {
    return this.canvas.getObjects('text') as fabric.Text[];
  }

  getImageObjects(): fabric.Image[] {
    return this.canvas.getObjects('image') as fabric.Image[];
  }

  selectAllObjects(): void {
    const allObjects = this.canvas.getObjects();
    if (allObjects.length > 1) {
      const selection = new fabric.ActiveSelection(allObjects, {
        canvas: this.canvas,
      });
      this.canvas.setActiveObject(selection);
      this.canvas.renderAll();
    } else if (allObjects.length === 1) {
      this.canvas.setActiveObject(allObjects[0]);
    }
  }

  deselectAll(): void {
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  lockObject(object?: fabric.Object): void {
    const targetObject = object || this.canvas.getActiveObject();
    if (targetObject) {
      targetObject.set({
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        selectable: false
      });
      this.canvas.renderAll();
    }
  }

  unlockObject(object?: fabric.Object): void {
    const targetObject = object || this.canvas.getActiveObject();
    if (targetObject) {
      targetObject.set({
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
        selectable: true
      });
      this.canvas.renderAll();
    }
  }
}

// Utility functions for common meme text styles
export const memeTextStyles = {
  classic: {
    fontSize: 32,
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontWeight: 'bold',
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    textAlign: 'center'
  },
  modern: {
    fontSize: 28,
    fontFamily: 'Inter, Helvetica, sans-serif',
    fontWeight: '700',
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 1.5,
    textAlign: 'center'
  },
  comic: {
    fontSize: 30,
    fontFamily: 'Comic Sans MS, cursive',
    fontWeight: 'bold',
    fill: '#ffff00',
    stroke: '#000000',
    strokeWidth: 2,
    textAlign: 'center'
  }
} as const;

// Common canvas presets
export const canvasPresets = {
  square: { width: 500, height: 500 },
  instagram: { width: 1080, height: 1080 },
  twitter: { width: 1200, height: 675 },
  facebook: { width: 1200, height: 630 },
  story: { width: 1080, height: 1920 },
  wide: { width: 800, height: 450 },
  tall: { width: 450, height: 800 }
} as const;
