<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Grid, OrbitControls } from '@threlte/extras';
	import { Vector3, MathUtils } from 'three';

	// Configuration
	const gridSize = { rows: 4, cols: 4 };
	const spacing = 2;
	const hoverScale = 1.5;

	// State
	let hoveredIndex = -1;

	// Generate grid positions
	const planes: { id: number; position: number[]; rotation: number[]; scale: number }[] = [];
	for (let row = 0; row < gridSize.rows; row++) {
		for (let col = 0; col < gridSize.cols; col++) {
			const index = row * gridSize.cols + col;
			const centerOffsetX = ((gridSize.cols - 1) * spacing) / 2;
			const centerOffsetZ = ((gridSize.rows - 1) * spacing) / 2;

			planes.push({
				id: index,
				position: [col * spacing - centerOffsetX, 0, row * spacing - centerOffsetZ],
				rotation: [-Math.PI / 2, 0, 0], // Flat on the ground
				scale: 1
			});
		}
	}

	// Handle hover events
	function handlePointerEnter(index: number) {
		hoveredIndex = index;
	}

	function handlePointerLeave() {
		hoveredIndex = -1;
	}

	// Animation task for smooth transitions
	useTask(() => {
		planes.forEach((plane, i) => {
			const targetScale = i === hoveredIndex ? hoverScale : 1;
			plane.scale = MathUtils.lerp(plane.scale, targetScale, 0.1);
		});
	});
</script>

<!-- Camera -->
<T.PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50}>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

<!-- Lighting -->
<T.AmbientLight intensity={1} />
<T.DirectionalLight position={[5, 5, 5]} intensity={0.5} />
<Grid />

{#each planes as plane, i}
	<T.Group
		position={plane.position as [number, number, number]}
		rotation={plane.rotation as [number, number, number]}
		scale={plane.scale}
	>
		<T.Mesh on:pointerenter={() => handlePointerEnter(i)} on:pointerleave={handlePointerLeave}>
			<T.PlaneGeometry args={[1, 1]} />
			<T.MeshStandardMaterial color="#666666" side={2} />
		</T.Mesh>
	</T.Group>
{/each}
