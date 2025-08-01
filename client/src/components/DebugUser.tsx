import React from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

interface DebugUserProps {
  user: User | null;
}

const DebugUser: React.FC<DebugUserProps> = ({ user }) => {
  const [localStorageUser, setLocalStorageUser] = React.useState<any>(null);

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setLocalStorageUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Error parsing localStorage user:', error);
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <strong>🔍 Debug: No User Logged In</strong>
        <br />
        localStorage user: {localStorageUser ? 'Present' : 'None'}
        {localStorageUser && (
          <div>
            <br />
            Role: {localStorageUser.role || 'undefined'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#d1fae5',
      border: '1px solid #10b981',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <strong>🔍 Debug: User Logged In</strong>
      <br />
      Username: {user.username}
      <br />
      Role: {user.role || 'undefined'}
      <br />
      ID: {user.id}
      <br />
      <br />
      <strong>localStorage:</strong>
      <br />
      Role: {localStorageUser?.role || 'undefined'}
      <br />
      <br />
      <strong>Admin Check:</strong>
      <br />
      user.role === 'admin': {user.role === 'admin' ? '✅ TRUE' : '❌ FALSE'}
      <br />
      localStorageUser?.role === 'admin': {localStorageUser?.role === 'admin' ? '✅ TRUE' : '❌ FALSE'}
    </div>
  );
};

export default DebugUser; 