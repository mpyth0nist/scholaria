const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const replacements = [
  // Backgrounds for Cards and containers
  [/bg-slate-800\/[0-9]+/g, 'bg-white/60'],
  [/bg-slate-900\/[0-9]+/g, 'bg-white/60'],
  [/bg-slate-800/g, 'bg-white/60'],
  [/bg-slate-900/g, 'bg-background'],
  [/bg-\[\#13152a\]/g, 'bg-background'],
  [/bg-\[\#0d0f1e\]/g, 'bg-background'],
  [/bg-\[\#2a2a2a\]/g, 'bg-white/60'],
  
  // Borders
  [/border-slate-700\/[0-9]+/g, 'border-primary/20'],
  [/border-slate-700/g, 'border-primary/20'],
  [/border-slate-600\/[0-9]+/g, 'border-primary/20'],
  [/border-slate-600/g, 'border-primary/20'],
  [/border-\[\#3a3a3a\]/g, 'border-primary/20'],
  
  // Secondary Backgrounds / Hover states
  [/bg-slate-700\/[0-9]+/g, 'bg-primary/5'],
  [/bg-slate-700/g, 'bg-primary/5'],
  [/hover:bg-slate-700\/[0-9]+/g, 'hover:bg-primary/10'],
  [/hover:bg-slate-700/g, 'hover:bg-primary/10'],
  [/hover:bg-slate-600\/[0-9]+/g, 'hover:bg-primary/10'],
  [/hover:bg-slate-600/g, 'hover:bg-primary/10'],
  
  // Text colors
  [/text-slate-100/g, 'text-text'],
  [/text-slate-200/g, 'text-text'],
  [/text-slate-300/g, 'text-text/80'],
  [/text-slate-400/g, 'text-primary'],
  [/text-slate-500/g, 'text-primary/70'],
  [/text-slate-600/g, 'text-primary/50'],
  [/text-gray-100/g, 'text-text'],
  [/text-gray-200/g, 'text-text'],
  [/text-gray-300/g, 'text-text/80'],
  [/text-gray-400/g, 'text-primary'],
  [/text-gray-500/g, 'text-primary/70'],

  // Accents (Violet -> Action / Primary)
  [/text-violet-300/g, 'text-action'],
  [/text-violet-400/g, 'text-action'],
  [/text-violet-500/g, 'text-action'],
  [/hover:text-violet-300/g, 'hover:text-[#a04618]'],
  [/hover:text-violet-400/g, 'hover:text-[#a04618]'],
  [/hover:text-violet-500/g, 'hover:text-[#a04618]'],
  
  [/bg-violet-500\/[0-9]+/g, 'bg-action/10'],
  [/bg-violet-600\/[0-9]+/g, 'bg-action/10'],
  [/bg-violet-700\/[0-9]+/g, 'bg-action/10'],
  
  [/bg-violet-500/g, 'bg-action'],
  [/bg-violet-600/g, 'bg-action'],
  [/bg-violet-700/g, 'bg-action'],
  [/hover:bg-violet-500/g, 'hover:bg-[#a04618]'],
  [/hover:bg-violet-600/g, 'hover:bg-[#a04618]'],
  [/hover:bg-violet-700/g, 'hover:bg-[#a04618]'],
  
  [/border-violet-500\/[0-9]+/g, 'border-action/20'],
  [/border-violet-600\/[0-9]+/g, 'border-action/20'],
  [/border-violet-700\/[0-9]+/g, 'border-action/20'],
  [/border-violet-500/g, 'border-action'],
  [/border-violet-600/g, 'border-action'],
  [/border-violet-700/g, 'border-action'],
  [/hover:border-violet-500\/[0-9]+/g, 'hover:border-action/40'],
  [/hover:border-violet-600\/[0-9]+/g, 'hover:border-action/40'],
  [/hover:border-violet-700\/[0-9]+/g, 'hover:border-action/40'],
  [/hover:border-violet-500/g, 'hover:border-action'],
  
  [/shadow-violet-[0-9]+\/[0-9]+/g, 'shadow-sm'],
  
  // Emerald / Cyan / Purple / Amber / Rose
  [/text-emerald-[0-9]+/g, 'text-primary'],
  [/bg-emerald-[0-9]+\/[0-9]+/g, 'bg-primary/10'],
  [/bg-emerald-[0-9]+/g, 'bg-primary'],
  [/border-emerald-[0-9]+\/[0-9]+/g, 'border-primary/20'],
  [/border-emerald-[0-9]+/g, 'border-primary'],
  
  [/text-cyan-[0-9]+/g, 'text-primary'],
  [/bg-cyan-[0-9]+\/[0-9]+/g, 'bg-primary/10'],
  [/bg-cyan-[0-9]+/g, 'bg-primary'],
  
  [/text-purple-[0-9]+/g, 'text-primary'],
  [/bg-purple-[0-9]+\/[0-9]+/g, 'bg-primary/10'],
  [/bg-purple-[0-9]+/g, 'bg-primary'],
  
  [/text-amber-[0-9]+(\/[0-9]+)?/g, 'text-action'],
  [/bg-amber-[0-9]+\/[0-9]+/g, 'bg-action/10'],
  [/bg-amber-[0-9]+/g, 'bg-action'],
  
  [/text-rose-[0-9]+/g, 'text-action'],
  [/bg-rose-[0-9]+\/[0-9]+/g, 'bg-action/10'],
  [/bg-rose-[0-9]+/g, 'bg-action'],
];

walkDir('./frontend/src', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (let [pattern, replacement] of replacements) {
      content = content.replace(pattern, replacement);
    }
    
    // Some minor contextual fixes
    // Replace hardcoded dark mode focus rings
    content = content.replace(/focus:ring-violet-[0-9]+/g, 'focus:ring-primary');
    content = content.replace(/focus:border-violet-[0-9]+/g, 'focus:border-primary');
    content = content.replace(/text-white/g, 'text-white'); // keep white when explicit
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
