// 판을 다 풀면 드러나는 캐릭터 픽셀아트(tools/gen_postcards.py).
import type { ImageSourcePropType } from 'react-native';

import type { CharacterId } from '@/core/chapters';

const IMAGES: Record<CharacterId, ImageSourcePropType> = {
  cat: require('../../assets/postcards/cat.png'),
  panda: require('../../assets/postcards/panda.png'),
  rabbit: require('../../assets/postcards/rabbit.png'),
  shiba: require('../../assets/postcards/shiba.png'),
  duck: require('../../assets/postcards/duck.png'),
};

export function postcard(id: CharacterId): ImageSourcePropType {
  return IMAGES[id];
}
