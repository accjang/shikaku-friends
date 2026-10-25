// 마을 소품 이미지(술래잡기 게임 소품 3D 모델을 tools/render_props.mjs로 렌더한 것).
import type { ImageSourcePropType } from 'react-native';

import type { PropId } from '@/core/village';

const IMAGES: Record<PropId, ImageSourcePropType> = {
  flowers: require('../../assets/props/flowers.png'),
  bunting: require('../../assets/props/bunting.png'),
  bush: require('../../assets/props/bush.png'),
  signpost: require('../../assets/props/signpost.png'),
  lamp: require('../../assets/props/lamp.png'),
  bench: require('../../assets/props/bench.png'),
  tree: require('../../assets/props/tree.png'),
  picnic: require('../../assets/props/picnic.png'),
  stump: require('../../assets/props/stump.png'),
  fence: require('../../assets/props/fence.png'),
  cattails: require('../../assets/props/cattails.png'),
  lilypad: require('../../assets/props/lilypad.png'),
  rock: require('../../assets/props/rock.png'),
  barrel: require('../../assets/props/barrel.png'),
  log: require('../../assets/props/log.png'),
  bamboo: require('../../assets/props/bamboo.png'),
  well: require('../../assets/props/well.png'),
  willow: require('../../assets/props/willow.png'),
  bigtree: require('../../assets/props/bigtree.png'),
  house: require('../../assets/props/house.png'),
};

export function propImage(id: PropId): ImageSourcePropType {
  return IMAGES[id];
}
