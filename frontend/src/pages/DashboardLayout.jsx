

function Dashboard(){

    return (
        <>
            <div class="dashboard-container">
            <div class="sidebar">
                <nav class="sidebar-nav">
                    <button class="nav-item active">Dashboard</button>
                    <button class="nav-item">Courses</button>
                    <button class="nav-item">Quizzes</button>
                </nav>
            </div>

            <div class="main-content">
                <div class="top-header">
                    <div class="header-actions">
                        <div class="notification-icon">
                            <div class="notification-badge"></div>
                        </div>
                        <div class="profile-picture"></div>
                    </div>
                </div>

                <div class="content-area">
                </div>
            </div>
            </div>
        </>
    )
}

export default Dashboard;