import type { PortfolioListProps } from '../types'
import { Plus, Edit2, Trash2, Globe, Smartphone } from 'lucide-react'

export function PortfolioList({ items, onAdd, onEdit, onDelete }: PortfolioListProps) {
    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your portfolio items</p>
                </div>
                <button
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Title</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Type</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Links</th>
                            <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={item.screenshot}
                                            alt={item.title}
                                            className="w-12 h-9 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{item.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${item.type === 'saas'
                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
                                        : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400'
                                        }`}>
                                        {item.type === 'saas' ? <Globe className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                                        {item.type === 'saas' ? 'SaaS' : 'Mobile'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {item.links.website && (
                                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">Website</span>
                                        )}
                                        {item.links.appStore && (
                                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">App Store</span>
                                        )}
                                        {item.links.playStore && (
                                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">Play Store</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit?.(item.id)}
                                            className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete?.(item.id)}
                                            className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
