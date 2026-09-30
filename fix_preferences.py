import re

with open('/home/maliki/Desktop/scholaria/frontend/src/pages/courses/lessons/LessonPage.jsx', 'r') as f:
    content = f.read()

# Remove the Theme selector section
regex = r"\s*\{\/\* Theme selector \*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*\))"
content = re.sub(regex, "", content)

# Also fix the grid-cols from 3 to 2 because we removed one column
content = content.replace('className="grid grid-cols-1 sm:grid-cols-3 gap-4"', 'className="grid grid-cols-1 sm:grid-cols-2 gap-4"')

with open('/home/maliki/Desktop/scholaria/frontend/src/pages/courses/lessons/LessonPage.jsx', 'w') as f:
    f.write(content)

