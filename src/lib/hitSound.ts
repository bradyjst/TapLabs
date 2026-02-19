let audioCtx: AudioContext | null = null;

let hitBuffer: AudioBuffer | null = null;
let accentBuffer: AudioBuffer | null = null;

export function getAudioCtx() {
	if (!audioCtx) {
		audioCtx = new AudioContext();
	}
	return audioCtx;
}

async function loadBuffer(path: string) {
	const ctx = getAudioCtx();
	const res = await fetch(path);
	const arrayBuffer = await res.arrayBuffer();
	return await ctx.decodeAudioData(arrayBuffer);
}

export async function initHitSound() {
	const ctx = getAudioCtx();

	if (ctx.state === "suspended") {
		await ctx.resume();
	}

	if (!hitBuffer) {
		hitBuffer = await loadBuffer("/sounds/hit.wav");
	}

	if (!accentBuffer) {
		accentBuffer = await loadBuffer("/sounds/hit-accent.wav");
	}
}

function play(buffer: AudioBuffer | null, gainValue = 1) {
	const ctx = getAudioCtx();

	if (!buffer) return;

	const source = ctx.createBufferSource();
	const gain = ctx.createGain();

	source.buffer = buffer;
	gain.gain.value = gainValue;

	source.connect(gain);
	gain.connect(ctx.destination);

	source.start(0);
}

export function playHitSound() {
	play(accentBuffer, 0.2);
}

export function playAccentHit() {
	play(accentBuffer, 0.3);
}
