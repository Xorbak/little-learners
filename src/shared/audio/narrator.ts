import type { ClipId, ClipTable } from '../../types/learning';

/**
 * The narrator speaks a phrase made of clips, e.g. ['pop.pop-all-the', 'numbers.plural.3'].
 *
 * For each clip:
 *  - if src/recordings/<clip-id>.(mp3|m4a|wav|ogg|webm) exists, that recording plays
 *  - otherwise the clip's text is spoken with the browser's text-to-speech
 *
 * Neighbouring text-to-speech clips are joined into one sentence so they sound natural.
 * Recordings are picked up automatically at build time: just drop the file in and refresh.
 */

const recordingFiles = import.meta.glob('../../recordings/*.{mp3,m4a,wav,ogg,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const recordings: Record<ClipId, string> = {};
for (const [path, url] of Object.entries(recordingFiles)) {
  const file = path.split('/').pop() ?? '';
  recordings[file.replace(/\.[^.]+$/, '')] = url;
}

let clips: ClipTable = {};
let quiet = false;

export interface VoiceSettings {
  voiceURI?: string;
  rate: number;
  pitch: number;
}

let voiceSettings: VoiceSettings = { rate: 0.85, pitch: 1.1 };
let playToken = 0;
/** Resolves when whatever is being said now has finished (or was interrupted) */
let current: Promise<void> = Promise.resolve();
let lastKey = '';
let lastStart = 0;
let currentAudio: HTMLAudioElement | null = null;
// Keeps a reference so Chrome doesn't garbage-collect the utterance mid-sentence
let currentUtterance: SpeechSynthesisUtterance | null = null;

type Segment = { type: 'recording'; url: string } | { type: 'tts'; text: string };

// Background music listens, to go quieter while the narrator talks
const speakingListeners = new Set<(on: boolean) => void>();
let speakingNow = false;
function setSpeaking(on: boolean) {
  if (on === speakingNow) return;
  speakingNow = on;
  speakingListeners.forEach((listener) => listener(on));
}

export const narrator = {
  registerClips(table: ClipTable) {
    clips = { ...clips, ...table };
  },

  allClips(): ClipTable {
    return clips;
  },

  hasRecording(id: ClipId): boolean {
    return id in recordings;
  },

  setVoice(settings: VoiceSettings) {
    voiceSettings = settings;
  },

  /** English voices available on this device, best first */
  voices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) return [];
    const rank = (v: SpeechSynthesisVoice) =>
      v.lang === 'en-ZA' ? 0 : v.lang === 'en-GB' ? 1 : v.lang.startsWith('en') ? 2 : 9;
    return speechSynthesis
      .getVoices()
      .filter((v) => v.lang.startsWith('en'))
      .sort((a, b) => rank(a) - rank(b));
  },

  /** Stop whatever is playing */
  stop() {
    playToken++;
    lastKey = '';
    currentAudio?.pause();
    currentAudio = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    setSpeaking(false);
  },

  /** Told when the narrator starts and stops talking */
  onSpeaking(listener: (on: boolean) => void): () => void {
    speakingListeners.add(listener);
    return () => speakingListeners.delete(listener);
  },

  /**
   * Say a phrase. Interrupts anything already playing.
   * Resolves when finished (or when interrupted).
   */
  say(ids: ClipId[], opts: { force?: boolean } = {}): Promise<void> {
    // Kept quiet while a play-time screen covers the game (the game underneath can't talk over it)
    if (quiet && !opts.force) return Promise.resolve();
    // The same phrase asked for again straight away (a double tap, or React's
    // development mode running things twice): keep going rather than stutter
    const key = ids.join('|');
    if (key === lastKey && Date.now() - lastStart < 600) return current;
    const wasSpeaking = 'speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending);
    this.stop();
    lastKey = key;
    lastStart = Date.now();
    const token = playToken;
    setSpeaking(true);
    current = (async () => {
      // Chrome sometimes swallows the start of a sentence spoken straight after cancel()
      if (wasSpeaking) await new Promise((r) => setTimeout(r, 120));
      for (const segment of toSegments(ids)) {
        if (token !== playToken) return;
        if (segment.type === 'recording') await playRecording(segment.url);
        else await speak(segment.text);
      }
      if (token === playToken) setSpeaking(false);
    })();
    return current;
  },

  /** While on, only say(…, { force: true }) speaks (play-time breaks cover the screen underneath) */
  setQuiet(on: boolean) {
    quiet = on;
    if (on) this.stop();
  },

  /** Waits until the narrator has finished what it is saying now */
  idle(): Promise<void> {
    return current;
  },
};

function toSegments(ids: ClipId[]): Segment[] {
  const segments: Segment[] = [];
  for (const id of ids) {
    if (recordings[id]) {
      segments.push({ type: 'recording', url: recordings[id] });
      continue;
    }
    const text = clips[id];
    if (text === undefined) {
      console.warn(`[narrator] Unknown clip "${id}"`);
      continue;
    }
    const last = segments[segments.length - 1];
    if (last?.type === 'tts') last.text += ' ' + text;
    else segments.push({ type: 'tts', text });
  }
  return segments;
}

function playRecording(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.onpause = () => resolve();
    audio.play().catch(() => resolve());
  });
}

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = narrator.voices();
    utterance.voice =
      voices.find((v) => v.voiceURI === voiceSettings.voiceURI) ?? voices[0] ?? null;
    utterance.lang = utterance.voice?.lang ?? 'en-GB';
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;

    // Some browsers occasionally never fire `onend`; don't let the game hang.
    const safety = window.setTimeout(done, 3000 + (text.length * 140) / Math.max(0.5, voiceSettings.rate));
    function done() {
      window.clearTimeout(safety);
      resolve();
    }
    utterance.onend = done;
    utterance.onerror = done;

    currentUtterance = utterance;
    speechSynthesis.speak(currentUtterance);
  });
}

// Voices load asynchronously in some browsers; asking early warms the list.
if ('speechSynthesis' in window) {
  speechSynthesis.getVoices();
}
