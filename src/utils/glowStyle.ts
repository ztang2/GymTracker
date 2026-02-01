import { Platform } from 'react-native';

// Creates a color-matched glow effect for colored elements
// size: 'sm' | 'md' | 'lg' for different intensities
export function colorGlow(color: string, size: 'sm' | 'md' | 'lg' = 'md') {
  const configs = {
    sm: { spread: 5, blur: 10, opacity: '44', outerBlur: 20, outerOpacity: '22' },
    md: { spread: 7, blur: 16, opacity: '55', outerBlur: 32, outerOpacity: '30' },
    lg: { spread: 10, blur: 22, opacity: '66', outerBlur: 40, outerOpacity: '35' },
  };
  const c = configs[size];
  if (Platform.OS === 'web') {
    return { boxShadow: `0 0 ${c.blur}px ${c.spread}px ${color}${c.opacity}, 0 0 ${c.outerBlur}px ${Math.round(c.spread * 1.6)}px ${color}${c.outerOpacity}` } as any;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: parseInt(c.opacity, 16) / 255,
    shadowRadius: c.blur,
    elevation: size === 'lg' ? 16 : size === 'md' ? 12 : 8,
  };
}
