#!/usr/bin/env python3
"""
Script to help update React Native files to use theme context
"""

import os
import re
from pathlib import Path

# Directories to process
DIRS = [
    'src/screens',
    'src/components',
]

# Base path
BASE_PATH = Path('/Users/zhuorantang/GymTracker')

def update_imports(content):
    """Update theme imports to add useTheme hook"""
    # Already has useTheme
    if 'useTheme' in content:
        return content, False
    
    # Find the line with theme imports
    theme_import_pattern = r"from\s+['\"]\.\.\/constants\/theme['\"];"
    theme_import_match = re.search(theme_import_pattern, content)
    
    if not theme_import_match:
        return content, False
    
    # Check if it imports colors
    if 'colors,' not in content and '{ colors }' not in content:
        return content, False
    
    # Find context imports
    context_import_pattern = r"(import\s+\{[^}]+\}\s+from\s+['\"]\.\.\/contexts['\"];)"
    context_import_match = re.search(context_import_pattern, content)
    
    if context_import_match:
        # Add useTheme to existing context import
        context_line = context_import_match.group(1)
        if 'useTheme' not in context_line:
            new_context_line = context_line.replace('from', ', useTheme } from').replace('} ', '')
            if '} from' not in new_context_line:
                new_context_line = context_line.replace('}', ', useTheme }')
            content = content.replace(context_line, new_context_line)
    else:
        # Add new context import after react imports
        react_import_end = content.find("';", content.find("from 'react")) + 2
        if react_import_end > 1:
            insert_pos = content.find('\n', react_import_end) + 1
            content = content[:insert_pos] + "import { useTheme } from '../contexts';\n" + content[insert_pos:]
    
    # Remove colors from theme import
    old_import = theme_import_match.group(0)
    old_import_full = content[content.rfind('import', 0, theme_import_match.start()):theme_import_match.end()]
    
    # Extract imports
    imports_match = re.search(r'\{([^}]+)\}', old_import_full)
    if imports_match:
        imports = [i.strip() for i in imports_match.group(1).split(',')]
        # Remove 'colors'
        imports = [i for i in imports if i != 'colors']
        
        if imports:
            new_import_list = ', '.join(imports)
            new_import = f"import {{ {new_import_list} }} from '../constants/theme';"
            content = content.replace(old_import_full, new_import)
        else:
            # Remove the entire import line
            content = content.replace(old_import_full + '\n', '')
    
    return content, True

def add_theme_hook(content):
    """Add const { colors } = useTheme(); after other hooks"""
    # Check if already has it
    if 'const { colors } = useTheme()' in content or 'const {colors} = useTheme()' in content:
        return content, False
    
    # Check if this is a functional component
    if 'export default function' not in content and 'export function' not in content:
        return content, False
    
    # Find the component function
    func_match = re.search(r'export default function \w+\([^)]*\)', content)
    if not func_match:
        return content, False
    
    # Find the opening brace
    brace_pos = content.find('{', func_match.end())
    if brace_pos == -1:
        return content, False
    
    # Find where to insert (after existing hooks)
    insert_pos = brace_pos + 1
    
    # Look for existing hooks
    hook_patterns = [
        r'const \{[^}]+\} = useAuth\(\)',
        r'const \{[^}]+\} = useState',
        r'const \w+ = useState',
    ]
    
    for pattern in hook_patterns:
        matches = list(re.finditer(pattern, content[brace_pos:brace_pos + 500]))
        if matches:
            last_match = matches[-1]
            line_end = content.find(';', brace_pos + last_match.end())
            if line_end != -1:
                insert_pos = line_end + 1
    
    # Insert the hook
    indent = '\n  '
    new_hook = f'{indent}const {{ colors }} = useTheme();'
    content = content[:insert_pos] + new_hook + content[insert_pos:]
    
    return content, True

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Step 1: Update imports
        content, imports_changed = update_imports(content)
        
        # Step 2: Add theme hook
        content, hook_added = add_theme_hook(content)
        
        if content != original:
            # with open(filepath, 'w', encoding='utf-8') as f:
            #     f.write(content)
            print(f"Would update: {filepath}")
            print(f"  - Imports changed: {imports_changed}")
            print(f"  - Hook added: {hook_added}")
            return True
        
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function"""
    files_to_update = []
    
    for dir_name in DIRS:
        dir_path = BASE_PATH / dir_name
        if not dir_path.exists():
            continue
        
        for tsx_file in dir_path.glob('*.tsx'):
            # Skip index files
            if tsx_file.name == 'index.ts' or tsx_file.name == 'index.tsx':
                continue
            
            if process_file(tsx_file):
                files_to_update.append(str(tsx_file))
    
    print(f"\nTotal files that need updates: {len(files_to_update)}")
    for f in files_to_update:
        print(f"  - {f}")

if __name__ == '__main__':
    main()
