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
    <div className="main-container" style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: '6rem' }}>
      <section className="hero-bg">
        <div className="hero-section">
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
            borderRadius: '2rem',
            boxShadow: '0 20px 48px rgba(0,0,0,0.08), 0 8px 24px rgba(220,38,38,0.06), 0 0 0 1px rgba(220,38,38,0.08)',
            padding: '3rem 2.5rem',
            margin: '2rem auto',
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
            position: 'relative',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(220,38,38,0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #dc2626',
            color: '#dc2626',
            borderRadius: '0.75rem',
            padding: '0.5rem 1rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.1)';
          }}
        >
          ← Back
        </button>
        <h2 style={{ color: '#dc2626', fontWeight: 700, marginBottom: 32, fontSize: '2rem' }}>My Profile</h2>
        {/* Profile Picture */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <img
              src={picPreview || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username)}
              alt="Profile"
              style={{ 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                objectFit: 'cover', 
                border: '3px solid #dc2626', 
                marginBottom: 12,
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.15)'
              }}
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
                  style={{ 
                    color: '#dc2626', 
                    background: 'rgba(220, 38, 38, 0.1)', 
                    border: '1px solid rgba(220, 38, 38, 0.3)', 
                    borderRadius: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    cursor: 'pointer', 
                    fontWeight: 600, 
                    fontSize: 12,
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                >
                  Change Picture
                </button>
              </>
            )}
          </div>
        </div>
        {/* Editable Fields */}
        <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div style={{ marginBottom: 20, textAlign: 'left' }}>
            <strong style={{ color: '#374151', display: 'block', marginBottom: 8, fontSize: '1rem' }}>Username:</strong>
            {editMode ? (
              <input
                type="text"
                value={editUser.username}
                onChange={e => setEditUser({ ...editUser, username: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid rgba(220, 38, 38, 0.2)',
                  borderRadius: '0.75rem',
                  color: '#1f2937',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#dc2626';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
            ) : (
              <div style={{ color: '#374151', marginTop: 4 }}>{user.username}</div>
            )}
          </div>
          <div style={{ marginBottom: 20, textAlign: 'left' }}>
            <strong style={{ color: '#374151', display: 'block', marginBottom: 8, fontSize: '1rem' }}>Email:</strong>
            {editMode ? (
              <input
                type="email"
                value={editUser.email}
                onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid rgba(220, 38, 38, 0.2)',
                  borderRadius: '0.75rem',
                  color: '#1f2937',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#dc2626';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
            ) : (
              <div style={{ color: '#374151', marginTop: 4 }}>{user.email}</div>
            )}
          </div>
          {editMode ? (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
              <button 
                type="submit" 
                style={{ 
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.75rem', 
                  padding: '0.75rem 1.5rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                }}
              >
                Save Changes
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.9)', 
                  color: '#dc2626', 
                  border: '2px solid #dc2626', 
                  borderRadius: '0.75rem', 
                  padding: '0.75rem 1.5rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => setEditMode(true)} 
              style={{ 
                background: 'rgba(220, 38, 38, 0.1)', 
                color: '#dc2626', 
                border: '2px solid #dc2626', 
                borderRadius: '0.75rem', 
                padding: '0.75rem 1.5rem', 
                fontWeight: 600, 
                cursor: 'pointer', 
                marginBottom: 20,
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Edit Profile
            </button>
          )}
        </form>
        {/* Change Password Section */}
        <div style={{ 
          margin: '2rem 0', 
          padding: '1.5rem', 
          background: 'rgba(248, 250, 252, 0.8)',
          borderRadius: '1rem',
          border: '1px solid rgba(220, 38, 38, 0.1)'
        }}>
          {showPw ? (
            <form onSubmit={handlePwChange} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="password"
                placeholder="Old Password"
                value={pwFields.old}
                onChange={e => setPwFields({ ...pwFields, old: e.target.value })}
                style={{ 
                  padding: '0.75rem 1rem', 
                  border: '1.5px solid rgba(220, 38, 38, 0.2)', 
                  borderRadius: '0.75rem', 
                  color: '#1f2937', 
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#dc2626';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={pwFields.new}
                onChange={e => setPwFields({ ...pwFields, new: e.target.value })}
                style={{ 
                  padding: '0.75rem 1rem', 
                  border: '1.5px solid rgba(220, 38, 38, 0.2)', 
                  borderRadius: '0.75rem', 
                  color: '#1f2937', 
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#dc2626';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={pwFields.confirm}
                onChange={e => setPwFields({ ...pwFields, confirm: e.target.value })}
                style={{ 
                  padding: '0.75rem 1rem', 
                  border: '1.5px solid rgba(220, 38, 38, 0.2)', 
                  borderRadius: '0.75rem', 
                  color: '#1f2937', 
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#dc2626';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
              <button 
                type="submit" 
                style={{ 
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.75rem', 
                  padding: '0.75rem 1.5rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                }}
              >
                Change Password
              </button>
              <button 
                type="button" 
                onClick={() => setShowPw(false)} 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.9)', 
                  color: '#dc2626', 
                  border: '2px solid #dc2626', 
                  borderRadius: '0.75rem', 
                  padding: '0.75rem 1.5rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                Cancel
              </button>
              {pwMsg && <div style={{ color: '#16a34a', marginTop: 8 }}>{pwMsg}</div>}
            </form>
          ) : (
            <button 
              type="button" 
              onClick={() => setShowPw(true)} 
              style={{ 
                background: 'rgba(220, 38, 38, 0.1)', 
                color: '#dc2626', 
                border: '2px solid #dc2626', 
                borderRadius: '0.75rem', 
                padding: '0.75rem 1.5rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Change Password
            </button>
          )}
        </div>
        {/* Success Message */}
        {showSuccess && (
          <div style={{ 
            color: '#059669', 
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginTop: 16,
            fontWeight: 600,
            animation: 'fadeIn 0.3s ease'
          }}>
            ✅ Profile updated successfully!
          </div>
        )}
        {pwMsg && (
          <div style={{ 
            color: pwMsg.includes('changed') ? '#059669' : '#dc2626', 
            background: pwMsg.includes('changed') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            border: `1px solid ${pwMsg.includes('changed') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginTop: 16,
            fontWeight: 600,
            animation: 'fadeIn 0.3s ease'
          }}>
            {pwMsg.includes('changed') ? '✅' : '⚠️'} {pwMsg}
          </div>
        )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage; 