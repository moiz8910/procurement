import os
import re
from pathlib import Path

def replace_colors(src_dir):
    updated_files = 0
    for path in Path(src_dir).rglob('*'):
        if path.is_file() and path.suffix in ['.jsx', '.js', '.css', '.html']:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original = content
            
            # Replace slate-950, 900, 800 with blue-950, blue-900, blue-800 (Navy Blue)
            content = re.sub(r'slate-950', 'blue-950', content)
            content = re.sub(r'slate-900', 'blue-900', content)
            content = re.sub(r'slate-800', 'blue-800', content)
            
            # Replace rest of slate- with neutral- (Natural Grey)
            content = re.sub(r'slate-', 'neutral-', content)

            if original != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {path.name}")
                updated_files += 1
                
    print(f"Update complete. Modified {updated_files} files.")

if __name__ == '__main__':
    replace_colors(r'c:\Users\Yogendran\Desktop\Procurement\procurement\frontend\src')
