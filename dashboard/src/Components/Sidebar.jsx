import React, { useContext, useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../Contexts/ThemeContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import {
  Dashboard as DashboardIcon,
  Videocam as VideocamIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  PostAdd as PostIcon,
  Link as LinkIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Photo as PhotoLibraryIcon,
  BugReport as BugReportIcon,
  Chat as ChatBubbleOutlineIcon,
  BarChart as AnalyticsIcon
} from '@mui/icons-material';

import eyLight from '../assets/images/logo/EYLight.jpeg';
import eyDark from '../assets/images/logo/EYDark.jpeg';
import eyCustom from '../assets/images/logo/EYDark.jpeg';

const CustomSidebar = () => {
  const { theme, setSpecificTheme, currentTheme } = useContext(ThemeContext);
  const [activePath, setActivePath] = useState('/');
  const [openSubMenus, setOpenSubMenus] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setActivePath(location.pathname);
    const activeSubMenu = menuItems.find(item => 
      item.subItems && item.subItems.some(subItem => subItem.path === location.pathname)
    );
    if (activeSubMenu) {
      setOpenSubMenus(prev => [...prev, activeSubMenu.key]);
    }
  }, [location]);

  const handleIconClick = (selectedTheme) => {
    if (setSpecificTheme) {
      setSpecificTheme(selectedTheme);
    } else {
      console.error('setSpecificTheme is not defined in ThemeContext');
    }
  };

  const getLogoForTheme = () => {
    switch (theme) {
      case 'light': return eyLight;
      case 'dark': return eyDark;
      case 'custom': return eyCustom;
      default: return eyDark;
    }
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setActivePath(path);
  };

  const handleSubMenuClick = (key) => {
    setOpenSubMenus(prev => 
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]
    );
  };

  const menuItemStyles = {
    root: {
      fontSize: '13px',
      fontWeight: 400,
    },
    icon: {
      color: currentTheme.menu.icon,
    },
    button: {
      padding: '12px 16px',
      '&:hover': {
        backgroundColor: currentTheme.menu.hover.backgroundColor,
        color: currentTheme.menu.hover.color,
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        border: '2px solid #FFD700',
        transition: 'all 0.3s ease',
      },
      '&.ps-active': {
        backgroundColor: currentTheme.menu.hover.backgroundColor,
        color: currentTheme.menu.hover.color,
        borderRadius: '8px',
      },
    },
    subMenuContent: {
      backgroundColor: currentTheme.sidebar.backgroundColor,
    },
    SubMenuExpandIcon: {
      color: currentTheme.menu.icon,
    },
  };

  const menuItems = [
    { key: 'dashboard', label: 'Admin Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { 
      key: 'analytics', 
      label: 'Analytics', 
      icon: <AnalyticsIcon />,
      subItems: [
        { label: 'Social Media Analysis', icon: <AnalyticsIcon />, path: '/sentiments' },
      ]
    },
    { 
      key: 'Contents', 
      label: 'Contents', 
      icon: <PhotoLibraryIcon />,   
      subItems: [
        { label: 'Video', icon: <VideocamIcon />, path: '/videos' },
        { label: 'Images', icon: <ImageIcon />, path: '/images' },
        { label: 'Documents', icon: <DocumentIcon />, path: '/documents' },
        { label: 'Posts', icon: <PostIcon />, path: '/posts' },
        { label: 'Links', icon: <LinkIcon />, path: '/links' },
      ] 
    },
    { 
      key: 'events', 
      label: 'Events', 
      icon: <EventIcon />,
      subItems: [
        { label: 'Events', icon: <EventIcon />, path: '/events' },
        { label: 'Contents', icon: <PhotoLibraryIcon />, path: '/contents' }
      ] 
    },
    { 
      key: 'users', 
      label: 'Users', 
      icon: <PeopleIcon />, 
      subItems: [
        { label: 'Messenger', icon: <ChatBubbleOutlineIcon />, path: '/messenger' }
      ] 
    },
    { key: 'issues', label: 'Issue Tracker', icon: <BugReportIcon />, path: '/moms' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', margin: 0 }}>
      <Sidebar
        backgroundColor={currentTheme.sidebar.backgroundColor}
        rootStyles={{
          color: currentTheme.sidebar.color,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img src={getLogoForTheme()} className="eylogo w-12" alt="EY Logo" />
            <div style={{ display: 'flex', gap: '8px' }}>
              <LightModeIcon 
                style={{ cursor: 'pointer', color: theme === 'light' ? '#FFD700' : '#000000', fontSize: '24px' }} 
                onClick={() => handleIconClick('light')} 
              />
              <DarkModeIcon 
                style={{ cursor: 'pointer', color: theme === 'dark' ? '#FFD700' : '#000000', fontSize: '24px' }} 
                onClick={() => handleIconClick('dark')} 
              />
              <AutoModeIcon 
                style={{ cursor: 'pointer', color: theme === 'custom' ? '#FFD700' : '#000000', fontSize: '24px' }} 
                onClick={() => handleIconClick('custom')} 
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Menu menuItemStyles={menuItemStyles}>
              {menuItems.map((item) => (
                item.subItems ? (
                  <SubMenu
                    key={item.key}
                    label={item.label}
                    icon={item.icon}
                    open={openSubMenus.includes(item.key)}
                    onOpenChange={() => handleSubMenuClick(item.key)}
                  >
                    {item.subItems.map((subItem) => (
                      <MenuItem
                        key={subItem.path}
                        icon={subItem.icon}
                        onClick={() => handleMenuItemClick(subItem.path)}
                        active={activePath === subItem.path}
                      >
                        {subItem.label}
                      </MenuItem>
                    ))}
                  </SubMenu>
                ) : (
                  <MenuItem
                    key={item.key}
                    icon={item.icon}
                    onClick={() => handleMenuItemClick(item.path)}
                    active={activePath === item.path}
                  >
                    {item.label}
                  </MenuItem>
                )
              ))}
            </Menu>
          </div>
        </div>
      </Sidebar>
      <div style={{ flex: 1, height: '100vh' }}>
        {/* This is where the main content would be placed */}
      </div>
    </div>
  );
};

export default CustomSidebar;