// 캐릭터 움직임(프레임 애니메이션). 리깅 애니메이션을 미리 렌더한 프레임(src/ui/sprites.ts)을 왕복으로 재생한다.
// 프레임이 없는 캐릭터(오리)는 정지 그림으로 대신한다.
import { useEffect, useState } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

import type { CharacterId } from '@/core/chapters';
import { SPRITE_FPS } from '@/core/config';

import { charImage, type Pose } from './characters';
import { SPRITES, type AnimName } from './sprites';

/** 프레임이 없을 때 대신 쓰는 정지 그림. */
const FALLBACK: Record<AnimName, Pose> = { idle: 'front', cheer: 'cheer' };

/** 왕복 재생에서 step번째에 보일 프레임 번호(0,1,…,n-1,n-2,…,1,0,1,…). */
export function pingPongFrame(step: number, n: number): number {
  if (n <= 1) return 0;
  const period = 2 * (n - 1);
  const k = step % period;
  return k < n ? k : period - k;
}

interface Props {
  character: CharacterId;
  anim: AnimName;
  size: number;
  /** 여러 캐릭터가 같은 박자로 움직이지 않게 시작 프레임을 어긋낸다. */
  offset?: number;
  style?: StyleProp<ImageStyle>;
}

export function Sprite({ character, anim, size, offset = 0, style }: Props) {
  const frames = SPRITES[character]?.[anim];
  const [step, setStep] = useState(offset);
  useEffect(() => {
    if (!frames || frames.length < 2) return;
    const id = setInterval(() => setStep((s) => s + 1), 1000 / SPRITE_FPS);
    return () => clearInterval(id);
  }, [frames]);
  const source = frames ? frames[pingPongFrame(step, frames.length)] : charImage(character, FALLBACK[anim]);
  return <Image source={source} style={[{ width: size, height: size }, style]} resizeMode="contain" fadeDuration={0} />;
}
