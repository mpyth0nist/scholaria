import React from 'react'

const LESSON_CHIPS = [
    { label: '💡 Summarize this lesson', query: 'Can you summarize the key points of this lesson in 3 concise bullet points?' },
    { label: '📝 Quiz me on this material', query: 'Generate a short practice quiz question based on this lesson to test my understanding.' },
    { label: '🔍 Explain simply', query: 'Explain the main concepts of this lesson in simple terms with a real-world example.' },
]

const GLOBAL_CHIPS = [
    { label: '📚 My enrolled courses', query: 'What courses am I currently enrolled in?' },
    { label: '💡 Study tips', query: 'Give me effective study techniques for preparing for my course exams.' },
    { label: '🎯 Exam preparation', query: 'How should I structure my revision for my enrolled courses?' },
]

export default function EdahSuggestionChips({ lessonId, onSelect }) {
    const chips = lessonId ? LESSON_CHIPS : GLOBAL_CHIPS

    return (
        <div className="flex flex-wrap gap-2 mt-2 mb-1 px-1">
            {chips.map((chip, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelect(chip.query)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-[#2D332D] hover:bg-action/10 hover:border-action border border-primary/20 text-text/80 hover:text-action transition-all shadow-sm btn-press text-left"
                >
                    {chip.label}
                </button>
            ))}
        </div>
    )
}

