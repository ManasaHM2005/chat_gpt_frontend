import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [userEmail] = useState(localStorage.getItem('userEmail') || 'user@example.com');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Bar */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{userEmail}</span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition duration-150"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
                    <h2 className="text-2xl font-bold">Welcome back! 👋</h2>
                    <p className="mt-2 text-indigo-100">Here's what's happening with your account today.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Chats</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">24</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-green-500 mt-2">+12% from last week</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">AI Responses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">156</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-green-500 mt-2">+8% from last week</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Saved Prompts</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
                            </div>
                            <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">No change</p>
                    </div>
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition text-left">
                                <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New Chat</p>
                                    <p className="text-xs text-gray-500">Start a conversation with AI</p>
                                </div>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition text-left">
                                <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">View History</p>
                                    <p className="text-xs text-gray-500">Browse your past conversations</p>
                                </div>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-xl transition text-left">
                                <div className="h-10 w-10 bg-amber-500 rounded-lg flex items-center justify-center">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Settings</p>
                                    <p className="text-xs text-gray-500">Manage your account preferences</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Account created successfully</p>
                                    <p className="text-xs text-gray-500">Just now</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Logged in from new device</p>
                                    <p className="text-xs text-gray-500">Just now</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Welcome to the platform!</p>
                                    <p className="text-xs text-gray-500">Get started by creating your first chat</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;