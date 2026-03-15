import React from 'react';
import { FiUsers, FiAward, FiGlobe, FiTarget } from 'react-icons/fi';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 md:px-0">
            <div className="container-lg max-w-5xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-20 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                        Empowering <span className="text-[#00a884]">Future Leaders</span> Through Quality Education
                    </h1>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        LearnHub is a leading online learning platform dedicated to providing accessible, high-quality courses to students worldwide. Our mission is to bridge the gap between education and industry requirements.
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
                    {[
                        { icon: <FiUsers />, label: 'Students', value: '10,000+' },
                        { icon: <FiAward />, label: 'Courses', value: '500+' },
                        { icon: <FiGlobe />, label: 'Countries', value: '50+' },
                        { icon: <FiTarget />, label: 'Success Rate', value: '95%' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-[#00a884] mx-auto mb-4 text-2xl font-bold">
                                {stat.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                            <p className="text-slate-500 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Project Details */}
                <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-slate-100 mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">About Our Project</h2>
                    <div className="space-y-6 text-slate-600 leading-relaxed">
                        <p>
                            LearnHub is a comprehensive Learning Management System (LMS) designed to offer a seamless learning experience. We provide a platform for instructors to share their knowledge and for students to gain skills and certifications in various domains including Web Development, Data Science, and Design.
                        </p>
                        <p>
                            Our platform features real-time progress tracking, interactive video lectures, and a dedicated admin panel for efficient course management. We believe that education should be flexible, affordable, and engaging.
                        </p>
                        <p>
                            Whether you are a beginner looking to start a new career or a professional seeking to upgrade your skills, LearnHub provides the tools and resources you need to succeed in today's fast-paced world.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
