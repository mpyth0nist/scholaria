import React from 'react'
import { BookOpen, GraduationCap, Lightbulb, ListChecks, Target } from 'lucide-react'

const LESSON_CHIPS = [
    { label: 'Summarize this lesson', Icon: ListChecks, query: 'Can you summarize the key points of this lesson in 3 concise bullet points?' },
    { label: 'Quiz me on this material', Icon: Target, query: 'Generate a short practice quiz question based on this lesson to test my understanding.' },
    { label: 'Explain simply', Icon: Lightbulb, query: 'Explain the main concepts of this lesson in simple terms with a real-world example.' },
]

const GLOBAL_CHIPS = [
    { label: 'My enrolled courses', Icon: BookOpen, query: 'What courses am I currently enrolled in?' },
    { label: 'Study tips', Icon: Lightbulb, query: 'Give me effective study techniques for preparing for my course exams.' },
    { label: 'Exam preparation', Icon: GraduationCap, query: 'How should I structure my revision for my enrolled courses?' },
]

export default function EdahSuggestionChips({ lessonId, onSelect }) {
    const chips = lessonId ? LESSON_CHIPS : GLOBAL_CHIPS

    return (
        <div className="flex flex-wrap gap-2 mt-2 mb-1 px-1">
            {chips.map((chip) => (
                <button
                    key={chip.label}
                    onClick={() => onSelect(chip.query)}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[var(--chat-ai-surface)] hover:bg-action/10 hover:border-action border border-[var(--chat-ai-border)] text-text/85 hover:text-action transition-all shadow-sm btn-press text-left"
                >
                    <chip.Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                    <span>{chip.label}</span>
                </button>
            ))}
        </div>
    )
}
