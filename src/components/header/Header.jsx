import React, { useEffect, useState } from 'react';
import { Layout, Avatar, Badge, Dropdown, Menu, Divider, message } from 'antd';
import { 
  ClockCircleOutlined,
  CalendarOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  PoweroffOutlined,
  UserOutlined
} from '@ant-design/icons';
import { getCredentials } from '../../data/database';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.scss';

const { Header: AntHeader } = Layout;

const Header = ({ userDetails = {}, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [siteDomain, setSiteDomain] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const creds = await getCredentials();
        if (mounted && creds?.url) {
          setSiteDomain(creds.url);
        } else if (mounted && userDetails?.emailAddress) {
          const parts = String(userDetails.emailAddress).split('@');
          if (parts.length === 2) setSiteDomain(parts[1]);
        }
      } catch (e) {
        // noop
      }
    })();
    return () => { mounted = false; };
  }, [userDetails?.emailAddress]);
  
  // Normalize details (handle legacy shape with nested payload)
  const details = userDetails && userDetails.payload ? userDetails.payload : userDetails;
  const displayName = details?.displayName || details?.name || 'User';
  const email = details?.emailAddress || '';
  const timeZone = details?.timeZone || '';
  const locale = details?.locale || '';
  // Prefer 32x32 (mapped to 'medium' in validateAccount) with graceful fallbacks
  const avatarSrc =
    details?.avatarUrls?.medium ||
    details?.avatarUrls?.['32x32'] ||
    details?.avatarUrls?.large ||
    details?.avatarUrls?.small ||
    details?.avatarUrls?.extraSmall ||
    details?.avatarUrls?.['48x48'] ||
    details?.avatarUrls?.['24x24'] ||
    details?.avatarUrls?.['16x16'];

  const tabItems = [
    {
      key: '/timely',
      label: (
        <span>
          <BarChartOutlined />
          Timely
        </span>
      ),
    },
    {
      key: '/agenda',
      label: (
        <span>
          <UnorderedListOutlined />
          Agenda
        </span>
      ),
    },
    {
      key: '/calendar',
      label: (
        <span>
          <CalendarOutlined />
          Calendar
        </span>
      ),
    }
  ];

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/timely') return '/timely';
    return path;
  };

  const handleTabChange = (key) => {
    if (key === '/timely') {
      navigate('/');
    } else {
      navigate(key);
    }
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'settings') {
      navigate('/settings');
    }
    if (key === 'logout' && onLogout) {
      onLogout();
      message.success('Logged out');
      navigate('/login');
    }
  };

  const profileMenu = (
    <Menu onClick={handleMenuClick} selectable={false}>
      <Menu.Item key="profile-info" disabled>
        <div className="profile-summary">
          <Avatar src={avatarSrc} icon={<UserOutlined />} size={48} />
          <div className="profile-meta">
            <div className="name">{displayName}</div>
            {email && <div className="email">{email}</div>}
            {siteDomain && (
              <div className="meta">Site: {siteDomain}</div>
            )}
            {(timeZone || locale) && (
              <div className="meta">
                {timeZone}{timeZone && locale ? ' · ' : ''}{locale}
              </div>
            )}
          </div>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="settings" icon={<SettingOutlined />}>Settings</Menu.Item>
      <Menu.Item key="logout" icon={<PoweroffOutlined />} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="app-title">
            <ClockCircleOutlined style={{ marginRight: 8, fontSize: '20px' }} />
            <span>Jira Timely</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="nav-tabs-container">
            <div className="nav-tabs">
              {tabItems.map(tab => (
                <div 
                  key={tab.key}
                  className={`nav-tab ${getCurrentTab() === tab.key ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="header-right">
          <Dropdown overlay={profileMenu} placement="bottomRight" trigger={["click"]}>
            <div className="user-info clickable">
              <Badge dot status="success" offset={[-4, 4]}>
                <Avatar src={avatarSrc} icon={<UserOutlined />} size="default" />
              </Badge>
              <span className="user-name">{displayName}</span>
            </div>
          </Dropdown>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
