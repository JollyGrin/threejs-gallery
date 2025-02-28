<script>
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
</script>

<div class="h-screen w-screen">
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
