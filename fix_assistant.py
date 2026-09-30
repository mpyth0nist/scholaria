import re

with open('/home/maliki/Desktop/scholaria/frontend/src/components/EdahAIAssistant.jsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace("import ReactMarkdown from 'react-markdown';", 
                          "import ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';\nimport rehypeRaw from 'rehype-raw';")

# Fix background color
content = content.replace("bg-[#FAF6EE]/90 backdrop-blur-xl border border-primary/20 shadow-2xl",
                          "bg-surface backdrop-blur-xl border border-border shadow-2xl")

# Fix width constraints on container
content = content.replace("lg:h-[calc(100vh-8rem)] lg:w-[350px] xl:w-[400px] lg:rounded-2xl lg:shrink-0 lg:ml-6",
                          "lg:h-[calc(100vh-8rem)] lg:w-[400px] xl:w-[450px] lg:rounded-2xl lg:shrink-0 lg:ml-6")

# Fix chat bubble width (let AI bubbles be full width so tables fit)
content = re.sub(
    r"<div className={`\n\s*max-w-\[85%\] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm\n\s*\$\{msg\.role === 'user' \n\s*\? 'bg-action text-white rounded-br-sm whitespace-pre-wrap' \n\s*: `bg-white dark:bg-\[#2D332D\] text-text dark:text-white border border-primary/10 rounded-bl-sm \$\{CHAT_PROSE\}`\}",
    r"<div className={`\n                                rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm\n                                ${msg.role === 'user' \n                                    ? 'max-w-[85%] bg-action text-white rounded-br-sm whitespace-pre-wrap' \n                                    : `max-w-full bg-surface text-text border border-border rounded-bl-sm overflow-x-auto ${CHAT_PROSE}`}",
    content
)

# Fix loading bubble background
content = content.replace("max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-4 bg-white dark:bg-[#2D332D] text-text border border-primary/10",
                          "max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-4 bg-surface text-text border border-border")

# Fix markdown rendering
content = content.replace("<ReactMarkdown>{msg.content}</ReactMarkdown>",
                          "<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.content}</ReactMarkdown>")

# Enhance CHAT_PROSE for tables
prose_table_css = " [&_table]:w-full [&_table]:text-left [&_table]:border-collapse [&_th]:border-b [&_th]:border-border [&_th]:p-2 [&_th]:bg-primary/5 [&_td]:border-b [&_td]:border-border/50 [&_td]:p-2"
content = content.replace("const CHAT_PROSE = `", f"const CHAT_PROSE = `{prose_table_css}")

with open('/home/maliki/Desktop/scholaria/frontend/src/components/EdahAIAssistant.jsx', 'w') as f:
    f.write(content)

