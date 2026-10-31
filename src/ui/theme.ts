// 디자인 토큰. 크림 바탕 + 파스텔 네모 + 진한 보라 글자. 캐릭터마다 챕터 색이 있다.
import type { CharacterId } from '@/core/chapters';

export const colors = {
  bg: '#FFF1E2',
  card: '#FFFFFF',
  ink: '#4B3F6B',
  inkSoft: '#8C80A8',
  line: '#EADFD3',
  cell: '#FFFDF9',
  cellLine: '#EFE4D8',
  primary: '#FF7FA3',
  primaryDark: '#E9658B',
  gold: '#FFC23D',
  goldDark: '#E8A20C',
  bad: '#D8D2E0',
  badLine: '#A79DBA',
  /** 실수(정답이 아닌 네모)·잃은 하트. */
  mistake: '#F0566E',
  mistakeSoft: 'rgba(240,86,110,0.22)',
  overlay: 'rgba(60, 45, 80, 0.45)',
  white: '#FFFFFF',
} as const;

/** 맞게 놓은 네모의 색(숫자 순서대로 돌아가며). */
export const RECT_PALETTE = ['#FFC4D6', '#FFE0A3', '#B8E6C9', '#BFD7FF', '#D9C8FF', '#FFD1B3', '#B3EBEB', '#F5C2E7'] as const;
/** 위 색의 진한 테두리. */
export const RECT_PALETTE_EDGE = ['#F59BB8', '#F2C163', '#7FCB9C', '#8DB4F2', '#B39BF0', '#F5A97A', '#72CFCF', '#E393CB'] as const;

export const CHARACTER_THEME: Record<CharacterId, { main: string; soft: string; dark: string }> = {
  cat: { main: '#B9B0DA', soft: '#ECE8F8', dark: '#7D70AE' },
  panda: { main: '#9ED9B5', soft: '#E3F5EA', dark: '#4E9E70' },
  rabbit: { main: '#FFB3C7', soft: '#FFE8EE', dark: '#E07597' },
  shiba: { main: '#FFC48F', soft: '#FFF0E0', dark: '#D9792E' },
  duck: { main: '#FFE27A', soft: '#FFF9DC', dark: '#C9A21A' },
};

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** 둥근 글꼴 이름. 실제 파일은 언어에 따라 Jua 또는 Nunito(src/ui/fonts.ts, 둘 다 OFL). 없는 글자는 기기 글꼴로 대신 그린다. */
export const FONT = { round: 'Round' } as const;

export const shadow = {
  shadowColor: '#7A5C8C',
  shadowOpacity: 0.16,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
} as const;
