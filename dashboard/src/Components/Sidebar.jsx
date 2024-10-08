import React, { useContext, useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../Contexts/ThemeContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { useAuth } from '../Components/utils/AuthContext';
import AppsIcon from '@mui/icons-material/Apps';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import AssignmentIcon from '@mui/icons-material/Assignment';

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
import PollIcon from '@mui/icons-material/Poll'; 
import CreateIcon from '@mui/icons-material/Create'; 
import ListAltIcon from '@mui/icons-material/ListAlt'; 


import eyLight from '../assets/images/logo/EYLight.jpeg';
import eyDark from '../assets/images/logo/EYDark.jpeg';
import eyCustom from '../assets/images/logo/EYDark.jpeg';
import axiosInstance from '../Components/utils/axiosInstance';

const CustomSidebar = () => {
  const { theme, setSpecificTheme, currentTheme } = useContext(ThemeContext);
  const [activePath, setActivePath] = useState('/');
  const [openSubMenus, setOpenSubMenus] = useState([]);
  const [userModules, setUserModules] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, fetchUserData } = useAuth();

  useEffect(() => {
    if (!userData.userId) {
      navigate('/');
    }
  }, [userData, navigate]);

  useEffect(() => {
    setActivePath(location.pathname);
    const activeSubMenu = menuItems.find(item => 
      item.subItems && item.subItems.some(subItem => subItem.path === location.pathname)
    );
    if (activeSubMenu) {
      setOpenSubMenus(prev => [...prev, activeSubMenu.key]);
    }
    setSelectedItem(location.pathname);
  }, [location]);

  useEffect(() => {
    if (userData.userId) {
      axiosInstance.get('/api/user-modules/')
        .then(response => {
          const modules = response.data;
          setUserModules(modules.map(module => module.name));
        })
        .catch(error => {
          console.error('Error fetching user modules:', error);
          setUserModules([]);
        });
    }
  }, [userData]);

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
    setSelectedItem(path);
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
    button: ({ level, active }) => {
      return {
        padding: '12px 16px',
        backgroundColor: active ? '#FFD700' : 'transparent',
        color: active ? '#000000' : currentTheme.menu.color,
        '&:hover': {
          backgroundColor: '#FFD700',
          color: '#000000',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          border: '2px solid #FFD700',
          transition: 'all 0.3s ease',
        },
      };
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
        (userData.userRole === 'superadmin' || userModules.includes('Videos')) ? { label: 'Video', icon: <VideocamIcon />, path: '/videos' } : null,
        (userData.userRole === 'superadmin' || userModules.includes('Images')) ? { label: 'Images', icon: <ImageIcon />, path: '/images' } : null,
        (userData.userRole === 'superadmin' || userModules.includes('Documents')) ? { label: 'Documents', icon: <DocumentIcon />, path: '/documents' } : null,
        (userData.userRole === 'superadmin' || userModules.includes('Posts')) ? { label: 'Posts', icon: <PostIcon />, path: '/posts' } : null,
        (userData.userRole === 'superadmin' || userModules.includes('Links')) ? { label: 'Links', icon: <LinkIcon />, path: '/links' } : null,
      ].filter(Boolean)
    },
    { 
      key: 'events', 
      label: 'Event Management', 
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
        { label: 'Users', icon: <PeopleIcon />, path: '/users' },
        { label: 'Messenger', icon: <ChatBubbleOutlineIcon />, path: '/messenger' }
      ] 
    },
    { 
      key: 'survey', 
      label: 'Survey', 
      icon: <PollIcon  />, 
      subItems: [
        { label: 'Create Survey', icon: <CreateIcon />, path: '/survey' },
        { label: 'Survey List', icon: <ListAltIcon />, path: '/surveylist' }
      ] 
    },
    {
      key: 'tickets',
      label: 'Tickets',
      icon: <LocalActivityIcon />,
      subItems: [
        { label: 'Assign Tickets', icon: <AssignmentIcon />, path: '/ticketassign' },
        { label: 'Ticket List', icon: <ListAltIcon />, path: '/ticketlist' }
      ]
    },
    { key: 'issues', label: 'Issue Tracker', icon: <BugReportIcon />, path: '/moms' },
    ...(userData.userRole === 'superadmin' ? [{ key: 'modules', label: 'Modules Management', icon: <AppsIcon />, path: '/modules' }] : []),
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
            {/* <img src={getLogoForTheme()} className="eylogo w-12" alt="EY Logo" /> */}
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
                        active={selectedItem === subItem.path}
                      >
                        {subItem.label}
                      </MenuItem>
                    ))}
                  </SubMenu>
                ) : (
                  <MenuItem
                    key={item.path}
                    icon={item.icon}
                    onClick={() => handleMenuItemClick(item.path)}
                    active={selectedItem === item.path}
                  >
                    {item.label}
                  </MenuItem>
                )
              ))}
            </Menu>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default CustomSidebar;