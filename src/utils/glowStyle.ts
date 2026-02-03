import { Platform } from 'react-native';

// Refined shadow for depth - minimal, Apple-like
export function colorGlow(_color: string, size: 'sm' | 'md' | 'lg' = 'md') {
  const configs = {
    sm: { blur: 4, opacity: 0.04, offset: 1 },
    md: { blur: 8, opacity: 0.06, offset: 2 },
    lg: { blur: 16, opacity: 0.08, offset: 4 },
  };
  const c = configs[size];
  
  if (Platform.OS === 'web') {
    return { 
      boxShadow: `0 ${c.offset}px ${c.blur}px rgba(0, 0, 0, ${c.opacity})` 
    } as Record<string, string>;
  }
  
  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: c.offset },
    shadowOpacity: c.opacity,
    shadowRadius: c.blur / 2,
    elevation: size === 'lg' ? 4 : size === 'md' ? 2 : 1,
  };
}
