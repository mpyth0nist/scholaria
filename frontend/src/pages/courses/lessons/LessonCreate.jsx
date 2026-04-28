import { useState } from 'react'
import api from '../../../api'
import RichTextEditor from '../../../components/RichTextEditor'

const LessonCreate = ({ module_id, onCreated }) => {
    const [title, setTitle]           = useState('')
    const [content, setContent]       = useState('')
    const [attachment, setAttachment] = useState(null)
    const [video, setVideo]           = useState(null)
    const [loading, setLoading]       = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title.trim() || !content) return
        setLoading(true)

        const formData = new FormData()
        formData.append('title', title)
        formData.append('content', content)
        if (attachment) formData.append('attachments', attachment)
        if (video) formData.append('video', video)

        try {
            await api.post(`api/courses/${module_id}/add-lesson/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setTitle('')
            setContent('')
            setAttachment(null)
            setVideo(null)
            if (onCreated) onCreated()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 border-t border-slate-700/50 pt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Add a Lesson</p>

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title"
                className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 text-base text-slate-200 placeholder-slate-500 outline-none focus:border-violet-500 transition"
            />

            <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write lesson content…"
            />

            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <span className="bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-2 hover:bg-slate-700 transition text-slate-300">
                    {attachment ? attachment.name : 'Attach file (optional)'}
                </span>
                <input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files[0])} />
            </label>

            <button
                type="submit"
                disabled={loading}
                className="self-start bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50"
            >
                {loading ? 'Adding…' : 'Add Lesson'}
            </button>
        </form>
    )
}

export default LessonCreate