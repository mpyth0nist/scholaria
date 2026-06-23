import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../../features/users/userSlice'

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
            className="bg-white/60 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-text focus:border-action outline-none transition" 
            {...props} 
        />
    </div>
)

const SelectField = ({ label, options, ...props }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-xs font-semibold uppercase tracking-widest text-primary">{label}</label>
        <select className="bg-white/60 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-text focus:border-action outline-none transition appearance-none" {...props}>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
)

const UserFormModal = ({ isOpen, onClose, user, onSubmit, isSubmitting }) => {
    const isEdit = !!user
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        birth_date: '',
        role: 'Student',
        password: ''
    })

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                birth_date: user.birth_date || '',
                role: user.role || 'Student',
                password: ''
            })
        } else {
            setFormData({ username: '', first_name: '', last_name: '', email: '', birth_date: '', role: 'Student', password: '' })
        }
    }, [user, isOpen])

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <Modal isOpen={isOpen} title={isEdit ? "Edit User" : "Create New User"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="First Name" name="first_name" required value={formData.first_name} onChange={handleChange} />
                    <InputField label="Last Name" name="last_name" required value={formData.last_name} onChange={handleChange} />
                </div>
                <InputField label="Username" name="username" required value={formData.username} onChange={handleChange} />
                <InputField label="Email" type="email" name="email" required value={formData.email} onChange={handleChange} />
                <InputField label="Birth Date" type="date" name="birth_date" required value={formData.birth_date} onChange={handleChange} />
                
                <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Role" name="role" value={formData.role} onChange={handleChange} options={[
                        {label: 'Student', value: 'Student'},
                        {label: 'Teacher', value: 'Teacher'},
                        {label: 'Admin', value: 'ADMIN'}
                    ]} />
                    <InputField label="Password" type="password" name="password" placeholder={isEdit ? "(leave blank to keep)" : "Required"} required={!isEdit} value={formData.password} onChange={handleChange} />
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-primary/10">
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-action hover:bg-[#a04618] text-white py-2.5 rounded-lg font-semibold transition disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Save User'}
                    </button>
                    <button type="button" onClick={onClose} className="px-6 bg-primary/10 hover:bg-primary/20 text-text py-2.5 rounded-lg font-semibold transition">Cancel</button>
                </div>
            </form>
        </Modal>
    )
}

const AdminDashboard = () => {
    const dispatch = useDispatch()
    const { adminUsers, adminUsersCount, adminUsersLoading } = useSelector(state => state.users)
    
    // Filters & Pagination
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [ordering, setOrdering] = useState('username')
    const size = 10

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        dispatch(fetchAdminUsers({ page, size, search, ordering }))
    }, [dispatch, page, search, ordering])

    const handleCreateOrUpdate = async (data) => {
        setIsSubmitting(true)
        if (editingUser) {
            // Update
            const payload = { ...data }
            if (!payload.password) delete payload.password
            await dispatch(adminUpdateUser({ id: editingUser.id, data: payload }))
        } else {
            // Create
            await dispatch(adminCreateUser(data))
        }
        setIsSubmitting(false)
        setIsFormOpen(false)
        setEditingUser(null)
        dispatch(fetchAdminUsers({ page, size, search, ordering })) // Refresh to maintain order
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to completely delete this user? This cannot be undone.')) {
            await dispatch(adminDeleteUser(id))
            dispatch(fetchAdminUsers({ page, size, search, ordering }))
        }
    }

    const openCreate = () => {
        setEditingUser(null)
        setIsFormOpen(true)
    }

    const openEdit = (user) => {
        setEditingUser(user)
        setIsFormOpen(true)
    }

    const totalPages = Math.ceil(adminUsersCount / size) || 1

    return (
        <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto w-full text-text min-h-[calc(100vh-80px)]">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-text">Admin Dashboard</h1>
                    <p className="text-text/50 mt-1 text-sm">Manage users, roles, and platform access.</p>
                </div>
                <button onClick={openCreate} className="bg-action hover:bg-[#a04618] text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition transform active:scale-95 flex items-center gap-2">
                    <span className="text-xl leading-none">+</span> New User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white/60 border border-primary/20 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <input 
                        type="text" 
                        placeholder="Search by name, username, or email..." 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary shrink-0">Sort By:</span>
                    <select 
                        value={ordering}
                        onChange={(e) => setOrdering(e.target.value)}
                        className="bg-background border border-primary/20 rounded-lg px-4 py-2.5 text-sm focus:border-action outline-none transition appearance-none min-w-[150px]"
                    >
                        <option value="username">Username (A-Z)</option>
                        <option value="-username">Username (Z-A)</option>
                        <option value="first_name">Name (A-Z)</option>
                        <option value="-first_name">Name (Z-A)</option>
                        <option value="-birth_date">Age (Youngest)</option>
                        <option value="birth_date">Age (Oldest)</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/60 border border-primary/20 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-primary/5 border-b border-primary/20 text-primary">
                                <th className="hidden sm:table-cell px-6 py-4 font-semibold tracking-wide uppercase text-xs">ID</th>
                                <th className="px-6 py-4 font-semibold tracking-wide uppercase text-xs">User</th>
                                <th className="hidden md:table-cell px-6 py-4 font-semibold tracking-wide uppercase text-xs">Contact</th>
                                <th className="px-6 py-4 font-semibold tracking-wide uppercase text-xs">Role</th>
                                <th className="px-6 py-4 font-semibold tracking-wide uppercase text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                            {adminUsersLoading ? (
                                <tr><td colSpan="5" className="text-center py-10 text-primary italic">Loading users...</td></tr>
                            ) : adminUsers.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-10 text-primary italic">No users found.</td></tr>
                            ) : (
                                adminUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                                        <td className="hidden sm:table-cell px-6 py-4 font-mono text-xs text-primary/70">#{u.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-text">{u.first_name} {u.last_name}</div>
                                            <div className="text-primary text-xs">@{u.username}</div>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4 text-text/80">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${u.role === 'ADMIN' ? 'bg-red-500/10 text-red-600' : 
                                                  u.role === 'Teacher' ? 'bg-action/10 text-action' : 
                                                  'bg-primary/10 text-primary'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEdit(u)} className="text-primary hover:text-action font-semibold text-xs uppercase tracking-wide px-3 transition-colors">Edit</button>
                                            <button onClick={() => handleDelete(u.id)} className="text-primary/50 hover:text-red-500 font-semibold text-xs uppercase tracking-wide px-3 transition-colors">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-auto px-6 py-4 border-t border-primary/20 bg-background flex items-center justify-between">
                    <span className="text-sm text-text/50">
                        Showing <span className="font-bold text-text">{(page - 1) * size + 1}</span> to <span className="font-bold text-text">{Math.min(page * size, adminUsersCount)}</span> of <span className="font-bold text-text">{adminUsersCount}</span> users
                    </span>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1} 
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 rounded bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            Prev
                        </button>
                        <span className="px-3 py-1.5 font-bold text-text text-sm">
                            {page} / {totalPages}
                        </span>
                        <button 
                            disabled={page >= totalPages} 
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 rounded bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <UserFormModal 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                user={editingUser} 
                onSubmit={handleCreateOrUpdate}
                isSubmitting={isSubmitting}
            />

        </div>
    )
}

export default AdminDashboard
