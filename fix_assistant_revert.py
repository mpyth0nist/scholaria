import re

with open('/home/maliki/Desktop/scholaria/frontend/src/components/EdahAIAssistant.jsx', 'r') as f:
    content = f.read()

# Revert imports
content = content.replace("import ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';\nimport rehypeRaw from 'rehype-raw';", 
                          "import ReactMarkdown from 'react-markdown';")

# Revert markdown rendering
content = content.replace("<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.content}</ReactMarkdown>",
                          "<ReactMarkdown>{msg.content}</ReactMarkdown>")

with open('/home/maliki/Desktop/scholaria/frontend/src/components/EdahAIAssistant.jsx', 'w') as f:
    f.write(content)

