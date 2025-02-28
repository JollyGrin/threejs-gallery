<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { Spring } from 'svelte/motion';
	import {
		Vector3,
		MathUtils,
		Vector2,
		PerspectiveCamera,
		Mesh,
		TextureLoader,
		Texture
	} from 'three';

	interactivity();

	// Configuration
	const gridSize = { rows: 13, cols: 14 };
	const spacing = 1.2;
	const maxHoverScale = 3;
	const hoverRadius = spacing * 2; // How far the effect spreads
	const lerpFactor = 0.15; // Increased for more responsive movement
	const imageSize = 400; // Size for Picsum images
	const baseRenderOrder = 0;
	const hoveredRenderOrder = 1;
	const animationDelay = 75; // ms delay between each item's animation
	const springConfig = { stiffness: 0.05, damping: 0.7 };

	// State
	let mousePosition: Vector2 = new Vector2();
	let camera: PerspectiveCamera;
	let isAnimating = true;

	// Setup texture loader
	const textureLoader = new TextureLoader();

	// Generate grid positions
	let planes: {
		id: number;
		position: number[];
		rotation: number[];
		scale: number;
		renderOrder: number;
		vec3Position: Vector3;
		mesh?: Mesh;
		texture?: Texture;
		spring: Spring<{ x: number; z: number }>;
		targetPosition: Vector3;
		animationOrder: number;
	}[] = $state([]);

	// Calculate positions and create planes
	for (let row = 0; row < gridSize.rows; row++) {
		for (let col = 0; col < gridSize.cols; col++) {
			const index = row * gridSize.cols + col;
			const centerOffsetX = ((gridSize.cols - 1) * spacing) / 2;
			const centerOffsetZ = ((gridSize.rows - 1) * spacing) / 2;

			// Calculate final position
			const targetX = col * spacing - centerOffsetX;
			const targetZ = row * spacing - centerOffsetZ;

			// Calculate animation order (distance from center)
			const distanceFromCenter =
				Math.abs(col - (gridSize.cols - 1) / 2) + Math.abs(row - (gridSize.rows - 1) / 2);

			const position = [0, 0, 0]; // Start at center
			const targetPosition = new Vector3(targetX, 0, targetZ);

			// Create spring for this plane
			const planeSpring = new Spring({ x: 0, z: 0 });
			planeSpring.stiffness = springConfig.stiffness;
			planeSpring.damping = springConfig.damping;

			// Load texture for this plane
			const imageUrl = `https://picsum.photos/seed/${index}/${imageSize}/${imageSize}`;
			const texture = textureLoader.load(imageUrl);

			planes.push({
				id: index,
				position,
				rotation: [-Math.PI / 2, 0, 0],
				scale: 1,
				renderOrder: baseRenderOrder,
				vec3Position: new Vector3(...position),
				texture,
				spring: planeSpring,
				targetPosition,
				animationOrder: distanceFromCenter
			});
		}
	}

	// Sort planes by animation order
	planes.sort((a, b) => a.animationOrder - b.animationOrder);

	// Start animation sequence
	let startTime = performance.now();
	useTask(() => {
		if (!isAnimating) return;

		const currentTime = performance.now();
		const elapsed = currentTime - startTime;

		planes.forEach((plane) => {
			const delay = plane.animationOrder * animationDelay;
			if (elapsed > delay) {
				// First move X
				plane.spring.set({
					x: plane.targetPosition.x,
					z: plane.spring.current.z
				});

				// Then move Z after X is mostly done
				if (Math.abs(plane.spring.current.x - plane.targetPosition.x) < 0.1) {
					plane.spring.set({
						x: plane.targetPosition.x,
						z: plane.targetPosition.z
					});
				}

				// Update position from spring
				const springValue = plane.spring.current;
				plane.position = [springValue.x, 0, springValue.z];
				plane.vec3Position.set(springValue.x, 0, springValue.z);
			}
		});

		// Check if animation is complete
		const allInPosition = planes.every((plane) => {
			const current = plane.spring.current;
			return (
				Math.abs(current.x - plane.targetPosition.x) < 0.01 &&
				Math.abs(current.z - plane.targetPosition.z) < 0.01
			);
		});

		if (allInPosition) {
			isAnimating = false;
		}
	});

	// Calculate scale based on distance to mouse
	function getScaleFromDistance(distance: number): number {
		const normalizedDistance = Math.max(0, 1 - distance / hoverRadius);
		return 1 + (maxHoverScale - 1) * Math.pow(normalizedDistance, 2); // Quadratic falloff for smoother effect
	}

	// Update mesh render order
	function updateMeshRenderOrder(mesh: Mesh | undefined, order: number) {
		if (mesh) {
			mesh.renderOrder = order;
		}
	}

	// Setup interactivity
	interactivity({
		compute: (event, state) => {
			if (isAnimating) return; // Don't process hover while animating

			// Update mouse position
			mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
			mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

			// Update the raycaster
			if (camera) {
				state.raycaster.setFromCamera(mousePosition, camera);

				// Filter out undefined meshes and cast to Object3D[]
				const meshes = planes.map((p) => p.mesh).filter((mesh): mesh is Mesh => mesh !== undefined);

				// Find intersections with all planes
				const intersects = state.raycaster.intersectObjects(meshes);

				if (intersects.length > 0) {
					const intersection = intersects[0];
					const point = intersection.point;
					const hoveredMesh = intersection.object as Mesh;

					// Update scales and render orders based on distance to intersection point
					planes.forEach((plane) => {
						const distance = plane.vec3Position.distanceTo(point);
						const targetScale = getScaleFromDistance(distance);
						plane.scale = MathUtils.lerp(plane.scale, targetScale, lerpFactor);

						// Update render order based on scale
						if (plane.scale > 1.1) {
							updateMeshRenderOrder(plane.mesh, hoveredRenderOrder);
						} else {
							updateMeshRenderOrder(plane.mesh, baseRenderOrder);
						}
					});

					// Ensure the directly hovered mesh is always on top
					updateMeshRenderOrder(hoveredMesh, hoveredRenderOrder + 1);
				} else {
					// Reset all render orders when not hovering
					planes.forEach((plane) => {
						plane.scale = MathUtils.lerp(plane.scale, 1, lerpFactor);
						updateMeshRenderOrder(plane.mesh, baseRenderOrder);
					});
				}
			}
		}
	});

	// Store mesh references when created
	function handleMeshCreated(mesh: Mesh, index: number) {
		planes[index].mesh = mesh;
		mesh.renderOrder = baseRenderOrder;
	}

	// Store camera reference when created
	function handleCameraCreated(cam: PerspectiveCamera) {
		camera = cam;
	}
</script>

<!-- Fixed top-down camera -->
<T.PerspectiveCamera
	makeDefault
	position={[0, 10, 0]}
	rotation={[-Math.PI / 2, 0, 0]}
	fov={50}
	oncreate={handleCameraCreated}
/>

<!-- Lighting -->
<T.AmbientLight intensity={1} />
<T.DirectionalLight position={[5, 5, 5]} intensity={0.5} />

{#each planes as plane, i}
	<T.Group
		position={plane.position as [number, number, number]}
		rotation={plane.rotation as [number, number, number]}
		scale={plane.scale}
	>
		<T.Mesh oncreate={(mesh) => handleMeshCreated(mesh, i)}>
			<T.PlaneGeometry args={[1, 1]} />
			<T.MeshStandardMaterial map={plane.texture} side={2} transparent={true} depthWrite={false} />
		</T.Mesh>
	</T.Group>
{/each}
