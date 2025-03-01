# Interactive 3D Image Gallery

https://github.com/user-attachments/assets/e78938ba-e822-4ac0-af3e-d73dbf5ba6ef

An interactive 3D image gallery built with Svelte, Threlte, and Three.js. Features a dynamic grid of images with spring-based animations and hover effects.

![Interactive 3D Gallery Demo](demo.gif)

## Features

- 🖼️ Dynamic grid of images with configurable size
- 🎯 Interactive hover effects with distance-based scaling
- 🌊 Smooth spring-based animations
- 🎨 Color effects (grayscale to color on hover)
- 📸 Random images from Lorem Picsum
- 💫 Modern, minimalist UI

## Configuration

The gallery is highly configurable. Here are the main parameters you can adjust in `src/routes/Scene.svelte`:

```typescript
// Grid Layout
const gridSize = { rows: 13, cols: 14 };  // Adjust grid dimensions
const spacing = 1.5;                      // Space between images

// Hover Effects
const maxHoverScale = 3;                  // Maximum scale on hover
const hoverRadius = spacing * 2;          // How far the effect spreads
const lerpFactor = 0.15;                  // Hover animation smoothness

// Animation
const animationDelay = 60;                // Delay between each image animation (ms)
const springConfig = {                    // Spring physics configuration
  stiffness: 0.1,                        // Lower = more bouncy
  damping: 0.9                           // Higher = less oscillation
};

// Color Effects
const maxSaturation = 1;                  // Full color when hovered
const minSaturation = 0;                  // Grayscale when not hovered

// Image Settings
const imageSize = 400;                    // Size of loaded images (px)
```

## Effects

### Hover Effects
- Scale: Images scale up when hovered, with a smooth falloff based on distance
- Color: Images transition from grayscale to full color on hover
- Both effects use distance-based interpolation for smooth transitions

### Animation
- Images animate out from the center using spring physics
- Sequential animation creates a wave-like effect
- Configurable spring physics for different movement styles

## Development

1. Clone the repository:
```bash
git clone https://github.com/JollyGrin/threejs-gallery.git
cd threejs-gallery
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Tech Stack

- 🎭 [Svelte](https://svelte.dev/) - Frontend framework
- 🎲 [Threlte](https://threlte.xyz/) - Svelte components for Three.js
- 📦 [Three.js](https://threejs.org/) - 3D graphics library
- 🎨 [TailwindCSS](https://tailwindcss.com/) - Styling

## License

MIT
