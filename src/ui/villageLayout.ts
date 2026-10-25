// 마을 장면 배치. 좌표는 장면 크기 대비(0~1): x = 가운데, y = 바닥(발 닿는 곳), h = 그림 높이.
// y가 작을수록 뒤(먼저 그림). 소품 그림은 정사각형 안에 아래 가운데 맞춤(tools/crop_props.py).
import type { CharacterId } from '@/core/chapters';
import type { PropId } from '@/core/village';

export interface Spot {
  x: number;
  y: number;
  h: number;
}

/** 땅이 시작하는 높이(위는 하늘). */
export const GROUND_TOP = 0.3;
/** 연못(타원) 위치. */
export const POND = { x: 0.8, y: 0.86, w: 0.38, h: 0.13 } as const;

export const PROP_SPOTS: Record<PropId, Spot> = {
  // 뒷줄
  house: { x: 0.5, y: 0.42, h: 0.3 },
  bigtree: { x: 0.12, y: 0.4, h: 0.28 },
  willow: { x: 0.88, y: 0.41, h: 0.27 },
  bamboo: { x: 0.29, y: 0.4, h: 0.2 },
  tree: { x: 0.72, y: 0.41, h: 0.19 },
  // 가운데
  bunting: { x: 0.5, y: 0.5, h: 0.1 },
  fence: { x: 0.17, y: 0.53, h: 0.12 },
  lamp: { x: 0.9, y: 0.58, h: 0.19 },
  well: { x: 0.7, y: 0.59, h: 0.15 },
  signpost: { x: 0.33, y: 0.6, h: 0.13 },
  bush: { x: 0.06, y: 0.63, h: 0.12 },
  barrel: { x: 0.55, y: 0.62, h: 0.1 },
  // 앞줄
  bench: { x: 0.24, y: 0.76, h: 0.13 },
  picnic: { x: 0.47, y: 0.8, h: 0.11 },
  stump: { x: 0.64, y: 0.76, h: 0.08 },
  cattails: { x: 0.92, y: 0.82, h: 0.13 },
  lilypad: { x: 0.85, y: 0.9, h: 0.08 },
  log: { x: 0.1, y: 0.91, h: 0.09 },
  rock: { x: 0.6, y: 0.95, h: 0.1 },
  flowers: { x: 0.33, y: 0.97, h: 0.11 },
};

export const FRIEND_SPOTS: Record<CharacterId, Spot> = {
  cat: { x: 0.34, y: 0.72, h: 0.15 },
  panda: { x: 0.51, y: 0.7, h: 0.17 },
  rabbit: { x: 0.69, y: 0.73, h: 0.15 },
  shiba: { x: 0.19, y: 0.87, h: 0.14 },
  duck: { x: 0.72, y: 0.92, h: 0.1 },
};
