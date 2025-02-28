<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { onMount } from 'svelte';
	import { Vector3, Color, MathUtils, CanvasTexture } from 'three';
	import { createGradientTexture, updateTextureSaturation } from '$lib/utils/textureUtils';

	// Configuration
	const gridSize = { rows: 6, cols: 6 };
	const spacing = 1.5;
	const hoverScale = 1.5;
	const fullscreenScale = 3;

	// State management
	let hoveredIndex = -1;
	let selectedIndex = -1;
	let isFullscreen = false;

	// Image data - generate placeholder textures
	const totalImages = gridSize.rows * gridSize.cols;
	const images = Array(totalImages)
		.fill(null)
		.map((_, i) => {
			const color = new Color().setHSL(i / totalImages, 0.8, 0.5);
			return {
				id: i,
				color,
				position: calculatePosition(i),
				rotation: [-Math.PI / 2, 0, 0], // Lay flat like in the screenshot
				scale: 1,
				saturation: 0, // 0 = grayscale, 1 = full color
				texture: null // Will be initialized in onMount
			};
		});

	// Calculate grid position for an index
	function calculatePosition(index: number) {
		const row = Math.floor(index / gridSize.cols);
		const col = index % gridSize.cols;

		const centerOffsetX = ((gridSize.cols - 1) * spacing) / 2;
		const centerOffsetZ = ((gridSize.rows - 1) * spacing) / 2;

		return [col * spacing - centerOffsetX, 0, row * spacing - centerOffsetZ];
	}

	// Initialize textures
	onMount(() => {
		// Create textures for each image
		images.forEach((image) => {
			image.texture = createGradientTexture(256, 256, image.color, image.saturation);
		});

		// Set up keyboard event listener
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	// Handle hover events
	function handlePointerEnter(index) {
		hoveredIndex = index;
	}

	function handlePointerLeave() {
		hoveredIndex = -1;
	}

	// Handle click events
	function handleClick(index) {
		if (selectedIndex === index) {
			// Clicking the same image again exits fullscreen
			exitFullscreen();
		} else {
			// Enter fullscreen for the clicked image
			selectedIndex = index;
			isFullscreen = true;
		}
	}

	// Exit fullscreen mode
	function exitFullscreen() {
		selectedIndex = -1;
		isFullscreen = false;
	}

	// Handle keyboard events
	function handleKeydown(event) {
		if (event.key === 'Escape' && isFullscreen) {
			exitFullscreen();
		}
	}

	// Animation task
	useTask(() => {
		// Update each image based on hover and selection state
		images.forEach((image, i) => {
			// Determine target scale and saturation
			let targetScale = 1;
			let targetSaturation = 0;

			if (isFullscreen) {
				if (i === selectedIndex) {
					targetScale = fullscreenScale;
					targetSaturation = 1;
				} else {
					targetScale = 0.8;
					targetSaturation = 0;
				}
			} else if (i === hoveredIndex) {
				targetScale = hoverScale;
				targetSaturation = 1;
			}

			// Animate scale and saturation
			image.scale = MathUtils.lerp(image.scale, targetScale, 0.1);
			image.saturation = MathUtils.lerp(image.saturation, targetSaturation, 0.1);

			// Update texture saturation if texture exists
			if (image.texture) {
				updateTextureSaturation(image.texture, image.color, image.saturation);
			}
		});
	});
</script>

<!-- Handle keyboard events at the component level -->
<svelte:window on:keydown={handleKeydown} />

<!-- Camera setup -->
<T.PerspectiveCamera makeDefault position={[0, 15, 5]} fov={50}>
	<T.Group
		oncreate={(ref) => {
			ref.lookAt(0, 0, 0);
		}}
	/>
	<OrbitControls enableDamping enableZoom={true} enablePan={true} />
</T.PerspectiveCamera>

<!-- Lighting -->
<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[10, 10, 5]} intensity={1} castShadow />

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
			<T.MeshStandardMaterial color="white" map={image.texture} metalness={0.1} roughness={0.8} />
		</T.Mesh>
	</T.Group>
{/each}

<!-- Fullscreen overlay message -->
{#if isFullscreen}
	<T.Group position={[0, 2, 0]}>
		<T.Mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
			<T.PlaneGeometry args={[4, 0.5]} />
			<T.MeshBasicMaterial color="black" transparent opacity={0.7} />
		</T.Mesh>
	</T.Group>
{/if}
