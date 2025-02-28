<script>
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
</script>

<div class="relative h-screen w-screen">
	<div class="absolute top-4 z-50 flex w-full items-center justify-between px-6">
		<div class="scale-100 rounded-full bg-orange-200 px-2 py-1 text-xs text-orange-500 opacity-70">
			Threlte (svelte & threejs)
		</div>

		<div
			class="scale-100 cursor-pointer rounded-full bg-blue-200 px-4 py-3 text-blue-500 opacity-50 transition-all hover:scale-125 hover:opacity-100"
		>
			<a href="https://github.com/JollyGrin/threejs-gallery"> git </a>
		</div>
	</div>
	<Canvas>
		<Scene />
	</Canvas>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
