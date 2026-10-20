import { useEffect, useState } from 'react';
import { narrator } from '../shared/audio/narrator';
import { useProgress } from '../shared/progress/store';
import { StartScreen } from './screens/StartScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SectionScreen } from './screens/SectionScreen';
import { GameScreen } from './screens/GameScreen';
import { ParentArea } from './screens/ParentArea';
import { TodayScreen } from './screens/TodayScreen';
import { StickerBook } from './screens/StickerBook';
import { MoveBreak } from './screens/MoveBreak';
import { MissionScreen } from './screens/MissionScreen';
import { findSection } from './registry';
import { hasName } from './name';

export type Screen =
  | { name: 'start' }
  | { name: 'home' }
  | { name: 'section'; sectionId: string }
  | { name: 'play'; sectionId: string; gameId: string; daily?: { stepId: string; rounds: number } }
  | { name: 'today'; justFinished?: string }
  | { name: 'stickers' }
  | { name: 'move'; stepId: string; n: number }
  | { name: 'mission'; day: string; fresh?: boolean }
  | { name: 'parent' };

export type Navigate = (screen: Screen) => void;

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'start' });
  const saved = useProgress();

  useEffect(() => {
    narrator.setVoice(saved.voice);
  }, [saved.voice]);

  // Her name, so the narrator can greet her (record it as shared.child-name if you like)
  const childName = saved.profiles[saved.activeProfileId].name;
  useEffect(() => {
    narrator.registerClips({ 'shared.child-name': hasName(childName) ? childName : '' });
  }, [childName]);

  const navigate: Navigate = (next) => {
    narrator.stop();
    setScreen(next);
  };

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
