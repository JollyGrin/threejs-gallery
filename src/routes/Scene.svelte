<script lang="ts">
	import { T } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import {
		Vector3,
		MathUtils,
		Vector2,
		Raycaster,
		PerspectiveCamera,
		Mesh,
		TextureLoader,
		Texture
	} from 'three';

	interactivity();

	// Configuration
	const gridSize = { rows: 7, cols: 7 };
	const spacing = 1.2;
	const maxHoverScale = 3;
	const hoverRadius = spacing * 2; // How far the effect spreads
	const lerpFactor = 0.15; // Increased for more responsive movement
	const imageSize = 400; // Size for Picsum images
	const baseRenderOrder = 0;
	const hoveredRenderOrder = 1;

	// State
	let hoveredIndex = -1;
	let mousePosition: Vector2 = new Vector2();
	let camera: PerspectiveCamera;

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
	}[] = $state([]);

	// Load textures and create planes
	for (let row = 0; row < gridSize.rows; row++) {
		for (let col = 0; col < gridSize.cols; col++) {
			const index = row * gridSize.cols + col;
			const centerOffsetX = ((gridSize.cols - 1) * spacing) / 2;
			const centerOffsetZ = ((gridSize.rows - 1) * spacing) / 2;

			const position = [col * spacing - centerOffsetX, 0, row * spacing - centerOffsetZ];

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
				texture
			});
		}
	}

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
