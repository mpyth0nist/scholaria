import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Replace bg-white/60 with its dark variant (if it exists) to bg-surface
    content = re.sub(r'bg-white/60\s+dark:bg-\[#1A1E1A\]/80', 'bg-surface', content)
    content = re.sub(r'bg-white/60\s+dark:bg-\[#1A1E1A\]/60', 'bg-surface', content)
    content = re.sub(r'bg-white/60', 'bg-surface', content)
    
    # Replace bg-white/40
    content = re.sub(r'bg-white/40\s+dark:bg-\[#1A1E1A\]/60', 'bg-surface', content)
    content = re.sub(r'bg-white/40', 'bg-surface', content)

    # Replace border-primary/20 with border-border
    # content = re.sub(r'border-primary/20', 'border-border', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('/home/maliki/Desktop/scholaria/frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
