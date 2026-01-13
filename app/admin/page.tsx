'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Plus, Trash2, Edit3, BarChart2, X, Users, MessageSquare, Shield, ShieldAlert, UserX } from 'lucide-react';
import { usePopup } from '@/lib/PopupContext';

type Tab = 'posts' | 'users';

export default function AdminDashboard() {
  const { showAlert, showConfirm } = usePopup();
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalUsers: 0, totalComments: 0, engagement: '0x' });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<'create' | 'edit' | null>(null);
  const [currentPost, setCurrentPost] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', content: '', image: '', tags: '' });

  const fetchData = async () => {
    setLoading(true);
    const [postsRes, statsRes, usersRes] = await Promise.all([
      fetch('/api/posts'),
      fetch('/api/admin/stats'),
      fetch('/api/admin/users')
    ]);
    const postsData = await postsRes.json();
    const statsData = await statsRes.json();
    const usersData = await usersRes.json();
    
    setPosts(postsData.posts || []);
    setStats(statsData);
    setUsers(usersData.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const url = showModal === 'edit' ? `/api/posts/${currentPost.id}` : '/api/posts';
      const method = showModal === 'edit' ? 'PATCH' : 'POST';


    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : formData.tags
      }),
    });

    if (res.ok) {
      setShowModal(null);
      setFormData({ title: '', content: '', image: '', tags: '' });
      fetchData();
    }
  };

    const handleDelete = async (id: string) => {
      showConfirm(
        'Are you sure you want to delete this transmission?',
        async () => {
          const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
          if (res.ok) fetchData();
        },
        'Confirm Deletion'
      );
    };

    const handleUpdateUser = async (userId: string, role: string) => {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        showAlert(data.error || 'Failed to update user', 'Update Failed');
      }
    };

    const handleDeleteUser = async (id: string) => {
      showConfirm(
        'Are you sure you want to delete this explorer?',
        async () => {
          const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchData();
          } else {
            const data = await res.json();
            showAlert(data.error || 'Failed to delete user', 'Deletion Failed');
          }
        },
        'Confirm Deletion'
      );
    };


  const openEditModal = (post: any) => {
    setCurrentPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image: post.image || '',
      tags: post.tags?.join(', ') || ''
    });
    setShowModal('edit');
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Control Center</h1>
            <p className="text-gray-500 text-sm font-bold tracking-widest uppercase mt-1">Vortex Administrative Terminal</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-white dark:bg-black shadow-sm' : 'text-gray-500'}`}
              >
                Transmissions
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white dark:bg-black shadow-sm' : 'text-gray-500'}`}
              >
                Explorers
              </button>
            </div>
            {activeTab === 'posts' && (
              <button 
                onClick={() => {
                  setFormData({ title: '', content: '', image: '', tags: '' });
                  setShowModal('create');
                }}
                className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Transmissions', value: stats.totalPosts, icon: Edit3 },
            { label: 'Explorers', value: stats.totalUsers, icon: Users },
            { label: 'Signals', value: stats.totalComments, icon: MessageSquare },
            { label: 'Engagement', value: stats.engagement, icon: BarChart2 },
          ].map((stat, i) => (
            <div key={i} className="p-6 border border-black/10 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/50">
              <stat.icon className="w-6 h-6 mb-4 text-gray-400" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-3xl font-black mt-1 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950">
          {activeTab === 'posts' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-black/10 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Post Title</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Date</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {posts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{post.title}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tight mt-0.5">By {post.author?.name || 'Vortex'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest">
                        Live
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(post.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEditModal(post)}
                        className="text-gray-400 hover:text-black dark:hover:text-white transition-colors mr-4"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs italic">
                      No active transmissions in the grid
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-900 border-b border-black/10 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Explorer</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Access Level</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Joined</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{user.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tight mt-0.5">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {user.role === 'admin' ? (
                        <button 
                          onClick={() => handleUpdateUser(user.id, 'user')}
                          className="text-gray-400 hover:text-amber-500 transition-colors mr-4"
                          title="Demote to User"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUpdateUser(user.id, 'admin')}
                          className="text-gray-400 hover:text-purple-500 transition-colors mr-4"
                          title="Promote to Admin"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete User"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative text-black dark:text-white">
            <button 
              onClick={() => setShowModal(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">
              {showModal === 'edit' ? 'Update Transmission' : 'New Transmission'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Title</label>
                <input 
                  required
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Content</label>
                <textarea 
                  required
                  rows={6}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Image URL</label>
                  <input 
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Tags (comma separated)</label>
                  <input 
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="px-6 py-3 font-bold uppercase tracking-widest text-sm hover:opacity-60 transition-opacity"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
                >
                  {showModal === 'edit' ? 'Update' : 'Transmit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
