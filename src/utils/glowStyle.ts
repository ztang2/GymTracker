import { Platform } from 'react-native';

// Minimal shadow for depth - monochrome design
// No colored glows, just subtle black shadows
export function colorGlow(_color: string, size: 'sm' | 'md' | 'lg' = 'md') {
  const configs = {
    sm: { blur: 4, opacity: 0.1 },
    md: { blur: 8, opacity: 0.15 },
    lg: { blur: 12, opacity: 0.2 },
  };
  const c = configs[size];
  
  if (Platform.OS === 'web') {
    return { 
      boxShadow: `0 2px ${c.blur}px rgba(0, 0, 0, ${c.opacity})` 
    } as Record<string, string>;
  }
  
  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: c.opacity,
    shadowRadius: c.blur / 2,
    elevation: size === 'lg' ? 8 : size === 'md' ? 4 : 2,
  };
}
