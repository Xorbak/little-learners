import { audioContext } from './sfx';

/**
 * Records her voice for a few seconds (Say It, Tell me about your picture) and
 * plays it back. Nothing is uploaded; recordings stay on the phone.
 * The phone asks a grown-up for permission to use the microphone the first time.
 */

export const canRecord = () => !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

let denied = false;
export const micDenied = () => denied;

/**
 * Records for up to `ms` (or until `stop` is called). `onLevel` gets how loud
 * she is (0–1) many times a second, for a mic that grows when she talks.
 * Resolves with the recording, or null if there is no microphone or no permission.
 */
export function recordVoice(ms: number, onLevel?: (level: number) => void): { done: Promise<Blob | null>; stop: () => void } {
  let stopNow = () => {};
  const done = (async () => {
    if (!canRecord() || denied) return null;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      denied = true;
      return null;
    }
    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const stopped = new Promise<void>((r) => (rec.onstop = () => r()));

    // How loud: a level meter from the microphone
    let raf = 0;
    const ctx = audioContext();
    if (ctx && onLevel) {
      try {
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const loop = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (const v of data) sum += ((v - 128) / 128) ** 2;
          onLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch {
        /* no meter, still records */
      }
    }

    rec.start();
    await new Promise<void>((r) => {
      const t = window.setTimeout(r, ms);
      stopNow = () => {
        window.clearTimeout(t);
        r();
      };
    });
    cancelAnimationFrame(raf);
    if (rec.state !== 'inactive') rec.stop();
    await stopped;
    stream.getTracks().forEach((t) => t.stop());
    return chunks.length ? new Blob(chunks, { type: rec.mimeType || 'audio/webm' }) : null;
  })();
  return { done, stop: () => stopNow() };
}

/** Plays a recording; resolves when it has finished */
export function playRecording(blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const end = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onended = end;
    audio.onerror = end;
    audio.play().catch(end);
  });
}
