<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import Projects from '$components/Projects.svelte';

	import PhPanorama from 'virtual:icons/ph/panorama'
	import IconoirInstagram from '~icons/iconoir/instagram'
	import JamLinkedinCircle from '~icons/jam/linkedin-circle'
	import IconoirGithubCircle from '~icons/iconoir/github-circle'
	import IconoirTelegramCircle from '~icons/iconoir/telegram-circle'
	import RiBlueskyLine from '~icons/ri/bluesky-line'


	let hostname = $state('')
	let links = $state([])

	let all_links = [
		{
			title: 'photos',
			url: 'https://500px.com/p/morganw?view=licensing',
			blurb: '500px photo portfolio',
			icon: PhPanorama,
		},
		{
			title: 'instagram',
			url: 'https://instagram.com/zenfo.co',
			blurb: 'Instagram profile',
			icon: IconoirInstagram,
		},
		{
			title: 'LinkedIn',
			url: 'https://linkedin.com/in/mrgnw',
			blurb: 'LinkedIn profile',
			icon: JamLinkedinCircle,
			iconRaw: '~icons/jam/linkedin-circle?raw&width=1em&height=1em'
		},
		{
			title: 'github',
			url: 'https://github.com/mrgnw',
			blurb: 'GitHub profile',
			icon: IconoirGithubCircle,
		},
		{
			title: 'bluesky',
			url: 'https://bsky.app/profile/xcc.es',
			blurb: 'Bluesky profile',
			icon: RiBlueskyLine,
		},
		{
			title: 'message',
			url: 'https://t.me/mrgnw',
			blurb: 'Message on Telegram',
			icon: IconoirTelegramCircle,
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
	// let active = $derived(selected === "Morgan" ? "" : "active");
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
	
	<h1 class="title">{selected}</h1>
	<div class="links">
		{#each links as { url, icon, blurb, title }, index}
		<a href={url} target="_blank" aria-label={blurb}
			class:active={title === selected}
			onmouseover={()=> { selected = title; }}
			onfocus={() => { selected = title; }}
			onmouseout={() => { selected = 'Morgan'; }}
			onblur={() => { selected = 'Morgan'; }}
			transition:fade={{ duration: 800, delay: 150 * index }}
			>
			<svelte:component this={icon}
				color={title === selected ? "var(--highlight)" : "var(--default)"}
				height="4.5em" width="4.5em"/>
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

	:global(html, body) {
		height: 100vh;
		margin: 0;
		padding: 0;
		background-color: var(--bg);
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
		min-height: 90vh;
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
			align-items: center;
			height: 100vh;
			min-height: unset;
		}

		.title {
			margin: 1rem 0;
			flex-shrink: 0;
		}

		.links {
			flex: 1;
			overflow-y: auto;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		a {
			width: auto;
			margin: 1rem 0;
			transition: all .8s ease;
		}
	}
</style>