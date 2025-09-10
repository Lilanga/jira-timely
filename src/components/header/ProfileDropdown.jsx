import React from 'react';
import { Dropdown, Menu, Avatar, Badge } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  PoweroffOutlined
} from '@ant-design/icons';

const ProfileDropdown = ({ userDetails = {}, onLogout, navigate }) => {
  
  const handleMenuClick = ({ key }) => {
    console.log('Menu clicked:', key);
    
    switch (key) {
      case 'settings':
        console.log('Navigating to settings...');
        if (navigate) {
          navigate('/settings');
        }
        break;
      case 'logout':
        console.log('Logging out...');
        if (onLogout) {
          onLogout();
        }
        break;
      default:
        break;
    }
  };

  // Simplified menu without complex header
  const profileMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile-info" disabled style={{ cursor: 'default', opacity: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
          <Avatar
            src={userDetails?.avatarUrls?.large || userDetails?.avatarUrls?.medium}
            icon={<UserOutlined />}
            size={32}
          />
          <div>
            <div style={{ fontWeight: 'bold', color: '#262626', marginBottom: 2 }}>
              {userDetails?.displayName || userDetails?.name || 'User'}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {userDetails?.emailAddress || userDetails?.email || 'No email'}
            </div>
          </div>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="logout" 
        icon={<PoweroffOutlined />}
        style={{ color: '#ff4d4f' }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      overlay={profileMenu}
      placement="bottomRight"
      trigger={['click']}
    >
      <div 
        className="profile-section"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: 8,
          transition: 'all 0.3s ease'
        }}
      >
        <Badge dot status="success" offset={[-4, 4]}>
          <Avatar
            src={userDetails?.avatarUrls?.large || userDetails?.avatarUrls?.medium}
            icon={<UserOutlined />}
            size="default"
          />
        </Badge>
        <span style={{ fontWeight: 500, color: '#262626', fontSize: 14 }}>
          {userDetails?.displayName || userDetails?.name || 'User'}
        </span>
      </div>
    </Dropdown>
  );
};

export default ProfileDropdown;