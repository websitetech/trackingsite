import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Placeholder user data. Replace with context or props as needed.
const initialUser = {
  username: 'john_doe',
  email: 'john@example.com',
  profilePic: '', // base64 or url
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState(user);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pwFields, setPwFields] = useState({ old: '', new: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [picPreview, setPicPreview] = useState(user.profilePic);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle profile edit
  const handleSave = () => {
    setUser(editUser);
    setEditMode(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };
  const handleCancel = () => {
    setEditUser(user);
    setEditMode(false);
  };

  // Handle password change (mock)
  const handlePwChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwFields.old || !pwFields.new || !pwFields.confirm) {
      setPwMsg('Please fill all fields.');
      return;
    }
    if (pwFields.new !== pwFields.confirm) {
      setPwMsg('New passwords do not match.');
      return;
    }
    setPwMsg('Password changed! (mock)');
    setTimeout(() => setPwMsg(''), 2000);
    setPwFields({ old: '', new: '', confirm: '' });
    setShowPw(false);
  };

  // Handle profile pic upload (mock)
  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setPicPreview(ev.target?.result as string);
        setEditUser({ ...editUser, profilePic: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6' }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        padding: '2.5rem 2rem',
        maxWidth: 400,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            background: 'none',
            border: '2px solid #dc2626',
            color: '#dc2626',
            borderRadius: 8,
            padding: '0.25rem 0.75rem',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.color = '#b91c1c';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#dc2626';
          }}
        >
          ← Back
        </button>
        <h2 style={{ color: '#b91c1c', fontWeight: 700, marginBottom: 24 }}>My Profile</h2>
        {/* Profile Picture */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <img
              src={picPreview || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username)}
              alt="Profile"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #b91c1c', marginBottom: 8 }}
            />
            {editMode && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handlePicChange}
                />
                <button
                  style={{ color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Picture
                </button>
              </>
            )}
          </div>
        </div>
        {/* Editable Fields */}
        <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ color: '#1a1a1a' }}>Username:</strong>
            {editMode ? (
              <input
                type="text"
                value={editUser.username}
                onChange={e => setEditUser({ ...editUser, username: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '0.5rem',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  color: '#000', // force black text
                  background: '#fff', // force white background
                  fontSize: 15,
                }}
                required
              />
            ) : (
              <div style={{ color: '#374151', marginTop: 4 }}>{user.username}</div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong style={{ color: '#1a1a1a' }}>Email:</strong>
            {editMode ? (
              <input
                type="email"
                value={editUser.email}
                onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '0.5rem',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 8,
                  color: '#000', // force black text
                  background: '#fff', // force white background
                  fontSize: 15,
                }}
                required
              />
            ) : (
              <div style={{ color: '#374151', marginTop: 4 }}>{user.email}</div>
            )}
          </div>
          {editMode ? (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
              <button type="submit" style={{ background: '#b91c1c', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>Save</button>
              <button type="button" onClick={handleCancel} style={{ background: 'none', color: '#b91c1c', border: '1.5px solid #b91c1c', borderRadius: 8, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditMode(true)} style={{ background: 'none', color: '#b91c1c', border: '1.5px solid #b91c1c', borderRadius: 8, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>Edit Profile</button>
          )}
        </form>
        {/* Change Password Section */}
        <div style={{ margin: '1.5rem 0' }}>
          {showPw ? (
            <form onSubmit={handlePwChange} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="password"
                placeholder="Old Password"
                value={pwFields.old}
                onChange={e => setPwFields({ ...pwFields, old: e.target.value })}
                style={{ padding: '0.5rem', border: '1.5px solid #e5e7eb', borderRadius: 8, color: '#000', background: '#fff' }}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={pwFields.new}
                onChange={e => setPwFields({ ...pwFields, new: e.target.value })}
                style={{ padding: '0.5rem', border: '1.5px solid #e5e7eb', borderRadius: 8, color: '#000', background: '#fff' }}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={pwFields.confirm}
                onChange={e => setPwFields({ ...pwFields, confirm: e.target.value })}
                style={{ padding: '0.5rem', border: '1.5px solid #e5e7eb', borderRadius: 8, color: '#000', background: '#fff' }}
                required
              />
              <button type="submit" style={{ background: '#b91c1c', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>Change Password</button>
              <button type="button" onClick={() => setShowPw(false)} style={{ background: 'none', color: '#b91c1c', border: '1.5px solid #b91c1c', borderRadius: 8, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              {pwMsg && <div style={{ color: '#16a34a', marginTop: 8 }}>{pwMsg}</div>}
            </form>
          ) : (
            <button type="button" onClick={() => setShowPw(true)} style={{ background: 'none', color: '#b91c1c', border: '1.5px solid #b91c1c', borderRadius: 8, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>Change Password</button>
          )}
        </div>
        {/* Success Message */}
        {showSuccess && <div style={{ color: '#16a34a', marginTop: 8 }}>Profile updated!</div>}
      </div>
    </div>
  );
};

export default ProfilePage; 