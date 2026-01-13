'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Check } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.notifications.filter((n: any) => !n.read).length);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markRead = async () => {
        if (unreadCount > 0) {
            await fetch('/api/notifications', { method: 'PATCH' });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const toggleOpen = () => {
        if (!isOpen) {
            markRead();
        }
        setIsOpen(!isOpen);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart className="w-4 h-4 fill-red-500 text-red-500" />;
            case 'comment': return <MessageCircle className="w-4 h-4 fill-blue-500 text-blue-500" />;
            case 'follow': return <UserPlus className="w-4 h-4 fill-green-500 text-green-500" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className="relative p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-black animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase tracking-widest">Notifications</h3>
                        {unreadCount > 0 && <span className="text-[10px] text-gray-400">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <Link
                                    href={n.type === 'follow' ? `/profile/${n.actor_id}` : `/posts/${n.post_id}`}
                                    key={n.id}
                                    onClick={() => setIsOpen(false)}
                                    className={`block p-4 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors border-b border-black/5 dark:border-white/5 last:border-0 ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            {getIcon(n.type)}
                                        </div>
                                        <div>
                                            <p className="text-xs leading-relaxed">
                                                <span className="font-bold">{n.actor?.name}</span>
                                                <span className="text-gray-500">
                                                    {n.type === 'like' && ` liked your transmission`}
                                                    {n.type === 'comment' && ` replied to your signal`}
                                                    {n.type === 'follow' && ` started following you`}
                                                </span>
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{new Date(n.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-xs uppercase tracking-widest font-bold">
                                No new signals
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
