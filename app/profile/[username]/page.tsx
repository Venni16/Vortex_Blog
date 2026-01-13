'use client';

import React, { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import FollowListModal from '@/components/FollowListModal';
import { Settings, Grid, Bookmark, Tag, X, UserPlus, UserCheck, Camera, Loader2 } from 'lucide-react';
import { usePopup } from '@/lib/PopupContext';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { showAlert } = usePopup();
  const { username } = use(params);
  // Decode username
  const decodedUsername = decodeURIComponent(username);

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', bio: '', avatar: '', username: '' });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [followModal, setFollowModal] = useState<{ isOpen: boolean; type: 'followers' | 'following' }>({ isOpen: false, type: 'followers' });

  const fetchProfile = async () => {

    if (!decodedUsername || decodedUsername === 'undefined') return;
    const [profileRes, meRes] = await Promise.all([
      fetch(`/api/users/${encodeURIComponent(decodedUsername)}`),
      fetch('/api/auth/me')
    ]);
    const profileData = await profileRes.json();
    const meData = await meRes.json();

    setProfile(profileData.user);
    setCurrentUser(meData.user);
    setIsFollowing(profileData.user?.isFollowing);
    setEditData({
      name: profileData.user?.name || '',
      bio: profileData.user?.bio || '',
      avatar: profileData.user?.avatar || '',
      username: profileData.user?.username || ''
    });
  };


  const fetchPosts = async () => {
    if (!decodedUsername || decodedUsername === 'undefined') return;
    const url = activeTab === 'posts' ? `/api/users/${encodeURIComponent(decodedUsername)}/posts` : `/api/users/${encodeURIComponent(decodedUsername)}/saved`;
    const res = await fetch(url);
    const data = await res.json();
    setPosts(data.posts || []);
  };

  useEffect(() => {
    const init = async () => {
      if (!decodedUsername || decodedUsername === 'undefined') return;
      setLoading(true);
      await fetchProfile();
      await fetchPosts();
      setLoading(false);
    };
    init();
  }, [decodedUsername]);

  useEffect(() => {
    if (!loading && decodedUsername && decodedUsername !== 'undefined') fetchPosts();
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decodedUsername || decodedUsername === 'undefined') return;
    const res = await fetch(`/api/users/${encodeURIComponent(decodedUsername)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      setIsEditModalOpen(false);
      fetchProfile();
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profile?.username) return;
    const res = await fetch(`/api/users/${encodeURIComponent(profile.username)}/follow`, { method: 'POST' });
    if (res.ok) {
      setIsFollowing(!isFollowing);
      fetchProfile();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setEditData({ ...editData, avatar: data.url });
      } catch (error) {
        console.error('Avatar upload error:', error);
        showAlert('Failed to upload avatar', 'Upload Error');
      } finally {

      setIsUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white dark:bg-black" />;

  if (!profile) {
    return (
      <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Transmission Lost</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mb-8">This frequency is currently silent. The user you are looking for does not exist in the vortex.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
          >
            Return to Core
          </button>
        </div>
      </main>
    );
  }

  const isOwnProfile = currentUser?.username === decodedUsername;

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-12 mb-16 px-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-100 dark:bg-zinc-900 border-2 border-black/10 dark:border-white/10 flex items-center justify-center text-5xl font-black italic overflow-hidden shadow-xl">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile?.name?.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">{profile?.name}</h1>
              <p className="text-sm font-bold text-gray-500">@{profile?.username}</p>
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg text-sm font-bold hover:opacity-80 transition-opacity"
                    >
                      Edit Profile
                    </button>
                    <button className="p-2 border border-black/10 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${isFollowing
                      ? 'bg-gray-100 dark:bg-zinc-900 text-black dark:text-white'
                      : 'bg-black dark:bg-white text-white dark:text-black hover:scale-105'
                      }`}
                  >
                    {isFollowing ? (
                      <><UserCheck className="w-4 h-4" /> Following</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Follow</>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-8 mb-6">
              <div className="text-center md:text-left">
                <span className="font-black text-lg block md:inline">{profile?.postsCount || 0}</span>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1">Posts</span>
              </div>
              <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setFollowModal({ isOpen: true, type: 'followers' })}>
                <span className="font-black text-lg block md:inline">{profile?.followersCount || 0}</span>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1">Followers</span>
              </div>
              <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setFollowModal({ isOpen: true, type: 'following' })}>
                <span className="font-black text-lg block md:inline">{profile?.followingCount || 0}</span>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1">Following</span>
              </div>
            </div>


            <div className="max-w-md">
              <p className="font-bold text-sm mb-1 uppercase tracking-tight">Vortex Explorer</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                {profile?.bio || "No frequency established yet. Navigating the void."}
              </p>
            </div>
          </div>
        </header>

        <div className="border-t border-black/10 dark:border-white/10">
          <div className="flex justify-center gap-12 -mt-[1px]">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-t ${activeTab === 'posts' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400'
                }`}
            >
              <Grid className="w-4 h-4" /> Posts
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-t ${activeTab === 'saved' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400'
                }`}
            >
              <Bookmark className="w-4 h-4" /> Saved
            </button>
            <button className="flex items-center gap-2 py-4 text-gray-400 text-xs font-black uppercase tracking-[0.2em] cursor-not-allowed opacity-50">
              <Tag className="w-4 h-4" /> Tagged
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))}
            {posts.length === 0 && (
              <div className="col-span-full text-center py-20 bg-gray-50/50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5">
                <p className="text-gray-400 font-black uppercase tracking-widest">No transmissions found in this frequency</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <FollowListModal
        isOpen={followModal.isOpen}
        onClose={() => setFollowModal({ ...followModal, isOpen: false })}
        title={followModal.type}
        username={profile?.username}
        type={followModal.type}
      />

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-black dark:text-white">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6 text-black dark:text-white">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-zinc-900 border-2 border-black/10 dark:border-white/10 flex items-center justify-center text-3xl font-black italic overflow-hidden">
                    {editData.avatar ? (
                      <img src={editData.avatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      editData.name?.charAt(0).toUpperCase()
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-black dark:bg-white text-white dark:text-black rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                    <Camera className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                  </label>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tap camera to upload photo</p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Display Name</label>

                <input
                  required
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Username</label>

                <input
                  required
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
                  value={editData.username}
                  onChange={e => setEditData({ ...editData, username: e.target.value })}
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-2 text-gray-500">Bio</label>

                <textarea
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 ring-black dark:ring-white outline-none transition-all"
                  value={editData.bio}
                  onChange={e => setEditData({ ...editData, bio: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 font-bold uppercase tracking-widest text-sm hover:opacity-60 transition-opacity"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
