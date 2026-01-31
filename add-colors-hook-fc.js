#!/usr/bin/env node

const fs = require('fs');

const filesToFix = [
  'src/components/CategoryChart.tsx',
  'src/components/ContributionCalendar.tsx',
  'src/components/ExerciseCard.tsx',
  'src/components/ExerciseFrequencyList.tsx',
  'src/components/ExerciseSelectionModal.tsx',
  'src/components/ProgressBar.tsx',
  'src/components/StatCard.tsx',
  'src/components/TimeRangeSelector.tsx',
  'src/components/WorkoutHeader.tsx',
  'src/components/WorkoutTrendChart.tsx',
  'src/screens/ExerciseProgressScreen.tsx',
  'src/screens/StatsScreen.tsx',
];

function addColorsHook(filepath) {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Check if already has the hook
    if (content.includes('const { colors } = useTheme()')) {
      console.log(`- Already has hook: ${filepath}`);
      return false;
    }
    
    // Find the component function - match React.FC pattern
    const fcMatch = content.match(/(const|export const) \w+: React\.FC[^=]*= \([^)]*\) => \{/);
    if (fcMatch) {
      const openBrace = content.indexOf('{', fcMatch.index + fcMatch[0].length - 1);
      const insertPos = openBrace + 1;
      
      content = content.slice(0, insertPos) + '\n  const { colors } = useTheme();' + content.slice(insertPos);
      
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`✓ Added hook: ${filepath}`);
      return true;
    }
    
    console.log(`! Could not find React.FC pattern in ${filepath}`);
    return false;
  } catch (error) {
    console.error(`✗ Error: ${filepath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('Adding colors hook to React.FC components...\n');
  
  let added = 0;
  let skipped = 0;

  for (const file of filesToFix) {
    if (!fs.existsSync(file)) {
      console.log(`! File not found: ${file}`);
      continue;
    }

    if (addColorsHook(file)) {
      added++;
    } else {
      skipped++;
    }
  }

  console.log(`\n==============================`);
  console.log(`Added hooks: ${added}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`==============================\n`);
}

main();
