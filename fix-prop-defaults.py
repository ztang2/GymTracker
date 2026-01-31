#!/usr/bin/env python3

import re

# StatCard fix
with open('src/components/StatCard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  gradientColors = colors.gradientPurplePink,\n  backgroundColor = colors.cardBackground,',
    '  gradientColors,\n  backgroundColor,'
)

# Add local vars after hook
content = re.sub(
    r'(const \{ colors \} = useTheme\(\);)\n  (const styles = createStyles\(colors\);)',
    r'\1\n  \2\n  const gradColors = gradientColors || colors.gradientPurplePink;\n  const bgColor = backgroundColor || colors.cardBackground;',
    content
)

# Replace usage
content = content.replace('colors={gradientColors}', 'colors={gradColors}')
content = content.replace('backgroundColor: backgroundColor', 'backgroundColor: bgColor')

with open('src/components/StatCard.tsx', 'w') as f:
    f.write(content)

print('Fixed StatCard.tsx')

# UserProfileCard fix
with open('src/components/UserProfileCard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  gradientColors = colors.gradientPurplePink,',
    '  gradientColors,'
)

content = re.sub(
    r'(const \{ colors \} = useTheme\(\);)\n  (const styles = createStyles\(colors\);)',
    r'\1\n  \2\n  const gradColors = gradientColors || colors.gradientPurplePink;',
    content
)

content = content.replace('colors={gradientColors}', 'colors={gradColors}')

with open('src/components/UserProfileCard.tsx', 'w') as f:
    f.write(content)

print('Fixed UserProfileCard.tsx')

# WorkoutHistoryCard fix
with open('src/components/WorkoutHistoryCard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  accentColor = colors.purple,',
    '  accentColor,'
)

content = re.sub(
    r'(const \{ colors \} = useTheme\(\);)\n  (const styles = createStyles\(colors\);)',
    r'\1\n  \2\n  const accent = accentColor || colors.purple;',
    content
)

content = content.replace('backgroundColor: accentColor', 'backgroundColor: accent')
content = content.replace('borderColor: accentColor', 'borderColor: accent')

with open('src/components/WorkoutHistoryCard.tsx', 'w') as f:
    f.write(content)

print('Fixed WorkoutHistoryCard.tsx')

# MonthCalendar fix
with open('src/components/MonthCalendar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  todayIndicatorColor = colors.pink,\n  workoutIndicatorColor = colors.teal,',
    '  todayIndicatorColor,\n  workoutIndicatorColor,'
)

content = re.sub(
    r'(const \{ colors \} = useTheme\(\);)\n  (const styles = createStyles\(colors\);)',
    r'\1\n  \2\n  const todayColor = todayIndicatorColor || colors.pink;\n  const workoutColor = workoutIndicatorColor || colors.teal;',
    content
)

# Replace usage
content = re.sub(r'shadowColor: todayIndicatorColor', 'shadowColor: todayColor', content)
content = re.sub(r'backgroundColor: todayIndicatorColor', 'backgroundColor: todayColor', content)
content = re.sub(r'backgroundColor: workoutIndicatorColor', 'backgroundColor: workoutColor', content)
content = re.sub(r'borderColor: workoutIndicatorColor', 'borderColor: workoutColor', content)

with open('src/components/MonthCalendar.tsx', 'w') as f:
    f.write(content)

print('Fixed MonthCalendar.tsx')

# ProgressBar fix
with open('src/components/ProgressBar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  color = colors.gradientPurplePink,',
    '  color,'
)

content = re.sub(
    r'(const \{ colors \} = useTheme\(\);)\n  (const styles = createStyles\(colors\);)',
    r'\1\n  \2\n  const barColor = color || colors.gradientPurplePink;',
    content
)

# Replace in conditional
content = re.sub(r'Array\.isArray\(color\)', 'Array.isArray(barColor)', content)
content = re.sub(r'color as any', 'barColor as any', content)

with open('src/components/ProgressBar.tsx', 'w') as f:
    f.write(content)

print('Fixed ProgressBar.tsx')

# ContributionCalendar fix
with open('src/components/ContributionCalendar.tsx', 'r') as f:
    content = f.read()

# Find and replace the colorScale default
content = re.sub(
    r'  colorScale = \[\s+colors\.calendarEmpty,\s+colors\.calendarLevel1,\s+colors\.calendarLevel2,\s+colors\.calendarLevel3,\s+\],',
    '  colorScale,',
    content,
    flags=re.MULTILINE
)

# Add default inside component
content = re.sub(
    r'(const \{ colors \} = useTheme\(\);)\n  (const styles = createStyles\(colors\);)',
    r'\1\n  \2\n  const scale = colorScale || [colors.calendarEmpty, colors.calendarLevel1, colors.calendarLevel2, colors.calendarLevel3];',
    content
)

# Replace usage
content = re.sub(r'colorScale\[', 'scale[', content)

with open('src/components/ContributionCalendar.tsx', 'w') as f:
    f.write(content)

print('Fixed ContributionCalendar.tsx')
