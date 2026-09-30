import re

with open('/home/maliki/Desktop/scholaria/frontend/src/pages/courses/lessons/LessonPage.jsx', 'r') as f:
    content = f.read()

# 1. Remove readTheme state
content = re.sub(r"const \[readTheme, setReadTheme\] = useState\('cream'\)\s*// cream, sepia, night\n", "", content)

# 2. Remove themeClasses map
theme_classes_regex = r"    // Map reader themes\n    const themeClasses = \{\n        cream: '[^']+',\n        sepia: '[^']+',\n        night: '[^']+'\n    \}\[readTheme\]\n"
content = re.sub(theme_classes_regex, "", content)

# 3. Update readerCardClasses
content = content.replace("const readerCardClasses = `flex flex-col rounded-xl border p-5 sm:p-8 transition-all duration-300 max-w-prose w-full mx-auto ${themeClasses} ${fontClasses} ${sizeClasses}`",
                          "const readerCardClasses = `flex flex-col rounded-xl border p-5 sm:p-8 transition-all duration-300 max-w-prose w-full mx-auto bg-surface border-border text-text shadow-sm ${fontClasses} ${sizeClasses}`")

# 4. Remove theme selector from preferencesPanel
theme_selector_regex = r"                \{/\* Theme selector \*/\}.*?(?=                \{/\* Size selector \*/\})"
content = re.sub(theme_selector_regex, "", content, flags=re.DOTALL)

# 5. Remove setReadTheme from Reset button
content = content.replace("setReadTheme('cream')\n                        ", "")

with open('/home/maliki/Desktop/scholaria/frontend/src/pages/courses/lessons/LessonPage.jsx', 'w') as f:
    f.write(content)
