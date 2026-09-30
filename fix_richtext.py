import re

filepath = '/home/maliki/Desktop/scholaria/frontend/src/components/RichTextEditor.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace fixLessonColors logic
new_fix_logic = """const fixLessonColors = (html) => {
    if (!html) return ''

    // Also handle rgb() format that browsers emit from execCommand
    const RGB_TO_HEX = {
        'rgb(241, 245, 249)': '#f1f5f9',
        'rgb(148, 163, 184)': '#94a3b8',
        'rgb(167, 139, 250)': '#a78bfa',
        'rgb(56, 189, 248)':  '#38bdf8',
        'rgb(52, 211, 153)':  '#34d399',
        'rgb(251, 191, 36)':  '#fbbf24',
        'rgb(251, 113, 133)': '#fb7185',
        'rgb(251, 146, 60)':  '#fb923c',
    }

    let fixed = html
    Object.entries(RGB_TO_HEX).forEach(([rgb, hex]) => {
        fixed = fixed.replaceAll(rgb, hex)
    })

    // STRIP inline default text colors so they inherit properly from the parent theme
    // Both old 'white' and new 'dark green' are considered default text.
    fixed = fixed.replace(/style="[^"]*color:\s*(?:#f1f5f9|#132A13|#132a13)[^"]*"/gi, '')
    
    // Convert remaining old light palette colors to semantic classes or just strip them.
    // We'll strip them for now to let Tailwind prose handle it, or leave them as is.
    // The main issue is the default text color ruining dark mode.
    Object.entries(LIGHT_TO_DARK).forEach(([light, dark]) => {
        if (light === '#f1f5f9') return; // Handled above
        const re = new RegExp(light, 'gi')
        // We'll map them to the dark ones for light mode, but honestly standard colors are better.
        // Let's just keep the existing mapping for the accent colors.
        fixed = fixed.replace(re, dark)
    })

    return fixed
}"""

content = re.sub(r'const fixLessonColors = \(html\) => \{.*?\n\}', new_fix_logic, content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)
