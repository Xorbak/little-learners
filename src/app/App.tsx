import { useCallback, useEffect, useRef, useState } from 'react';
import { narrator } from '../shared/audio/narrator';
import { useProgress } from '../shared/progress/store';
import { onSafePoint, playClock } from '../shared/playtime';
import { PlayBreak, TimeUp } from './screens/PlayGuard';
import { StartScreen } from './screens/StartScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SectionScreen } from './screens/SectionScreen';
import { GameScreen } from './screens/GameScreen';
import { ParentArea } from './screens/ParentArea';
import { TodayScreen } from './screens/TodayScreen';
import { StickerBook } from './screens/StickerBook';
import { MoveBreak } from './screens/MoveBreak';
import { MissionScreen } from './screens/MissionScreen';
import { CalmScreen } from './screens/CalmScreen';
import { SongsScreen } from './screens/SongsScreen';
import { findSection } from './registry';
import { hasName } from './name';
import { aboutMeClips } from './aboutMe';
import { useFamily } from '../shared/family';
import { setHapticsEnabled } from '../shared/haptics';
import { preloadMusic, setBackgroundMusic, setBed } from '../shared/audio/music';

export type Screen =
  | { name: 'start' }
  | { name: 'home' }
  | { name: 'section'; sectionId: string }
  | { name: 'play'; sectionId: string; gameId: string; daily?: { stepId: string; rounds: number } }
  | { name: 'today'; justFinished?: string }
  | { name: 'stickers' }
  | { name: 'move'; stepId: string; n: number }
  | { name: 'mission'; day: string; fresh?: boolean }
  | { name: 'calm' }
  | { name: 'songs' }
  | { name: 'parent' };

export type Navigate = (screen: Screen) => void;

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'start' });
  const saved = useProgress();

  useEffect(() => {
    narrator.setVoice(saved.voice);
  }, [saved.voice]);

  // Vibration feedback (can be switched off)
  useEffect(() => {
    setHapticsEnabled(saved.vibration !== false);
  }, [saved.vibration]);

  // Background music from src/music (can be switched off)
  useEffect(() => {
    setBackgroundMusic(saved.backgroundMusic !== false);
  }, [saved.backgroundMusic]);

  // Words under the pictures for grown-ups (can be switched off)
  useEffect(() => {
    document.documentElement.toggleAttribute('data-no-labels', saved.showLabels === false);
  }, [saved.showLabels]);

  // Her name, so the narrator can greet her (record it as shared.child-name if you like),
  // and her details and family names for All About Me
  const childName = saved.profiles[saved.activeProfileId].name;
  const aboutMe = saved.profiles[saved.activeProfileId].aboutMe;
  const familyMembers = useFamily();
  useEffect(() => {
    narrator.registerClips({ 'shared.child-name': hasName(childName) ? childName : '', ...aboutMeClips(childName, aboutMe, familyMembers) });
  }, [childName, aboutMe, familyMembers]);

  // ---- Play time: exercise breaks and the end of the session ----
  const [guard, setGuard] = useState<null | 'break' | 'rest'>(null);
  const [restFresh, setRestFresh] = useState(false);
  const pendingSince = useRef<number | null>(null);
  const screenRef = useRef(screen.name);
  screenRef.current = screen.name;
  const guardRef = useRef(guard);
  guardRef.current = guard;

  /** Show a break / time's up if one is due. `now`: even in the middle of something. */
  const check = useCallback((now: boolean) => {
    if (guardRef.current || screenRef.current === 'start' || screenRef.current === 'parent') return;
    const state = playClock.state();
    if (state === 'locked') {
      setRestFresh(false);
      setGuard('rest');
      return;
    }
    if (state === 'soon') {
      if (now) {
        playClock.markWarned();
        void narrator.idle().then(() => narrator.say(['guard.soon']));
      }
      return;
    }
    if (state !== 'break' && state !== 'stop') {
      pendingSince.current = null;
      return;
    }
    // No jumping-jacks in the middle of calming down: breaks wait until she leaves the calm corner
    if (state === 'break' && screenRef.current === 'calm') return;
    pendingSince.current ??= Date.now();
    // Wait for a good moment (between rounds), but not for ever
    if (!now && Date.now() - pendingSince.current < 90000) return;
    pendingSince.current = null;
    narrator.setQuiet(true);
    if (state === 'break') setGuard('break');
    else {
      playClock.lock();
      setRestFresh(true);
      setGuard('rest');
    }
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      const counting = !guardRef.current && !['start', 'parent', 'move'].includes(screenRef.current) && document.visibilityState === 'visible';
      if (counting) playClock.tick(1000);
      check(false);
    }, 1000);
    const off = onSafePoint(() => check(true));
    return () => {
      window.clearInterval(t);
      off();
    };
  }, [check]);

  const closeGuard = () => {
    narrator.setQuiet(false);
    setGuard(null);
  };

  const navigate: Navigate = (next) => {
    narrator.stop();
    setScreen(next);
    // Moving to another screen is a good moment for a break
    window.setTimeout(() => check(true), 0);
  };

  // The background music for where she is (only if its file is in src/music)
  useEffect(() => {
    if (screen.name !== 'start') preloadMusic();
    setBed(bedFor(screen, guard));
  }, [screen, guard, saved.backgroundMusic]);

  const overlay =
    guard === 'break' ? (
      <PlayBreak
        onDone={(keys) => {
          playClock.breakDone(keys);
          closeGuard();
        }}
      />
    ) : guard === 'rest' ? (
      <TimeUp fresh={restFresh} onUnlocked={closeGuard} />
    ) : null;

  return (
    <>
      {renderScreen()}
      {overlay}
    </>
  );

  function renderScreen() {
    switch (screen.name) {
      case 'start':
        return <StartScreen navigate={navigate} />;
      case 'home':
        return <HomeScreen navigate={navigate} />;
      case 'parent':
        return <ParentArea navigate={navigate} />;
      case 'today':
        return <TodayScreen key={screen.justFinished ?? 'today'} navigate={navigate} justFinished={screen.justFinished} />;
      case 'stickers':
        return <StickerBook navigate={navigate} />;
      case 'move':
        return <MoveBreak key={screen.stepId} navigate={navigate} stepId={screen.stepId} n={screen.n} />;
      case 'calm':
        return <CalmScreen navigate={navigate} />;
      case 'songs':
        return <SongsScreen navigate={navigate} />;
      case 'mission':
        return <MissionScreen key={screen.day} navigate={navigate} day={screen.day} fresh={screen.fresh} />;
      case 'section': {
        const section = findSection(screen.sectionId);
        return section ? <SectionScreen section={section} navigate={navigate} /> : <HomeScreen navigate={navigate} />;
      }
      case 'play': {
        const section = findSection(screen.sectionId);
        const game = section?.games.find((g) => g.id === screen.gameId);
        return section && game ? (
          <GameScreen key={`${screen.sectionId}/${screen.gameId}/${screen.daily?.stepId ?? ''}`} section={section} game={game} navigate={navigate} daily={screen.daily} />
        ) : (
          <HomeScreen navigate={navigate} />
        );
      }
    }
  }
}

/**
 * Which background music goes with each screen: bg-home on the menus, bg-art for
 * Paint by Numbers, bg-thinking for the thinking games, bg-move for exercise
 * breaks. Other games stay quiet (listening games, the xylophone); the calm
 * corner and sing-along play their own.
 */
function bedFor(screen: Screen, guard: null | 'break' | 'rest'): string | null {
  if (guard === 'break') return 'bg-move';
  if (guard === 'rest') return null;
  switch (screen.name) {
    case 'home':
    case 'section':
    case 'today':
    case 'stickers':
    case 'mission':
      return 'bg-home';
    case 'move':
      return 'bg-move';
    case 'play':
      if (screen.sectionId === 'thinking') return 'bg-thinking';
      if (screen.sectionId === 'art' && screen.gameId === 'paint-by-numbers') return 'bg-art';
      return null;
    default:
      return null;
  }
}
