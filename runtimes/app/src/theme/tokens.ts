import { Platform } from 'react-native'

export const colors = {
  canvas: '#F3F5F2',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF0EA',
  ink: '#14211A',
  inkSoft: '#3D4A42',
  muted: '#5E6B62',
  faint: '#87938A',
  line: '#D8E0D8',
  lineStrong: '#BFCBC2',
  brand: '#174E8C',
  brandInk: '#FFFFFF',
  brandSoft: '#E7EFF9',
  brandSoftStrong: '#CFE0F5',
  success: '#17654B',
  successSoft: '#E3F2EA',
  warning: '#7A4E00',
  warningSoft: '#FBF0DC',
  danger: '#9E2A2B',
  dangerSoft: '#FBE7E7',
  focus: '#1F6FEB',
  dark: '#15211A',
  darkInk: '#F4F7F4'
} as const

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
} as const

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999
} as const

export const font = {
  display: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: "Georgia, 'Iowan Old Style', 'Times New Roman', serif"
  }) as string,
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
} as const

export const shadow = {
  card: '0 1px 2px rgba(20, 33, 26, 0.05), 0 10px 28px rgba(20, 33, 26, 0.055)',
  raised: '0 2px 4px rgba(20, 33, 26, 0.06), 0 16px 40px rgba(20, 33, 26, 0.10)'
} as const

export const breakpoints = {
  sm: 480,
  md: 720,
  lg: 960,
  xl: 1180
} as const
