import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="premium-card p-10 max-w-md w-full text-center flex flex-col items-center gap-4 animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl mb-2">
                    404
                </div>
                <h1 className="text-2xl font-serif font-bold text-text">Page Not Found</h1>
                <p className="text-text/60 text-sm">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link to="/dashboard" className="mt-4 bg-action hover:bg-[#3a6347] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all btn-press inline-block">
                    Return to Dashboard
                </Link>
            </div>
        </div>
    )
}

export default NotFound;