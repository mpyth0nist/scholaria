import { ALargeSmall, Sparkles } from 'lucide-react'

// Segmented toggle button: icon + label, filled with its accent color when
// active. Shares sizing/motion with the rest of the app's buttons (btn-press).
const ToolbarButton = ({ icon, label, active, accentClass, onClick }) => {
    const Icon = icon
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`
                flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold
                transition-all duration-150 btn-press
                ${active
                    ? `${accentClass} text-white shadow-sm`
                    : 'text-text/65 hover:text-text hover:bg-primary/[0.06]'}
            `}
        >
            <Icon size={16} strokeWidth={2.25} aria-hidden="true" />
            <span>{label}</span>
        </button>
    )
}

/**
 * The lesson page's "Ask Edah" / "Reading" controls, grouped as one
 * segmented pill instead of two loose, all-caps chips.
 */
export default function LessonToolbar({ showAI, onToggleAI, showPrefs, onTogglePrefs, className = '' }) {
    return (
        <div className={`inline-flex items-center gap-1 p-1 rounded-xl bg-surface border border-border shadow-xs ${className}`}>
            <ToolbarButton
                icon={Sparkles}
                label="Ask Edah"
                active={showAI}
                accentClass="bg-action"
                onClick={onToggleAI}
            />
            <div className="w-px h-5 bg-border" aria-hidden="true" />
            <ToolbarButton
                icon={ALargeSmall}
                label="Reading"
                active={showPrefs}
                accentClass="bg-primary"
                onClick={onTogglePrefs}
            />
        </div>
    )
}
