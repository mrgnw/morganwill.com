<script>
	import { onMount } from "svelte";
	import { SvelteSet } from "svelte/reactivity";

	// Constants
	const ANIMATION = {
			FONT_SIZE: 14,
			FLOW_SPEED: 0.78,
			FADE_RATE: 0.02,
			CHAR_REVEAL_DELAY: 100,
			DECRYPT_SPEED: 0.7,
			FLASH_DURATION: 200, // in ms
	};

	const STREAM = {
			MIN_LENGTH: 5,
			MAX_LENGTH: 25,
			CREATION_DELAY: 250, // in ms
			DEPTH_LEVELS: 5,
			DECRYPT_PROBABILITY: 13, // percent probability
	};

	// Character Sets
	const charRange = (start, end) =>
			Array.from({ length: end - start + 1 }, (_, i) =>
					String.fromCodePoint(start + i)
			);

	export const CHAR_SETS = {
			latin: [
					...charRange(0x0041, 0x005a), // A-Z
					...charRange(0x0061, 0x007a), // a-z
			],
			numbers: "0123456789".split(""),
			punctuation: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~".split(""),
			math: "∞∆∑∏πΩ√∂∫≈≠≤≥×÷".split(""),
			cyrillic: [
					...charRange(0x0410, 0x042f), // А-Я
					...charRange(0x0430, 0x044f), // а-я
			],
			katakana: charRange(0x30a0, 0x30ff),
			hiragana: charRange(0x3040, 0x309f),
			currency: "€£¥₹₽₱₿¢₡₢₮₣₤₦₧₰₪₫₸₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺₻₼₽₾₿".split(""),
			hex: "0123456789abcdef".split(""),
			// symbols: "✧✦❈✯✡︎✩✪✫✬✭✮✯✰✱✲✳︎✴︎✵✶✷✸✹✺✻✼✽✾✿❀❁❂❃❄︎❅❆❇︎❈❉❊❋".split(""),
	};

	// Combined Sets
	export const COMBINED_SETS = {
			alphanumeric: [...CHAR_SETS.latin, ...CHAR_SETS.numbers],
			latinWithPunctuation: [...CHAR_SETS.latin, ...CHAR_SETS.punctuation],
			matrix: [
					...CHAR_SETS.latin,
					...CHAR_SETS.numbers,
					...CHAR_SETS.punctuation.filter((char) =>
							/[!@#$%^&*()_+\-=[\]{};:,.<>?]/.test(char)
					),
			],
	};

	// Decrypted Strings
	const decryptedStrings = [
			"HELLO WORLD",
			"SVELTE IS AWESOME",
			"MESSAGE DECRYPTED",
			"WEB.DEV",
			"DATA ENGINEERING",
			"MACHINE LEARNING",
			"ARTIFICIAL INTELLIGENCE",
			"QUANTUM COMPUTING",
			"BLOCKCHAIN TECHNOLOGY",
			"CYBERSECURITY",
			"VIRTUAL REALITY",
			"AUGMENTED REALITY",
			"INTERNET OF THINGS",
			"EDGE COMPUTING",
			"SERVERLESS ARCHITECTURE",
			"CLOUD COMPUTING",
			"DATA PRIVACY",
			"CYBER THREATS",
			"AI ETHICS",
			"DATA SECURITY",
			"DIGITAL TRANSFORMATION",
			"CLOUD SECURITY",
			"CYBER RESILIENCE",
			"WAKE UP, NEO...",
			"THE MATRIX HAS YOU...",
			"FOLLOW THE WHITE RABBIT.",
			"KNOCK, KNOCK, NEO.",
	];

	// States
	let canvas;
	let ctx = null;
	let streams = new SvelteSet();
	let width = 0;
	let height = 0;
	let lastStreamCreationTime = 0;
	let lastDecryptedStreamTime = 0;
	let devicePixelRatio = 1; // Default value

	// Helper Functions
	function getRandomCharacterSet() {
			const sets = Object.values(CHAR_SETS);
			return sets[Math.floor(Math.random() * sets.length)];
	}

	function createRandomStream(
			length,
			selectedSet = getRandomCharacterSet()
	) {
			return Array.from({ length }, () => ({
					char: selectedSet[Math.floor(Math.random() * selectedSet.length)],
					alpha: 0,
					isDecrypted: false,
					isVisible: false,
					isDecrypting: false,
					decryptStartTime: 0,
			}));
	}

	// Stream Creation Functions
	function createEncryptedStream(text) {
			const targetChars = text.toUpperCase().split("");
			const initialChars = createRandomStream(text.length).map((char) => ({
					...char,
					isDecrypting: false,
					decryptStartTime: 0,
			}));

			return {
					x: Math.floor(Math.random() * width),
					y: 0,
					speed: (Math.random() * 0.5 + 0.5) * ANIMATION.FLOW_SPEED,
					chars: initialChars,
					scale: 1, // Fixed scale for decrypted streams
					depthLevel: Math.floor(Math.random() * STREAM.DEPTH_LEVELS),
					charSet: getRandomCharacterSet(),
					decrypted: true,
					targetChars,
					decryptedPositions: new Set(),
					lastCharRevealTime: 0,
					nextRevealIndex: 0,
					initialFlashDone: false,
					flashStartTime: 0,
					isFlashing: false,
			};
	}

	function createStream(isDecrypted = false) {
			if (isDecrypted) {
					const decryptedText =
							decryptedStrings[Math.floor(Math.random() * decryptedStrings.length)];
					return createEncryptedStream(decryptedText);
			}

			const length = Math.floor(
					Math.random() * (STREAM.MAX_LENGTH - STREAM.MIN_LENGTH) +
							STREAM.MIN_LENGTH
			);

			return {
					x: Math.floor(Math.random() * width),
					y: 0,
					speed: (Math.random() * 0.5 + 0.5) * ANIMATION.FLOW_SPEED,
					chars: createRandomStream(length),
					scale: 1, // Always use scale of 1
					depthLevel: Math.floor(Math.random() * STREAM.DEPTH_LEVELS),
					charSet: getRandomCharacterSet(),
					decrypted: false,
					decryptedPositions: new Set(),
					lastCharRevealTime: 0,
						nextRevealIndex: 0,
						initialFlashDone: false,
						flashStartTime: 0,
						isFlashing: false,
			};
	}

	// Flash Handling Functions
	function flashStream(stream, timestamp) {
			stream.isFlashing = true;
			stream.flashStartTime = timestamp;
	}

	function calculateFlashStyle(
			timestamp,
			flashStartTime,
			duration = ANIMATION.FLASH_DURATION
	) {
			return Math.max(0, 1 - (timestamp - flashStartTime) / duration);
	}

	// Color Calculation
	function getCharColor(
			char,
			stream,
			timestamp,
			baseAlpha,
			index
	) {
			if (!stream.decrypted) {
					// Regular matrix rain (green)
					return `rgba(0, 255, 70, ${char.alpha * baseAlpha})`;
			}

			if (char.isDecrypted) {
					if (char.isDecrypting) {
							// Individual character decrypting flash
							const flashIntensity = calculateFlashStyle(
									timestamp,
									char.decryptStartTime
							);
							if (flashIntensity > 0) {
									const whiteBoost = Math.floor(255 * flashIntensity);
									return `rgba(255, ${whiteBoost}, ${whiteBoost}, ${
											char.alpha * baseAlpha * (1 + flashIntensity)
									})`;
							} else {
									// Transition to blue after flash
									char.isDecrypting = false;
							}
					}
					// Decrypted blue character
					return `rgba(50, 150, 255, ${char.alpha * baseAlpha})`;
			}

			if (stream.isFlashing) {
					// Initial stream flash (red with white boost)
					const flashIntensity = calculateFlashStyle(
							timestamp,
							stream.flashStartTime
					);
					if (flashIntensity > 0) {
							const whiteBoost = Math.floor(255 * flashIntensity);
							return `rgba(255, ${whiteBoost}, ${whiteBoost}, ${char.alpha * baseAlpha * (1 + flashIntensity)})`;
					} else {
							// Flash finished
							stream.isFlashing = false;
					}
			}

			// Undecrypted characters in decrypted stream (red)
			return `rgba(255, 0, 0, ${char.alpha * baseAlpha})`;
	}

	// Stream Management Functions
	function revealChar(char, timestamp) {
			char.isVisible = true;
			char.alpha = 1;
			char.lastRevealTime = timestamp;
	}

	function replaceChar(char, newChar, timestamp) {
			char.char = newChar;
			char.isDecrypted = true;
			char.isDecrypting = true;
			char.decryptStartTime = timestamp;
	}

	function updateStream(stream, timestamp) {
			// Move stream down
			stream.y += stream.speed;

			// Reveal next character if it's time
			if (timestamp - stream.lastCharRevealTime > ANIMATION.CHAR_REVEAL_DELAY) {
					if (stream.nextRevealIndex < stream.chars.length) {
							revealChar(stream.chars[stream.nextRevealIndex], timestamp);
							stream.nextRevealIndex++;
							stream.lastCharRevealTime = timestamp;
					} else if (stream.decrypted && !stream.initialFlashDone) {
							// Initial stream flash before decryption starts
							flashStream(stream, timestamp);
							stream.initialFlashDone = true;
					}
			}

			// Handle decryption after initial flash
			if (stream.decrypted && stream.initialFlashDone && !stream.isFlashing) {
					if (stream.decryptedPositions.size < stream.chars.length) {
							if (Math.random() < ANIMATION.DECRYPT_SPEED) {
									decryptNextCharacter(stream, timestamp);
							}
					}
			}

			// Fade visible characters
			stream.chars.forEach((char) => {
					if (char.isVisible && char.alpha > 0.8) {
							char.alpha = Math.max(0.8, char.alpha - ANIMATION.FADE_RATE);
					}
			});
	}

	function decryptNextCharacter(stream, timestamp) {
			const availablePositions = Array.from(
					{ length: stream.chars.length },
					(_, i) => i
			).filter((i) => !stream.decryptedPositions.has(i));

			if (availablePositions.length > 0) {
					const pos =
							availablePositions[
									Math.floor(Math.random() * availablePositions.length)
							];
					stream.decryptedPositions.add(pos);
					replaceChar(stream.chars[pos], stream.targetChars[pos], timestamp);
			}
	}

	// Main Animation Loop
	onMount(() => {
			// Set devicePixelRatio after mounting
			devicePixelRatio = window.devicePixelRatio || 1;

			function handleResize() {
					width = window.innerWidth;
					height = window.innerHeight;

					if (canvas) {
							// Set canvas size to match window size exactly
							canvas.width = width;
							canvas.height = height;
					}
			}

			window.addEventListener("resize", handleResize);
			handleResize();

			if (canvas) {
					ctx = canvas.getContext("2d");
			}

			function draw(timestamp) {
					if (!ctx) return;

					// Clear canvas with translucent black for fade effect
					ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
					ctx.fillRect(0, 0, width, height);

					// Create new streams with spacing check
					if (timestamp - lastStreamCreationTime > STREAM.CREATION_DELAY) {
							const minSpacing = ANIMATION.FONT_SIZE * 2; // Minimum horizontal spacing between streams
							const maxStreams = Math.floor(width / minSpacing);
							const currentDensity = streams.size / maxStreams;
							const creationProbability = Math.max(0.1, 1 - currentDensity);

							if (Math.random() < creationProbability) {
									// Generate potential new x position
									const newX = Math.floor(Math.random() * width);
									
									// Check distance from existing streams
									let tooClose = false;
									streams.forEach(existingStream => {
											const distance = Math.abs(existingStream.x - newX);
											if (distance < minSpacing) {
													tooClose = true;
											}
									});

									// Only create new stream if not too close to others
									if (!tooClose) {
											const isDecrypted = (Math.random() * 100) < STREAM.DECRYPT_PROBABILITY;
											const newStream = createStream(isDecrypted);
											newStream.x = newX; // Use our calculated x position
											streams.add(newStream);
											lastStreamCreationTime = timestamp;
									}
							}
					}

					// Update and render streams
					streams.forEach((stream) => {
							updateStream(stream, timestamp);

							// Render characters
							stream.chars.forEach((char, index) => {
									if (!char.isVisible) return;

									const y = Math.round(stream.y + index * ANIMATION.FONT_SIZE);
									const baseAlpha = 0.2 + (stream.depthLevel / (STREAM.DEPTH_LEVELS - 1)) * 0.8;

									ctx.font = `1.5em monospace`;
									ctx.textBaseline = "middle";
									ctx.textAlign = "center";
									ctx.imageSmoothingEnabled = false;

									ctx.fillStyle = getCharColor(char, stream, timestamp, baseAlpha, index);
									ctx.fillText(char.char, Math.round(stream.x), y);
							});

							// Remove off-screen streams
							if (stream.y > height + STREAM.MAX_LENGTH * ANIMATION.FONT_SIZE) {
									streams.delete(stream);
							}
					});

					requestAnimationFrame(draw);
			}

			requestAnimationFrame(draw);

			return () => {
					window.removeEventListener("resize", handleResize);
					streams.clear();
			};
	});
</script>

<svelte:window on:resize />
<canvas bind:this={canvas} class="matrix-rain" />

<style>
	.matrix-rain {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: black;
	}
</style>