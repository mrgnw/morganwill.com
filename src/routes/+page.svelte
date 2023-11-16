<script>
	export let size = "3rem";
	let selected = "Morgan";
	$: active = selected === "Morgan" ? "" : "active";

</script>

<svelte:head>
	<title>Morgan</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="Contact Morgan or view his other work on 500px, Instagram, LinkedIn, or Github"
	/>
</svelte:head>

<div class="container">
	<h1 class="title {active}">{selected}</h1>
	<div class="links">
		<a
			href="https://t.me/mrgnw"
			target="_blank"
			aria-label="Message on Telegram"
			on:focus={() => {selected = "message";}}
			on:mouseover={() => { selected = "message";}}
			on:mouseout={() => { selected = "Morgan"; }}
			on:blur={() => { selected = "Morgan"; }}
		>
			<iconify-icon icon="fa:telegram" height="5em"></iconify-icon>
		</a>
		<a
			href="https://500px.com/p/morganw?view=licensing"
			target="_blank"
			aria-label="500px photo portfolio"
			on:mouseover={() => {selected = "Photos";}}
			on:focus={() => { selected = "Photos"; }}
			on:mouseout={() => { selected = "Morgan"; }}
			on:blur={() => { selected = "Morgan"; }}
		>
			<iconify-icon icon="tabler:photo" height="5em"></iconify-icon>
		</a>
		<a
			href="https://instagram.com/zenfo.co"
			target="_blank"
			aria-label="Instagram"
			on:mouseover={() => {selected = "instagram"; }}
			on:focus={() => { selected = "instagram"; }}
			on:mouseout={() => { selected = "Morgan"; }}
			on:blur={() => { selected = "Morgan"; }}
		>
			<iconify-icon icon="fe:instagram" height="5em"></iconify-icon>
		</a>

		<a
			href="https://www.linkedin.com/in/mrgnw/"
			target="_blank"
			aria-label="LinkedIn"
			on:focus={() => { selected = "linkedin"; }}
			on:mouseover={() => { selected = "linkedin"; }}
			on:mouseout={() => { selected = "Morgan"; }}
			on:blur={() => { selected = "Morgan"; }}
		>
			<iconify-icon icon="ant-design:linkedin-outlined" height="5em"></iconify-icon>
		</a>

		<a
			href="https://github.com/mrgnw"
			target="_blank"
			aria-label="Github"
			on:mouseover={() => { selected = "github"; }}
			on:focus={() => { selected = "github"; }}
			on:mouseout={() => { selected = "Morgan"; }}
			on:blur={() => { selected = "Morgan"; }}
		>
			<iconify-icon icon="mingcute:github-line" height="5em"></iconify-icon>
		</a>
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
  .hidden {
    opacity: 0;
  }

	.title {
		font-size: 4rem;
		font-weight: 200;
		margin-bottom: 0.5rem;
		font-family: sans-serif;
		color: var(--primary);
		width: 5em;
	}

	.container {
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 80vh;
		transition: all 0.5s ease;
	}
	/* formerly .link */
	a {
		display: flex;
		justify-content: center;
		margin: 1.3rem 2.3rem;
    width: auto;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--primary: white;
			--highlight: white;
			--default: rgb(30, 255, 139);
			--bg: #000000;
		}
	}

	a > iconify-icon {
		color: rgba(0,0,0,0.8);
	}
	iconify-icon:hover {
		color: var(--highlight)
	}
	.active {
		color: var(--highlight);
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
