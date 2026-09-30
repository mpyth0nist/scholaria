import re

with open('/home/maliki/Desktop/scholaria/frontend/src/pages/courses/lessons/LessonPage.jsx', 'r') as f:
    content = f.read()

# Fix Teacher Buttons
content = content.replace(
    'className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white px-4 py-2 text-sm font-semibold rounded-lg transition-colors"',
    'className="bg-surface text-text border border-border hover:bg-surface-hover px-4 py-2 text-sm font-semibold rounded-lg transition-colors"'
)
content = content.replace(
    'className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"',
    'className="bg-surface text-danger border border-danger/20 hover:bg-danger/10 px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"'
)

# Fix Ask Edah / Aa View
content = re.sub(
    r"className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press \$\{showAI \? '[^']+' : '[^']+'\}`}",
    r"className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press ${showAI ? 'bg-action text-white shadow-sm border-action/20' : 'bg-surface border-border text-action hover:bg-surface-hover'}`}",
    content
)
content = re.sub(
    r"className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press \$\{showPrefs \? '[^']+' : '[^']+'\}`}",
    r"className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition btn-press ${showPrefs ? 'bg-primary text-white shadow-sm border-primary/20' : 'bg-surface border-border text-muted hover:bg-surface-hover'}`}",
    content
)

with open('/home/maliki/Desktop/scholaria/frontend/src/pages/courses/lessons/LessonPage.jsx', 'w') as f:
    f.write(content)
