'use client';

import React, { useEffect, useState } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio: string;
}

interface FollowListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    username: string;
    type: 'followers' | 'following';
}

export default function FollowListModal({ isOpen, onClose, title, username, type }: FollowListModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && username) {
            fetchUsers();
        }
    }, [isOpen, username, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${encodeURIComponent(username)}/${type}`);
            const data = await res.json();
            setUsers(data[type] || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-900" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-100 dark:bg-zinc-900 w-1/2 rounded" />
                                        <div className="h-2 bg-gray-100 dark:bg-zinc-900 w-3/4 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : users.length > 0 ? (
                        users.map(user => (
                            <div key={user.id} className="flex items-center justify-between group">
                                <Link href={`/profile/${user.username}`} onClick={onClose} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 flex items-center justify-center text-xs font-black overflow-hidden">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm leading-none">{user.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 line-clamp-1">{user.bio || 'Explorer'}</p>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No signals found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
