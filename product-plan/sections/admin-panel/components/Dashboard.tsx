import type { DashboardProps } from '../types'
import { Briefcase, FileText, Plus, ArrowRight, Clock } from 'lucide-react'

export function Dashboard({
    stats,
    recentPortfolioItems,
    recentBlogPosts,
    onViewPortfolio,
    onViewBlog,
    onAddPortfolioItem,
    onAddBlogPost
}: DashboardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Welcome back! Here's an overview of your content.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Portfolio Items</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPortfolioItems}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Blog Posts</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBlogPosts}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Recent Updates</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.recentActivityCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-8">
                <button
                    onClick={onAddPortfolioItem}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Portfolio Item
                </button>
                <button
                    onClick={onAddBlogPost}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Blog Post
                </button>
            </div>

            {/* Recent Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Portfolio */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="font-semibold text-slate-900 dark:text-white">Recent Portfolio</h2>
                        <button
                            onClick={onViewPortfolio}
                            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {recentPortfolioItems.map((item) => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'saas'
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
                                        : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400'
                                        }`}>
                                        {item.type === 'saas' ? 'SaaS' : 'Mobile'}
                                    </span>
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {formatDate(item.updatedAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Blog */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="font-semibold text-slate-900 dark:text-white">Recent Blog Posts</h2>
                        <button
                            onClick={onViewBlog}
                            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {recentBlogPosts.map((post) => (
                            <div key={post.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{post.title}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'published'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                                        }`}>
                                        {post.status}
                                    </span>
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {formatDate(post.updatedAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
