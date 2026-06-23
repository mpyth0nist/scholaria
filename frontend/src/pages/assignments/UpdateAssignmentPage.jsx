import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAssignment, updateAssignment } from '../../features/assignments/assignmentSlice'
import api from '../../api'

const UpdateAssignmentPage = () => {
    const { assignment_id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { currentAssignment: assignment, loading, error } = useSelector(state => state.assignments)

    const [courses, setCourses] = useState([])
    const [form, setForm] = useState({ name: '', description: '', course: '', due_date: '', document: null })
    const [fieldErrors, setFieldErrors] = useState({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        dispatch(fetchAssignment(assignment_id))
        api.get('api/courses/list/').then(res => setCourses(res.data)).catch(console.error)
    }, [assignment_id])

    // Pre-fill form when assignment loads
    useEffect(() => {
        if (assignment) {
            setForm({
                name: assignment.name ?? '',
                description: assignment.description ?? '',
                course: String(assignment.course ?? ''),
                due_date: assignment.due_date ?? '',
                document: null,
            })
        }
    }, [assignment])

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFieldErrors({})
        setSaving(true)

        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('description', form.description)
        formData.append('course', form.course)
        formData.append('due_date', form.due_date)
        if (form.document) formData.append('document', form.document)

        const result = await dispatch(updateAssignment({ id: assignment_id, formData }))
        setSaving(false)
        if (updateAssignment.fulfilled.match(result)) {
            navigate(`/assignments/${assignment_id}/`)
        } else if (result.payload && typeof result.payload === 'object') {
            setFieldErrors(result.payload)
        }
    }

    const inputClass = "bg-white/60 border border-primary/20 rounded-lg px-4 py-3 text-sm text-text placeholder-slate-400 outline-none focus:border-action transition w-full"
    const labelClass = "text-xs font-semibold uppercase tracking-widest text-action"
    const fieldClass = "flex flex-col gap-1.5"

    if (loading || !assignment) {
        return (
            <div className="flex items-center justify-center h-64 text-action animate-pulse text-sm">
                Loading…
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto text-text animate-page-enter">
            <div>
                <button
                    onClick={() => navigate(`/assignments/${assignment_id}/`)}
                    className="text-sm text-primary hover:text-action transition mb-3 inline-flex items-center gap-1.5"
                >
                    ← Back
                </button>
                <h1 className="text-3xl font-serif font-bold">Edit Assignment</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white/60 border border-primary/20 rounded-xl p-6">
                <div className={fieldClass}>
                    <label className={labelClass}>Title *</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        className={inputClass}
                    />
                    {fieldErrors.name && <p className="text-red-400 text-xs">{fieldErrors.name}</p>}
                </div>

                <div className={fieldClass}>
                    <label className={labelClass}>Description</label>
                    <input
                        type="text"
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className={fieldClass}>
                    <label className={labelClass}>Course *</label>
                    <select
                        required
                        value={form.course}
                        onChange={e => set('course', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select a course…</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.course_name}</option>
                        ))}
                    </select>
                    {fieldErrors.course && <p className="text-red-400 text-xs">{fieldErrors.course}</p>}
                </div>

                <div className={fieldClass}>
                    <label className={labelClass}>Due Date *</label>
                    <input
                        type="date"
                        required
                        value={form.due_date}
                        onChange={e => set('due_date', e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className={`${fieldClass} border-t border-primary/15 pt-4`}>
                    <label className={labelClass}>Replace Document (optional)</label>
                    {assignment.document && !form.document && (
                        <p className="text-xs text-text/50">A document is already attached. Uploading a new file will replace it.</p>
                    )}
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <span className="flex items-center gap-2 bg-white/80 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-text/70 group-hover:border-action/40 group-hover:text-action transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {form.document ? form.document.name : 'Choose new PDF file…'}
                        </span>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={e => set('document', e.target.files[0])}
                        />
                    </label>
                </div>

                {error && typeof error === 'string' && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-primary/15">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-action hover:bg-action text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 btn-press text-sm"
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/assignments/${assignment_id}/`)}
                        className="text-sm text-primary hover:text-text px-4 py-3 rounded-lg hover:bg-primary/5 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default UpdateAssignmentPage
