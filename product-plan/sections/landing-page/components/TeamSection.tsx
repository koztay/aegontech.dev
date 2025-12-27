import type { TeamSectionProps, TeamMember } from '../types'
import { User } from 'lucide-react'

function TeamCard({
    member,
    onMemberClick
}: {
    member: TeamMember
    onMemberClick?: (id: string) => void
}) {
    return (
        <div
            onClick={() => onMemberClick?.(member.id)}
            className="group text-center cursor-pointer"
        >
            {/* Photo */}
            <div className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/50 dark:to-cyan-900/50 ring-4 ring-white dark:ring-slate-800 shadow-lg group-hover:ring-indigo-200 dark:group-hover:ring-indigo-700 transition-all duration-300">
                {member.photoUrl ? (
                    <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-indigo-400" />
                    </div>
                )}
            </div>

            {/* Name & Role */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {member.name}
            </h3>
            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-2">
                {member.role}
            </p>

            {/* Bio Preview */}
            <p className="text-slate-500 dark:text-slate-500 text-xs max-w-[200px] mx-auto line-clamp-2">
                {member.bio}
            </p>
        </div>
    )
}

export function TeamSection({ members, onMemberClick }: TeamSectionProps) {
    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full mb-4">
                        Our Team
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                        Meet the Experts
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                        A passionate team of developers, designers, and strategists.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {members.map((member) => (
                        <TeamCard key={member.id} member={member} onMemberClick={onMemberClick} />
                    ))}
                </div>
            </div>
        </section>
    )
}
