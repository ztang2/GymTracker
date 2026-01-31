#!/usr/bin/env node

const fs = require('fs');

const filesToFix = [
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
  'src/components/ActionButton.tsx',
  'src/components/DailyProgressBar.tsx',
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
];

function fixFile(filepath) {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Find StyleSheet.create block
    const stylesheetMatch = content.match(/const styles = StyleSheet\.create\(\{/);
    if (!stylesheetMatch) {
      console.log(`- No StyleSheet.create found in ${filepath}`);
      return false;
    }
    
    // Strategy: Convert StyleSheet.create to a function that takes colors
    // Find the entire StyleSheet block
    const startIndex = stylesheetMatch.index;
    let braceCount = 0;
    let inStylesheet = false;
    let endIndex = -1;
    
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inStylesheet = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inStylesheet && braceCount === 0) {
          endIndex = i + 2; // Include the closing );
          break;
        }
      }
    }
    
    if (endIndex === -1) {
      console.log(`! Could not find end of StyleSheet in ${filepath}`);
      return false;
    }
    
    const stylesheetBlock = content.substring(startIndex, endIndex);
    
    // Convert to a function
    const newStylesheetBlock = stylesheetBlock.replace(
      'const styles = StyleSheet.create(',
      'const createStyles = (colors: any) => StyleSheet.create('
    );
    
    content = content.substring(0, startIndex) + newStylesheetBlock + content.substring(endIndex);
    
    // Now add const styles = createStyles(colors); after the colors hook
    const colorsHookMatch = content.match(/const \{ colors \} = useTheme\(\);/);
    if (colorsHookMatch) {
      const insertPos = colorsHookMatch.index + colorsHookMatch[0].length;
      content = content.slice(0, insertPos) + '\n  const styles = createStyles(colors);' + content.slice(insertPos);
    } else {
      console.log(`! No colors hook found in ${filepath}`);
      return false;
    }
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✓ Fixed: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`✗ Error fixing ${filepath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('Fixing StyleSheet.create to use dynamic colors...\n');
  
  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of filesToFix) {
    if (!fs.existsSync(file)) {
      console.log(`! File not found: ${file}`);
      errors++;
      continue;
    }

    const result = fixFile(file);
    if (result === true) {
      fixed++;
    } else {
      skipped++;
    }
  }

  console.log(`\n==============================`);
  console.log(`Total files: ${filesToFix.length}`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`==============================\n`);
}

main();
