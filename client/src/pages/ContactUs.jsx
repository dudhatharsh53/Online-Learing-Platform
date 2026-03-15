import React from 'react';
import { FiPhone, FiMail, FiMapPin, FiMessageCircle } from 'react-icons/fi';

const ContactUs = () => {
    return (
        <div className="min-h-screen bg-[#f0f2f5] py-20 px-4 md:px-0">
            <div className="container-lg max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-[#111b21] mb-4">Get in Touch</h1>
                    <p className="text-[#667781] max-w-2xl mx-auto">
                        Have questions about our courses or need technical support? We're here to help!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl overflow-hidden shadow-xl border border-[#d1d7db]">
                    {/* Contact Info Sidebar */}
                    <div className="bg-[#004d40] text-white p-12 lg:p-16 flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
                            <p className="text-[#8696a0] mb-12 text-lg">
                                Fill out the form and our team will get back to you within 24 hours.
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-[#00a884] rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                                        <FiPhone />
                                    </div>
                                    <div>
                                        <p className="text-[#8696a0] text-sm font-medium">Helpline</p>
                                        <p className="text-xl font-bold text-[#d1d7db] hover:text-[#00a884] transition-colors cursor-pointer">+91 6353141028</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-[#00a884] rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                                        <FiMail />
                                    </div>
                                    <div>
                                        <p className="text-[#8696a0] text-sm font-medium">Email Support</p>
                                        <p className="text-xl font-bold text-[#d1d7db] hover:text-[#00a884] transition-colors cursor-pointer">learnhub@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-[#00a884] rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                                        <FiMapPin />
                                    </div>
                                    <div>
                                        <p className="text-[#8696a0] text-sm font-medium">Location</p>
                                        <p className="text-xl font-bold text-[#d1d7db]">Ahmedabad, Gujarat, India</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6 mt-16">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-full bg-[#064e3b] border border-[#004d40] flex items-center justify-center hover:bg-[#00a884] hover:text-white transition-all cursor-pointer">
                                    <FiMessageCircle size={18} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="p-12 lg:p-16">
                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#111b21] uppercase tracking-wider">Full Name</label>
                                    <input type="text" className="w-full bg-[#f0f2f5] border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#00a884] transition-all text-[#111b21] placeholder-[#8696a0]" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#111b21] uppercase tracking-wider">Email Address</label>
                                    <input type="email" className="w-full bg-[#f0f2f5] border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#00a884] transition-all text-[#111b21] placeholder-[#8696a0]" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#111b21] uppercase tracking-wider">Subject</label>
                                <input type="text" className="w-full bg-[#f0f2f5] border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#00a884] transition-all text-[#111b21] placeholder-[#8696a0]" placeholder="How can we help?" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#111b21] uppercase tracking-wider">Message</label>
                                <textarea rows="5" className="w-full bg-[#f0f2f5] border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#00a884] transition-all text-[#111b21] placeholder-[#8696a0] resize-none" placeholder="Enter your query here..."></textarea>
                            </div>
                            <button className="w-full bg-[#00a884] hover:bg-[#06cf9c] text-white font-bold py-5 rounded-xl shadow-lg shadow-[#00a88433] transition-all transform hover:-translate-y-1">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
