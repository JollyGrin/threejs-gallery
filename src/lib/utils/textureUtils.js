import { CanvasTexture, Color, LinearFilter } from 'three';

/**
 * Creates a canvas texture with a gradient background
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Color} color - Base color for the texture
 * @param {number} saturation - Saturation level (0-1)
 * @returns {CanvasTexture} - Canvas texture
 */
export function createGradientTexture(width = 256, height = 256, color = new Color(0.5, 0.5, 0.5), saturation = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  
  // Create gradient
  const gradient = context.createLinearGradient(0, 0, width, height);
  
  // Get HSL values from the color
  const hsl = {};
  color.getHSL(hsl);
  
  // Create gradient with adjusted saturation
  const startColor = new Color().setHSL(hsl.h, hsl.s * saturation, hsl.l * 0.7);
  const midColor = new Color().setHSL(hsl.h, hsl.s * saturation, hsl.l);
  const endColor = new Color().setHSL(hsl.h, hsl.s * saturation, hsl.l * 1.3);
  
  gradient.addColorStop(0, startColor.getStyle());
  gradient.addColorStop(0.5, midColor.getStyle());
  gradient.addColorStop(1, endColor.getStyle());
  
  // Fill the canvas
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  
  // Add some visual interest - simple patterns
  context.fillStyle = new Color().setHSL(hsl.h, hsl.s * saturation * 0.5, hsl.l * 0.9).getStyle();
  
  // Draw some shapes based on the hue to create variety
  const shapeType = Math.floor(hsl.h * 6) % 3;
  
  if (shapeType === 0) {
    // Horizontal lines
    for (let i = 0; i < height; i += 20) {
      context.fillRect(0, i, width, 2);
    }
  } else if (shapeType === 1) {
    // Circles
    const radius = width / 10;
    for (let x = radius; x < width; x += radius * 2.5) {
      for (let y = radius; y < height; y += radius * 2.5) {
        context.beginPath();
        context.arc(x, y, radius * (0.5 + saturation * 0.5), 0, Math.PI * 2);
        context.fill();
      }
    }
  } else {
    // Mountains/triangles
    const peaks = 3 + Math.floor(hsl.h * 5);
    const baseY = height * 0.7;
    
    context.beginPath();
    context.moveTo(0, baseY);
    
    for (let i = 0; i <= peaks; i++) {
      const x = (width / peaks) * i;
      const y = baseY - (Math.sin(i * Math.PI / peaks) * height * 0.4);
      context.lineTo(x, y);
    }
    
    context.lineTo(width, baseY);
    context.closePath();
    context.fill();
  }
  
  // Create texture from canvas
  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  
  return texture;
}

/**
 * Updates a texture's saturation level
 * @param {CanvasTexture} texture - The texture to update
 * @param {Color} color - Base color for the texture
 * @param {number} saturation - New saturation level (0-1)
 */
export function updateTextureSaturation(texture, color, saturation) {
  if (!texture || !texture.image) return;
  
  const canvas = texture.image;
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  context.clearRect(0, 0, width, height);
  
  // Get HSL values from the color
  const hsl = {};
  color.getHSL(hsl);
  
  // Create gradient with adjusted saturation
  const gradient = context.createLinearGradient(0, 0, width, height);
  const startColor = new Color().setHSL(hsl.h, hsl.s * saturation, hsl.l * 0.7);
  const midColor = new Color().setHSL(hsl.h, hsl.s * saturation, hsl.l);
  const endColor = new Color().setHSL(hsl.h, hsl.s * saturation, hsl.l * 1.3);
  
  gradient.addColorStop(0, startColor.getStyle());
  gradient.addColorStop(0.5, midColor.getStyle());
  gradient.addColorStop(1, endColor.getStyle());
  
  // Fill the canvas
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  
  // Add some visual interest - simple patterns
  context.fillStyle = new Color().setHSL(hsl.h, hsl.s * saturation * 0.5, hsl.l * 0.9).getStyle();
  
  // Draw some shapes based on the hue to create variety
  const shapeType = Math.floor(hsl.h * 6) % 3;
  
  if (shapeType === 0) {
    // Horizontal lines
    for (let i = 0; i < height; i += 20) {
      context.fillRect(0, i, width, 2);
    }
  } else if (shapeType === 1) {
    // Circles
    const radius = width / 10;
    for (let x = radius; x < width; x += radius * 2.5) {
      for (let y = radius; y < height; y += radius * 2.5) {
        context.beginPath();
        context.arc(x, y, radius * (0.5 + saturation * 0.5), 0, Math.PI * 2);
        context.fill();
      }
    }
  } else {
    // Mountains/triangles
    const peaks = 3 + Math.floor(hsl.h * 5);
    const baseY = height * 0.7;
    
    context.beginPath();
    context.moveTo(0, baseY);
    
    for (let i = 0; i <= peaks; i++) {
      const x = (width / peaks) * i;
      const y = baseY - (Math.sin(i * Math.PI / peaks) * height * 0.4);
      context.lineTo(x, y);
    }
    
    context.lineTo(width, baseY);
    context.closePath();
    context.fill();
  }
  
  // Update the texture
  texture.needsUpdate = true;
}
