<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { Color, MathUtils, Vector3, TextureLoader, DoubleSide } from 'three';
	import { onMount } from 'svelte';

	// Configuration
	const gridSize = { rows: 4, cols: 4 };
	const spacing = 2;
	const hoverScale = 1.5;
	const fullscreenScale = 3;

	// State
	let hoveredIndex = -1;
	let selectedIndex = -1;
	let isFullscreen = false;
	let textureLoader: TextureLoader;

	// Generate image data
	const images = [];
	for (let row = 0; row < gridSize.rows; row++) {
		for (let col = 0; col < gridSize.cols; col++) {
			const index = row * gridSize.cols + col;
			const centerOffsetX = ((gridSize.cols - 1) * spacing) / 2;
			const centerOffsetZ = ((gridSize.rows - 1) * spacing) / 2;
			
			// Calculate position
			const position = [
				col * spacing - centerOffsetX,
				0,
				row * spacing - centerOffsetZ
			];
			
			// Create image data with stable seed for consistent images
			images.push({
				id: index,
				position,
				rotation: [-Math.PI / 2, 0, 0],
				imageUrl: `https://picsum.photos/seed/gallery${index}/300/300`,
				scale: 1,
				saturation: 0,
				texture: null,
				loaded: false
			});
		}
	}

	// Initialize textures
	onMount(() => {
		textureLoader = new TextureLoader();
		
		// Load textures for each image
		images.forEach((image) => {
			textureLoader.load(
				image.imageUrl,
				(texture) => {
					image.texture = texture;
					image.loaded = true;
				},
				undefined,
				(error) => {
					console.error('Error loading texture:', error);
				}
			);
		});
	});

	// Handle hover events
	function handlePointerEnter(index: number) {
		hoveredIndex = index;
	}
	
	function handlePointerLeave() {
		hoveredIndex = -1;
	}
	
	// Handle click events
	function handleClick(index: number) {
		if (selectedIndex === index) {
			selectedIndex = -1;
			isFullscreen = false;
		} else {
			selectedIndex = index;
			isFullscreen = true;
		}
	}

	// Animation task for smooth transitions
	useTask(() => {
		images.forEach((image, i) => {
			let targetScale = 1;
			
			if (isFullscreen) {
				if (i === selectedIndex) {
					targetScale = fullscreenScale;
				} else {
					targetScale = 0.5;
				}
			} else if (i === hoveredIndex) {
				targetScale = hoverScale;
			}
			
			// Smooth scale transition
			image.scale = MathUtils.lerp(image.scale, targetScale, 0.1);
		});
	});
</script>

<!-- Camera -->
<T.PerspectiveCamera makeDefault position={[0, 10, 15]} fov={50}>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

<!-- Lighting -->
<T.AmbientLight intensity={0.7} />
<T.DirectionalLight position={[10, 10, 5]} intensity={1} castShadow />

<!-- Floor -->
<T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
	<T.PlaneGeometry args={[20, 20]} />
	<T.MeshStandardMaterial color="#f0f0f0" />
</T.Mesh>

<!-- Image grid -->
{#each images as image, i}
	<T.Group position={new Vector3(...image.position)} rotation={image.rotation} scale={image.scale}>
		<T.Mesh
			on:pointerenter={() => handlePointerEnter(i)}
			on:pointerleave={handlePointerLeave}
			on:click={() => handleClick(i)}
			receiveShadow
		>
			<T.PlaneGeometry args={[1, 1]} />
			<T.MeshStandardMaterial 
				color="white" 
				map={image.texture}
				transparent={!image.loaded}
				opacity={image.loaded ? 1 : 0}
			/>
		</T.Mesh>
	</T.Group>
{/each}
