<script>
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';

  let ssid = '';
  let password = '';
  let qrCodeData = null;
	$: qr_filetype = 'svg';

  const generateQR = async () => {
    if (ssid && password) {
      // Convert the QR code to a data object suitable for SVG rendering
      qrCodeData = await QRCode.toString(`WIFI:S:${ssid};T:WPA;P:${password};;`, { type: qr_filetype });
    }
  };

  onMount(generateQR);
</script>

<style>

	.container {
    width: 100vw;
    height: 100vh;
    padding: 1em;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .input-container {
    width: calc(100% - 2em);
    max-width: 300px;
    /* margin-top: 1em; */
  }

  .input-group input {
    width: 100%;
    padding: 10px;
    /* margin-bottom: 1em; */
  }

  .qr-container {
		width: 90vh;
    max-width: 90%;
    /* max-width: 500px; */
    /* height: auto; */
		max-height:90%;
    margin-top: 1em; /* Adjust space between input and QR code */
  }

  .qr-container {
    width: 90%;
    height: 90%;
    padding: 5%; /* This acts as a margin for the QR code */
    box-sizing: border-box;
  }

  svg {
    width: 100%;
    height: 100%;
  }
</style>

<div class="container">
  <div class="input-container">
    <div class="input-group">
      <input type="text" placeholder="WiFi Name (SSID)" bind:value={ssid} on:input={generateQR}>
      <input type="text" placeholder="Password" bind:value={password} on:input={generateQR}>
    </div>
  </div>
  <div class="qr-container">
    {@html qrCodeData ? qrCodeData : '<div class="placeholder"></div>'}
  </div>
</div>
