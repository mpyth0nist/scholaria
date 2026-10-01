import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchClasses, createClass, updateClass, deleteClass } from '../../features/courses/coursesSlice'
import { fetchAdminUsers } from '../../features/users/userSlice'

const Modal = ({ isOpen, title, onClose, children }) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-md border border-primary/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-primary/10 flex justify-between items-center bg-primary/5">
                    <h3 className="font-serif font-bold text-text text-xl">{title}</h3>
                    <button onClick={onClose} className="text-primary hover:text-action transition-colors text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

const InputField = ({ label, type = "text", ...props }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-xs font-semibold uppercase tracking-widest text-primary">{label}</label>
        <input 
            type={type} 
            className="bg-surface border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-text focus:border-action outline-none transition" 
            {...props} 
        />
    </div>
)

const ClassFormModal = ({ isOpen, onClose, cls, onSubmit, isSubmitting, allStudents }) => {
    const isEdit = !!cls
    const [formData, setFormData] = useState({
        name: '',
        students: []
    })

    useEffect(() => {
        if (cls) {
            setFormData({
                name: cls.name || '',
                students: cls.students || []
            })
        } else {
            setFormData({ name: '', students: [] })
        }
    }, [cls, isOpen])

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

    const toggleStudent = (studentId) => {
        setFormData(prev => {
            const hasStudent = prev.students.includes(studentId)
            return {
                ...prev,
                students: hasStudent 
                    ? prev.students.filter(id => id !== studentId)
                    : [...prev.students, studentId]
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Modal isOpen={isOpen} title={isEdit ? "Edit Class" : "Create New Class"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <InputField label="Class Name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. 10th Grade Math" />
                
                <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-xs font-semibold uppercase tracking-widest text-primary">Students ({formData.students.length} selected)</label>
                    <div className="max-h-48 overflow-y-auto border border-primary/20 rounded-lg p-2 bg-surface">
                        {allStudents.length === 0 ? (
                            <p className="text-sm text-primary/70 p-2 italic">No students available.</p>
                        ) : (
                            allStudents.map(student => (
                                <label key={student.id} className="flex items-center gap-2 p-2 hover:bg-primary/5 rounded cursor-pointer transition">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.students.includes(student.id)}
                                        onChange={() => toggleStudent(student.id)}
                                        className="accent-action w-4 h-4"
                                    />
                                    <span className="text-sm text-text">
                                        {student.first_name} {student.last_name} <span className="text-xs text-primary/60">(@{student.username})</span>
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-primary/10">
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-action hover:brightness-90 text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Save Class'}
                    </button>
                    <button type="button" onClick={onClose} className="px-6 bg-primary/10 hover:bg-primary/20 text-text py-2.5 rounded-lg font-semibold transition">Cancel</button>
                </div>
            </form>
        </Modal>
    )
}

const AdminClassesPage = () => {
    const dispatch = useDispatch()
    const { classes } = useSelector(state => state.courses)
    const { adminUsers } = useSelector(state => state.users) // all users fetched for admin
    
    // Only filter users who are students
    const allStudents = adminUsers.filter(u => u.role === 'Student') || []

    const [search, setSearch] = useState('')

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingClass, setEditingClass] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        dispatch(fetchClasses())
        // fetch large enough size to get students, or implement proper pagination if needed
        dispatch(fetchAdminUsers({ size: 1000 }))
    }, [dispatch])

    const handleCreateOrUpdate = async (data) => {
        setIsSubmitting(true)
        if (editingClass) {
            await dispatch(updateClass({ id: editingClass.id, data }))
        } else {
            await dispatch(createClass(data))
        }
        setIsSubmitting(false)
        setIsFormOpen(false)
        setEditingClass(null)
        dispatch(fetchClasses())
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this class? This cannot be undone.')) {
            await dispatch(deleteClass(id))
        }
    }

    const openCreate = () => {
        setEditingClass(null)
        setIsFormOpen(true)
    }

    const openEdit = (cls) => {
        setEditingClass(cls)
        setIsFormOpen(true)
    }

    const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto w-full text-text min-h-[calc(100vh-80px)]">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">Manage Classes</h1>
                    <p className="text-text/50 mt-1 text-sm">Create and organize student classes.</p>
                </div>
                <button onClick={openCreate} className="bg-action hover:brightness-90 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition transform active:scale-95 flex items-center gap-2">
                    <span className="text-xl leading-none">+</span> New Class
                </button>
            </div>

            {/* Filters */}
            <div className="bg-surface border border-primary/20 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <input 
                        type="text" 
                        placeholder="Search classes by name..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-background border border-primary/20 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-action outline-none transition"
                    />
                    <svg
                        className="absolute left-3 top-3.5 w-4 h-4 text-primary/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface border border-primary/20 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-primary/5 border-b border-primary/20 text-primary">
                                <th className="px-6 py-4 font-semibold tracking-wide uppercase text-xs">ID</th>
                                <th className="px-6 py-4 font-semibold tracking-wide uppercase text-xs">Class Name</th>
                                <th className="px-6 py-4 font-semibold tracking-wide uppercase text-xs">Students Count</th>
                                <th className="px-6 py-4 font-semibold tracking-wide uppercase text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                            {filteredClasses.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-10 text-primary italic">No classes found.</td></tr>
                            ) : (
                                filteredClasses.map(c => (
                                    <tr key={c.id} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-primary/70">#{c.id}</td>
                                        <td className="px-6 py-4 font-bold text-text">{c.name}</td>
                                        <td className="px-6 py-4 text-text/80">{c.students?.length || 0} students</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEdit(c)} className="text-primary hover:text-action font-semibold text-xs uppercase tracking-wide px-3 transition-colors">Edit</button>
                                            <button onClick={() => handleDelete(c.id)} className="text-primary/50 hover:text-red-500 font-semibold text-xs uppercase tracking-wide px-3 transition-colors">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ClassFormModal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                cls={editingClass} 
                onSubmit={handleCreateOrUpdate}
                isSubmitting={isSubmitting}
                allStudents={allStudents}
            />

        </div>
    )
}

export default AdminClassesPage
