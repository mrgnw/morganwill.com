<script>
	import { onMount } from 'svelte';

	let loteData = null;
	let loading = false;
	let error = null;

	async function fetchLote() {
		loading = true;
		error = null;
		
		try {
			// Use a CORS proxy or your own backend endpoint
			// Since we can't make direct requests due to CORS, you'll need to:
			// 1. Deploy the Python script as a serverless function, or
			// 2. Use a CORS proxy, or 
			// 3. Create a simple backend endpoint
			
			// For now, I'll show how to call your own API endpoint
			const response = await fetch('/api/lote'); // You'll need to create this endpoint
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			
			const data = await response.json();
			loteData = data;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchLote();
	});
</script>

<div class="lote-container">
	<h1>Barcelona NIE Lote Checker</h1>
	
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Fetching latest lote...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>❌ Error: {error}</p>
			<button on:click={fetchLote}>Try Again</button>
		</div>
	{:else if loteData}
		<div class="results">
			<div class="lote-number">
				<h2>Current Lote:</h2>
				<div class="lote-value">{loteData.lote.replace(/\//g, '/')}</div>
			</div>
			
			<div class="details">
				<p><strong>Last Updated:</strong> {loteData.acutalizacao}</p>
				<p><strong>Status:</strong> {loteData.predv_zap}</p>
				<p><strong>Office:</strong> {loteData.address}</p>
				{#if loteData.thanks_to}
					<p><small>Thanks to: {loteData.thanks_to}</small></p>
				{/if}
			</div>
		</div>
		
		<button on:click={fetchLote} class="refresh-btn">🔄 Refresh</button>
	{/if}
</div>

<style>
	.lote-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: #f8f9fa;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	h1 {
		text-align: center;
		color: #2c3e50;
		margin-bottom: 2rem;
		font-size: 1.8rem;
	}

	.loading {
		text-align: center;
		padding: 2rem;
	}

	.spinner {
		border: 4px solid #f3f3f3;
		border-top: 4px solid #3498db;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error {
		text-align: center;
		padding: 2rem;
		color: #e74c3c;
	}

	.error button {
		background: #e74c3c;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		margin-top: 1rem;
	}

	.results {
		text-align: center;
	}

	.lote-number {
		margin-bottom: 2rem;
	}

	.lote-number h2 {
		color: #34495e;
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	.lote-value {
		font-size: 3rem;
		font-weight: bold;
		color: #e74c3c;
		background: white;
		padding: 1rem 2rem;
		border-radius: 8px;
		border: 3px solid #e74c3c;
		display: inline-block;
		font-family: 'Monaco', 'Menlo', monospace;
		letter-spacing: 2px;
	}

	.details {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		margin: 1.5rem 0;
		text-align: left;
	}

	.details p {
		margin: 0.5rem 0;
		color: #2c3e50;
	}

	.details strong {
		color: #34495e;
	}

	.refresh-btn {
		background: #3498db;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s;
	}

	.refresh-btn:hover {
		background: #2980b9;
	}

	@media (max-width: 600px) {
		.lote-container {
			margin: 1rem;
			padding: 1rem;
		}
		
		.lote-value {
			font-size: 2rem;
			padding: 0.75rem 1rem;
		}
	}
</style>
