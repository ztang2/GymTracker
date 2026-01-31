#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/screens/AchievementsScreen.tsx',
  'src/screens/ActiveWorkoutScreen.tsx',
  'src/screens/CalendarScreen.tsx',
  'src/screens/ExerciseProgressScreen.tsx',
  'src/screens/GoalSettingScreen.tsx',
  'src/screens/ProgressScreen.tsx',
  'src/screens/SignUpScreen.tsx',
  'src/screens/StatsScreen.tsx',
  'src/screens/TemplateListScreen.tsx',
  'src/screens/ExerciseDetailScreen.tsx',
  'src/screens/ExerciseSelectionScreen.tsx',
  'src/screens/ExerciseListScreen.tsx',
  'src/screens/WorkoutDetailScreen.tsx',
  'src/screens/WorkoutScreen.tsx',
  'src/components/ActionButton.tsx',
  'src/components/BadgeCard.tsx',
  'src/components/BadgeUnlockedModal.tsx',
  'src/components/CategoryChart.tsx',
  'src/components/ContributionCalendar.tsx',
  'src/components/DailyProgressBar.tsx',
  'src/components/ExerciseCard.tsx',
  'src/components/ExerciseFrequencyList.tsx',
  'src/components/ExerciseSelectionModal.tsx',
  'src/components/GoalProgressCard.tsx',
  'src/components/LevelBadge.tsx',
  'src/components/MonthCalendar.tsx',
  'src/components/MonthlyOverview.tsx',
  'src/components/MuscleGroupDistribution.tsx',
  'src/components/PRBadge.tsx',
  'src/components/PRCelebrationModal.tsx',
  'src/components/ProgressBar.tsx',
  'src/components/SaveAsTemplateModal.tsx',
  'src/components/StatCard.tsx',
  'src/components/TimeRangeSelector.tsx',
  'src/components/VolumeTrendChart.tsx',
  'src/components/WorkoutHeader.tsx',
  'src/components/WorkoutHistoryCard.tsx',
  'src/components/WorkoutSummaryModal.tsx',
  'src/components/WorkoutTrendChart.tsx',
  'src/components/XPProgressBar.tsx',
  'src/components/UserProfileCard.tsx',
];

function updateFile(filepath) {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    // Step 1: Add useTheme to context imports or create new import
    if (!content.includes('useTheme')) {
      const contextImportMatch = content.match(/(import\s+\{[^}]+\}\s+from\s+['"]\.\.\/contexts['"]);/);
      
      if (contextImportMatch) {
        // Add useTheme to existing import
        const oldImport = contextImportMatch[1];
        let newImport = oldImport.replace(/\}/, ', useTheme }');
        // Handle case where there's no space before }
        if (!newImport.includes('useTheme')) {
          newImport = oldImport.replace(/\}\s/, ', useTheme } ');
        }
        content = content.replace(oldImport, newImport);
        modified = true;
      } else {
        // Add new context import after react imports
        const reactImportEnd = content.indexOf("';", content.indexOf("from 'react"));
        if (reactImportEnd > -1) {
          const insertPos = content.indexOf('\n', reactImportEnd) + 1;
          content = content.slice(0, insertPos) + "import { useTheme } from '../contexts';\n" + content.slice(insertPos);
          modified = true;
        }
      }
    }

    // Step 2: Remove colors from theme imports (keep other imports)
    const themeImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/constants\/theme['"];/);
    if (themeImportMatch) {
      const fullImport = themeImportMatch[0];
      const imports = themeImportMatch[1];
      
      // Split imports and remove 'colors'
      const importList = imports.split(',').map(s => s.trim()).filter(s => s !== 'colors' && s !== '');
      
      if (importList.length > 0) {
        const newImport = `import { ${importList.join(', ')} } from '../constants/theme';`;
        content = content.replace(fullImport, newImport);
        modified = true;
      } else {
        // Remove entire import line if only colors was imported
        const lineStart = content.lastIndexOf('\n', content.indexOf(fullImport));
        const lineEnd = content.indexOf('\n', content.indexOf(fullImport)) + 1;
        content = content.slice(0, lineStart + 1) + content.slice(lineEnd);
        modified = true;
      }
    }

    // Step 3: Add const { colors } = useTheme(); hook
    if (!content.includes('const { colors } = useTheme()') && !content.includes('const {colors} = useTheme()')) {
      // Find the component function
      const funcMatch = content.match(/export default function \w+\([^)]*\)\s*{/);
      if (funcMatch) {
        const openBrace = content.indexOf('{', funcMatch.index + funcMatch[0].length - 1);
        
        // Find the best place to insert (after existing hooks)
        const afterBrace = content.slice(openBrace + 1, openBrace + 500);
        const useAuthMatch = afterBrace.match(/const \{[^}]+\} = useAuth\(\);/);
        
        let insertPos = openBrace + 1;
        if (useAuthMatch) {
          insertPos = openBrace + 1 + afterBrace.indexOf(useAuthMatch[0]) + useAuthMatch[0].length;
        }
        
        // Insert the hook
        content = content.slice(0, insertPos) + '\n  const { colors } = useTheme();' + content.slice(insertPos);
        modified = true;
      }
    }

    // Step 4: Update StyleSheet.create to use dynamic colors where static colors were used
    // Replace hardcoded colors.* in styles with dynamic injection
    // This is trickier and might need manual review, so we'll skip for now

    if (modified) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`✓ Updated: ${filepath}`);
      return true;
    } else {
      console.log(`- Skipped (no changes needed): ${filepath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error updating ${filepath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('Updating files to use theme context...\n');
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of filesToUpdate) {
    if (!fs.existsSync(file)) {
      console.log(`! File not found: ${file}`);
      errors++;
      continue;
    }

    const result = updateFile(file);
    if (result === true) {
      updated++;
    } else if (result === false) {
      skipped++;
    } else {
      errors++;
    }
  }

  console.log(`\n==============================`);
  console.log(`Total files: ${filesToUpdate.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`==============================\n`);
  console.log('Next steps:');
  console.log('1. Review the changes');
  console.log('2. Run: npx tsc --noEmit');
  console.log('3. Test the app');
}

main();
