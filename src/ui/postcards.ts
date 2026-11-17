// 판을 다 풀면 드러나고 앨범에 모이는 픽셀아트(tools/gen_postcards.py). 그림 번호는 src/core/album.ts.
import type { ImageSourcePropType } from 'react-native';

import { pictureKey, type PictureId } from '@/core/album';

const IMAGES: Record<string, ImageSourcePropType> = {
  cat_1: require('../../assets/postcards/cat_1.png'),
  cat_2: require('../../assets/postcards/cat_2.png'),
  cat_3: require('../../assets/postcards/cat_3.png'),
  cat_4: require('../../assets/postcards/cat_4.png'),
  panda_1: require('../../assets/postcards/panda_1.png'),
  panda_2: require('../../assets/postcards/panda_2.png'),
  panda_3: require('../../assets/postcards/panda_3.png'),
  panda_4: require('../../assets/postcards/panda_4.png'),
  rabbit_1: require('../../assets/postcards/rabbit_1.png'),
  rabbit_2: require('../../assets/postcards/rabbit_2.png'),
  rabbit_3: require('../../assets/postcards/rabbit_3.png'),
  rabbit_4: require('../../assets/postcards/rabbit_4.png'),
  shiba_1: require('../../assets/postcards/shiba_1.png'),
  shiba_2: require('../../assets/postcards/shiba_2.png'),
  shiba_3: require('../../assets/postcards/shiba_3.png'),
  shiba_4: require('../../assets/postcards/shiba_4.png'),
  duck_1: require('../../assets/postcards/duck_1.png'),
  duck_2: require('../../assets/postcards/duck_2.png'),
  duck_3: require('../../assets/postcards/duck_3.png'),
  duck_4: require('../../assets/postcards/duck_4.png'),
};

export function postcard(pic: PictureId): ImageSourcePropType {
  return IMAGES[pictureKey(pic)];
}
