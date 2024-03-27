<script>
	let links = [
		 { emoji: '🍍', title: 'Ananas', url: 'https://ananas.xcc.es', blurb: 'Multilanguage translator'},
		 { emoji: '📲', title: ' textme.cc', url: 'https://textme.cc', blurb: 'Get social messaging link w/ phone #'}
	];
 </script>

 <div class="footer">
	Projects
	{#each links as {emoji, title, url, blurb}}
		 <a href="{url}" target="_blank">{emoji} {title}</a>
	{/each}
 </div>

  
 <style>
	.footer {
		 position: fixed;
		 bottom: 0;
		 width: 100%;
		 background-color: #f8f9fa;
		 padding: 10px 0;
		 text-align: center;
	}
	.footer a {
		 margin: 0 10px;
		 color: #007bff;
	}
 </style>