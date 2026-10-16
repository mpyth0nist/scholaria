import { useState, useRef } from 'react'
import api from '../../../api'
import RichTextEditor from '../../../components/RichTextEditor'

// Matches truly-empty contentEditable output: blank, or only whitespace /
// <br> / empty block tags with no real text.
const isContentEmpty = (html) => {
    if (!html) return true
    const stripped = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, '').trim()
    return stripped.length === 0
}

const LessonCreate = ({ module_id, onCreated }) => {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [attachments, setAttachments] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({ title: false, content: false })

    // Key to force-remount the editor so it resets after a successful submit
    const [editorKey, setEditorKey] = useState(0)
    const fileInputRef = useRef(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validate — show inline field hints instead of silent no-op
        const titleEmpty = !title.trim()
        const contentEmpty = isContentEmpty(content)
        if (titleEmpty || contentEmpty) {
            setFieldErrors({ title: titleEmpty, content: contentEmpty })
            return
        }
        setFieldErrors({ title: false, content: false })
        setLoading(true)

        const formData = new FormData()
        formData.append('title', title)
        formData.append('content', content)
        formData.append('is_published', 'true')
        // Fix #2: check the `attachments` state variable, not formData.attachments
        if (attachments) formData.append('attachments', attachments)

        try {
            await api.post(`api/courses/${module_id}/add-lesson/`, formData)
            // Fix #3: reset all state AND remount the editor so contentEditable clears
            setTitle('')
            setContent('')
            setAttachments(null)  // Fix #1: correct casing
            setEditorKey(k => k + 1)
            if (fileInputRef.current) fileInputRef.current.value = ''
            if (onCreated) onCreated()
        } catch (err) {
            console.error(err)
            // Fix #5: surface the error to the user
            const detail = err?.response?.data?.detail
                || err?.response?.data?.content?.[0]
                || err?.response?.data?.title?.[0]
                || 'Something went wrong. Please try again.'
            setError(detail)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 border-t border-primary/20 pt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-action">Add a Lesson</p>

            {/* Title */}
            <div className="flex flex-col gap-1">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setFieldErrors(fe => ({ ...fe, title: false })) }}
                    placeholder="Lesson title"
                    className={`bg-surface border rounded-lg px-4 py-3 text-base text-text placeholder-slate-500 outline-none focus:border-action transition
                        ${fieldErrors.title ? 'border-danger' : 'border-primary/20'}`}
                />
                {fieldErrors.title && (
                    <p className="text-xs text-danger">Title is required.</p>
                )}
            </div>

            {/* Rich text editor */}
            <div className="flex flex-col gap-1">
                <RichTextEditor
                    key={editorKey}
                    value={content}
                    onChange={(html) => { setContent(html); setFieldErrors(fe => ({ ...fe, content: false })) }}
                    placeholder="Write lesson content…"
                    hasError={fieldErrors.content}
                />
                {fieldErrors.content && (
                    <p className="text-xs text-danger">Lesson content is required.</p>
                )}
            </div>

            {/* Attachment */}
            <label className="flex items-center gap-2 text-sm text-primary cursor-pointer w-fit">
                <span className={`bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 hover:bg-primary/10 transition text-text/80 ${attachments ? 'border-action/40 text-action' : ''}`}>
                    {attachments ? `📎 ${attachments.name}` : 'Attach file (optional)'}
                </span>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setAttachments(e.target.files[0] ?? null)}
                />
                {attachments && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setAttachments(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                        className="text-xs text-danger hover:underline"
                    >
                        Remove
                    </button>
                )}
            </label>

            {/* API error banner */}
            {error && (
                <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-2.5">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="self-start bg-action hover:bg-action active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
                {loading ? 'Adding…' : 'Add Lesson'}
            </button>
        </form>
    )
}

export default LessonCreate