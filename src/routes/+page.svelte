<script>
	import { onMount } from 'svelte';
	
	onMount(() => {
		links = get_links(['photos', 'instagram', 'LinkedIn', 'message'])
		if (window.location.hostname === "morganwill.com") {
			links = get_links(['LinkedIn', 'github', 'message'])
    }
		if (window.location.hostname === "zenfo.co") {
			links = get_links(['photos', 'instagram', 'message'])
    }
	});
	
	export let size = "3rem";
	let selected = "Morgan";
	$: active = selected === "Morgan" ? "" : "active";

	let all_links = [
		{
			title: 'photos',
			url: 'https://500px.com/p/morganw?view=licensing',
			blurb: '500px photo portfolio',
			icon: 'tabler:photo',
		},
		{
			title: 'instagram',
			url: 'https://instagram.com/zenfo.co',
			blurb: 'Instagram profile',
			icon: 'akar-icons:instagram-fill',
		},
		{
			title: 'LinkedIn',
			url: 'https://linkedin.com/in/mrgnw',
			blurb: 'LinkedIn profile',
			icon: 'akar-icons:linkedin-fill',
		},
		{
			title: 'github',
			url: 'https://github.com/mrgnw',
			blurb: 'GitHub profile',
			icon: 'akar-icons:github-fill',
		},
		{
			title: 'message',
			url: 'https://t.me/mrgnw',
			blurb: 'Message on Telegram',
			icon: 'fa:telegram',
		},
	]
	let links = all_links;
	
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
	<meta
		name="description"
		content="Contact Morgan or view his other work on 500px, Instagram, LinkedIn, or Github"
	/>
</svelte:head>

{#snippet link_item({ url, icon, blurb, title })}
		<a
			href={url}
			target="_blank"
			aria-label={blurb}
			on:mouseover={() => { selected = title; }}
			on:focus={() => { selected = title; }}
			on:mouseout={() => { selected = 'Morgan'; }}
			on:blur={() => { selected = 'Morgan'; }}
		>
			<iconify-icon icon={icon} height="5em"></iconify-icon>
		</a>
	{/snippet}

<div class="container">
	<h1 class="title {active}">{selected}</h1>
	<div class="links">
		{#each links as link}
			{@render link_item(link)}
		{/each}
	</div>
</div>

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

	.active { color: var(--highlight); }
	a > iconify-icon { color: var(--default); }
	iconify-icon:hover { color: var(--highlight) }

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
		.container { flex-direction: column; }
		a {
			width: 100%;
			margin: 1.3rem 0;
			transition: all .8s ease;
		}
}
</style>
