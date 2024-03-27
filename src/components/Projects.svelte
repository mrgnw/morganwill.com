<script>
	let links = [
		 { emoji: '🍍🌐', title: 'Ananas', url: 'https://ananas.xcc.es', blurb: 'Multilanguage translator'},
		 { emoji: '📲', title: ' textme.cc', url: 'https://textme.cc', blurb: 'Get social messaging link w/ phone #'}
	];
 </script>

 <div class="projects">
	Projects
	{#each links as {emoji, title, url, blurb}}
		 <a href="{url}" target="_blank">{emoji} {title}</a>
	{/each}
 </div>

  
 <style>
	.projects {
		 text-align: center;
	}
	a {
		 margin: 0 10px;
		 color: #007bff;
	}
	
 </style>