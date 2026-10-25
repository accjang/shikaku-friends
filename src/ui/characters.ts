// 캐릭터 이미지(술래잡기 게임 3D 모델을 tools/render_chars.mjs로 렌더한 것).
import type { ImageSourcePropType } from 'react-native';

import type { CharacterId } from '@/core/chapters';

export type Pose = 'front' | 'q' | 'ql' | 'head';

const IMAGES: Record<CharacterId, Record<Pose, ImageSourcePropType>> = {
  cat: {
    front: require('../../assets/chars/cat_front.png'),
    q: require('../../assets/chars/cat_q.png'),
    ql: require('../../assets/chars/cat_ql.png'),
    head: require('../../assets/chars/cat_head.png'),
  },
  panda: {
    front: require('../../assets/chars/panda_front.png'),
    q: require('../../assets/chars/panda_q.png'),
    ql: require('../../assets/chars/panda_ql.png'),
    head: require('../../assets/chars/panda_head.png'),
  },
  rabbit: {
    front: require('../../assets/chars/rabbit_front.png'),
    q: require('../../assets/chars/rabbit_q.png'),
    ql: require('../../assets/chars/rabbit_ql.png'),
    head: require('../../assets/chars/rabbit_head.png'),
  },
};

export function charImage(id: CharacterId, pose: Pose): ImageSourcePropType {
  return IMAGES[id][pose];
}
