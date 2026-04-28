import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudents } from '../../features/users/userSlice'

// ── helpers ──────────────────────────────────────────────────────────

function getAge(birthDateStr) {
    if (!birthDateStr) return '—'
    const today = new Date()
    const birth = new Date(birthDateStr)
    let age = today.getFullYear() - birth.getFullYear()
    if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) age--
    return age
}

function Avatar({ first, last }) {
    const initials = `${first?.charAt(0) ?? ''}${last?.charAt(0) ?? ''}`.toUpperCase()
    const colors = [
        'bg-action', 'bg-primary', 'bg-indigo-600',
        'bg-primary', 'bg-action', 'bg-action',
    ]
    const color = colors[(first?.charCodeAt(0) ?? 0) % colors.length]
    return (
        <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
            <span className="text-white text-xs font-semibold">{initials || '?'}</span>
        </div>
    )
}

function SortIcon({ active, direction }) {
    if (!active) return <span className="opacity-0 group-hover:opacity-50 transition-opacity ml-1">⇅</span>;
    return <span className="ml-1 text-action">{direction === 'asc' ? '↑' : '↓'}</span>;
}

// ── component ────────────────────────────────────────────────────────

const StudentsPage = () => {
    const dispatch = useDispatch()
    const { students, studentsCount, studentsNext, studentsPrevious, studentsLoading: loading } = useSelector(state => state.users)

    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' })

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1) // Reset to page 1 on new search
        }, 400)
        return () => clearTimeout(handler)
    }, [search])

    // Fetch data from server on query state changes
    useEffect(() => {
        // DRF ordering format: "fieldname" for ascending, "-fieldname" for descending
        const orderingParam = sortConfig.direction === 'asc' ? sortConfig.key : `-${sortConfig.key}`
        
        dispatch(fetchStudents({
            page,
            search: debouncedSearch,
            ordering: orderingParam
        }))
    }, [dispatch, page, debouncedSearch, sortConfig])

    const handleSort = (key) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
            }
            return { key, direction: 'asc' }
        })
    }

    return (
        <div className="space-y-6">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Students</h1>
                    <p className="text-sm text-primary mt-1">
                        {loading && students.length === 0 ? 'Loading…' : `${studentsCount} student${studentsCount !== 1 ? 's' : ''} total`}
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70 pointer-events-none"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                    </svg>
                    <input
                        id="student-search"
                        type="text"
                        placeholder="Search server..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/60 border border-primary/20 text-text placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                </div>
            </div>

            {/* ── Table card ── */}
            <div className="rounded-xl border border-[#2f2f2f] bg-[#1e1e1e] overflow-hidden shadow-xl relative">
                
                {/* Thin loading indicator across the top for page transitions */}
                {loading && students.length > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-action/10 overflow-hidden z-10">
                        <div className="h-full bg-action w-1/3 animate-[slide_1.5s_ease-in-out_infinite]"
                             style={{ animationName: 'progress' }}>
                            <style>{`@keyframes progress { 0% { transform: translateX(-100%) } 100% { transform: translateX(300%) } }`}</style>
                        </div>
                    </div>
                )}

                {loading && students.length === 0 ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-action border-t-transparent animate-spin" />
                            <p className="text-primary text-sm">Fetching students…</p>
                        </div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m0 0A4 4 0 1113 9a4 4 0 01-4 3.13z" />
                        </svg>
                        <p className="text-primary text-sm">
                            {debouncedSearch ? 'No students match your search.' : 'No students found.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto relative">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-[#2f2f2f] bg-[#242424]">
                                    <th className="px-5 py-3 text-xs font-semibold text-primary uppercase tracking-wider">#</th>
                                    <th 
                                        className="px-5 py-3 text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-[#2f2f2f] transition-colors group select-none"
                                        onClick={() => handleSort('first_name')}
                                    >
                                        Student <SortIcon active={sortConfig.key === 'first_name'} direction={sortConfig.direction} />
                                    </th>
                                    <th 
                                        className="px-5 py-3 text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-[#2f2f2f] transition-colors group select-none"
                                        onClick={() => handleSort('username')}
                                    >
                                        Username <SortIcon active={sortConfig.key === 'username'} direction={sortConfig.direction} />
                                    </th>
                                    <th 
                                        className="px-5 py-3 text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-[#2f2f2f] transition-colors group select-none"
                                        onClick={() => handleSort('email')}
                                    >
                                        Email <SortIcon active={sortConfig.key === 'email'} direction={sortConfig.direction} />
                                    </th>
                                    <th 
                                        className="px-5 py-3 text-xs font-semibold text-primary uppercase tracking-wider cursor-pointer hover:bg-[#2f2f2f] transition-colors group select-none"
                                        onClick={() => handleSort('birth_date')}
                                    >
                                        Age <SortIcon active={sortConfig.key === 'birth_date'} direction={sortConfig.direction === 'asc' ? 'desc' : 'asc'} />
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold text-primary uppercase tracking-wider">Date of Birth</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-primary uppercase tracking-wider">
                                        Courses
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y divide-[#2a2a2a] ${loading ? 'opacity-50' : 'opacity-100'} transition-opacity delay-75`}>
                                {students.map((student, idx) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-[#242424] transition-colors duration-150 group"
                                    >
                                        {/* Row number uses ID now, or we can use computed index */}
                                        <td className="px-5 py-4 text-primary/70 tabular-nums">{(page - 1) * 10 + idx + 1}</td>

                                        {/* Avatar + full name */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar first={student.first_name} last={student.last_name} />
                                                <div>
                                                    <p className="font-medium text-white group-hover:text-action transition-colors">
                                                        {student.first_name || '—'} {student.last_name || ''}
                                                    </p>
                                                    <p className="text-xs text-primary/70">ID #{student.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Username */}
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-primary text-xs bg-primary/10 px-2 py-1 rounded">
                                                @{student.username}
                                            </span>
                                        </td>

                                        {/* Email */}
                                        <td className="px-5 py-4 text-text/80">
                                            {student.email || <span className="text-gray-600">—</span>}
                                        </td>

                                        {/* Age */}
                                        <td className="px-5 py-4">
                                            <span className="text-text font-medium">
                                                {getAge(student.birth_date)}
                                            </span>
                                            <span className="text-primary/70 ml-1">yrs</span>
                                        </td>

                                        {/* Birth date */}
                                        <td className="px-5 py-4 text-primary tabular-nums">
                                            {student.birth_date
                                                ? new Date(student.birth_date).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                  })
                                                : '—'}
                                        </td>

                                        {/* Courses enrolled count */}
                                        <td className="px-5 py-4">
                                            {student.student_courses && student.student_courses.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {student.student_courses.map(course => (
                                                        <span
                                                            key={course.id}
                                                            className="text-xs bg-action/10 text-action border border-action/20 rounded px-2 py-0.5"
                                                        >
                                                            {course.course_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-600 italic">No courses</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Footer Pagination ── */}
                {studentsCount > 0 && (
                    <div className="px-5 py-3 border-t border-[#2f2f2f] bg-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-primary/70">
                            Showing <span className="text-text/80 font-medium">{(page - 1) * 10 + 1}</span> to <span className="text-text/80 font-medium">{Math.min(page * 10, studentsCount)}</span> of <span className="text-text/80 font-medium">{studentsCount}</span> entries
                        </p>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={!studentsPrevious || loading}
                                className="px-3 py-1.5 text-xs font-medium text-text/80 bg-white/60 rounded hover:bg-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-[#3f3f3f]"
                            >
                                Previous
                            </button>
                            <span className="text-xs text-primary/70 px-2 font-medium">
                                Page {page}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!studentsNext || loading}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-action rounded hover:bg-action disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StudentsPage
