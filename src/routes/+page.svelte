<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import Projects from '$components/Projects.svelte';
	let hostname = $state('')
	let links = $state([])

	let all_links = [
		{
			title: 'photos',
			url: 'https://500px.com/p/morganw?view=licensing',
			blurb: '500px photo portfolio',
			svg_file: 'panorama',
		},
		{
			title: 'instagram',
			url: 'https://instagram.com/zenfo.co',
			blurb: 'Instagram profile',
			svg_file: 'instagram',
		},
		{
			title: 'LinkedIn',
			url: 'https://linkedin.com/in/mrgnw',
			blurb: 'LinkedIn profile',
			svg_file: 'linkedin',
		},
		{
			title: 'github',
			url: 'https://github.com/mrgnw',
			blurb: 'GitHub profile',
			svg_file: 'github',
		},
		{
			title: 'message',
			url: 'https://t.me/mrgnw',
			blurb: 'Message on Telegram',
			svg_file: 'telegram',
		},
	]

	onMount(() => {
		hostname = window.location.hostname;
		if (hostname === "morganwill.com") {
			links = get_links(['LinkedIn', 'github', 'message'])
		}
		else if (hostname === "zenfo.co") {
			links = get_links(['photos', 'instagram', 'message'])
		}
		else {
			links = all_links;
		}
	});

	let selected = $state("Morgan");
	let active = $derived(selected === "Morgan" ? "" : "active");

	/**
	 * @param {string[]} titles
	 */
	function get_links(titles) {
		return titles.reduce((acc, title) => {
			const link = all_links.find(link => link.title === title);
			if (link) acc.push(link);
			return acc;
		}, []);
	}

</script>

<svelte:head>
	<title>Morgan</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="description" content="Contact Morgan or view his other work on 500px, Instagram, LinkedIn, or Github" />
</svelte:head>

<div class="container">
	<h1 class="title {active}">{selected}</h1>
	<div class="links">
		{#each links as { url, icon, blurb, title, svg_file }, index}
		<a href={url} target="_blank" aria-label={blurb} onmouseover={()=> { selected = title; }}
			onfocus={() => { selected = title; }}
			onmouseout={() => { selected = 'Morgan'; }}
			onblur={() => { selected = 'Morgan'; }}
			transition:fade={{ duration: 800, delay: 150 * index }}
			>
			<img src={`/svg/${svg_file}.svg`} alt={blurb}>
		</a>
		{/each}
	</div>

</div>

{#if hostname == 'morganwill.com'}
<div transition:fade={{ duration: 500 }}>
	<Projects />
</div>
{/if}

<style>
	:root {
		--primary: black;
		--default: rgba(0, 0, 0, 0.8);
		--highlight: rgb(30, 131, 255);
		--bg: #ffffff;
		background-color: var(--bg);
		overflow: hidden;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--primary: white;
			--highlight: white;
			--default: rgb(30, 255, 139);
			--bg: #000000;
		}
	}

	:global(body) {
		background-color: var(--bg);
		overflow: hidden;
	}


	.active {
		color: var(--highlight);
	}

	a>iconify-icon {
		color: var(--default);
	}

	iconify-icon:hover {
		color: var(--highlight)
	}

	.title {
		font-size: 4rem;
		font-weight: 200;
		margin-bottom: 1rem;
		font-family: sans-serif;
		color: var(--primary);
		width: 5em;
	}

	.container {
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 90vh;
		transition: all 0.5s ease;
	}

	a {
		display: flex;
		justify-content: center;
		margin: 1.3rem 2.3rem;
		width: auto;
	}

	@media (max-width: 767px) {
		.container {
			flex-direction: column;
		}

		a {
			width: 100%;
			margin: 1.3rem 0;
			transition: all .8s ease;
		}
	}
</style>