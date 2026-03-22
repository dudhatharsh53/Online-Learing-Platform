import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchCurrentUser } from './redux/authSlice'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CourseList from './pages/CourseList'
import CourseDetail from './pages/CourseDetail'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'

// Student pages
import VideoLecture from './pages/VideoLecture'

// Admin pages
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
// import Analytics from './pages/admin/Analytics'
import StudentList from './pages/admin/StudentList'
import StudentDetails from './pages/admin/StudentDetails'
import ManageCourses from './pages/admin/ManageCourses'
import UploadLecture from './pages/admin/UploadLecture'
import ManageStudents from './pages/admin/ManageStudents'
import Payments from './pages/admin/Payments'
import ManageFaculty from './pages/admin/ManageFaculty'

function App() {
    const dispatch = useDispatch()

    // Re-hydrate auth state from cookie on app load
    useEffect(() => {
        dispatch(fetchCurrentUser())
    }, [dispatch])

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                <Routes>
                    {/* ── Public ── */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* ── Student (protected) ── */}
                    <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                        <Route path="/courses/:courseId/lecture/:id" element={<VideoLecture />} />
                    </Route>

                    {/* ── Authenticated Users (Any Role) ── */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/courses" element={<CourseList />} />
                        <Route path="/courses/:id" element={<CourseDetail />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<ContactUs />} />
                    </Route>

                    {/* ── Admin (protected) ── */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/courses" element={<ManageCourses />} />
                            <Route path="/admin/courses/:courseId/upload-lecture" element={<UploadLecture />} />
                            <Route path="/admin/faculty" element={<ManageFaculty />} />
                            <Route path="/admin/students" element={<StudentList />} />
                            <Route path="/admin/student/:id" element={<StudentDetails />} />
                            {/* <Route path="/admin/analytics" element={<Analytics />} /> */}
                            <Route path="/admin/payments" element={<Payments />} />
                        </Route>
                    </Route>
                </Routes>
            </main>
            <Footer />
        </div>
    )
}

export default App
