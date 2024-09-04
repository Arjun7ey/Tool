  import React, { useState, useEffect } from 'react';
  import { AppBar, Toolbar, IconButton, Badge, Box, Typography, Menu, MenuItem, Dialog, DialogActions, DialogTitle, Button } from '@mui/material';
  import { ChevronLeft as ChevronFirst, ChevronRight as ChevronLast } from '@mui/icons-material';
  import { NotificationsOutlined as NotificationsOutlinedIcon, ArrowDropDownOutlined as ArrowDropDownOutlinedIcon, SettingsOutlined as SettingsOutlinedIcon } from '@mui/icons-material';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../Components/utils/AuthContext';
  import AccountCircle from '@mui/icons-material/AccountCircle';
  import axiosInstance from '../Components/utils/axiosInstance'; 
  import '../Components/Styles/Header.css';

  import { BASE_URL } from '../config';
  export default function Header({ expanded, setExpanded }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const { userData, fetchUserData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (userData.userId) {
        fetchNotifications();
      } else {
        navigate('/');
      }
    }, [userData, navigate]);

    const handleSettingsClick = () => {
      if (userData && userData.userId) {
        const targetUrl = `/usersdetails/${userData.userId}`;
        navigate(targetUrl);
      } else {
        console.error('User data is not available for navigation');
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get('/api/notifications/');
        const unreadNotifications = response.data.filter(notification => !notification.read);
        setNotifications(unreadNotifications);
        setUnreadNotificationsCount(unreadNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const handleNotificationsOpen = async (event) => {
      setNotificationAnchorEl(event.currentTarget);
      try {
        await axiosInstance.post('/api/notifications/mark-all-read/');
        fetchNotifications(); // Update notifications and count
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    };

    const handleNotificationsClose = () => {
      setNotificationAnchorEl(null);
    };

    const handleNotificationClick = async (notificationId) => {
      try {
        await axiosInstance.post(`/api/notifications/${notificationId}/mark-read/`);
        fetchNotifications(); // Refresh notifications and count
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };

    const handleProfileMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleLogoutClick = () => {
      setOpenDialog(true);
    };

    const handleLogout = async () => {
      try {
        await fetchUserData();
        navigate('/');
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        setOpenDialog(false);
        handleMenuClose();
      }
    };

    const handleCancel = () => {
      setOpenDialog(false);
    };

    const isMenuOpen = Boolean(anchorEl);
    const isNotificationMenuOpen = Boolean(notificationAnchorEl);

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        className='profile-box'
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogoutClick}>Log Out</MenuItem>
      </Menu>
    );

    return (
      <Box sx={{ flexGrow: 1 }} className="header-box">
        <AppBar position="static" style={{ backgroundColor: 'white', boxShadow: 'none', overflow: 'hidden' }}>
          <Toolbar sx={{ position: 'relative' }}>
      

            <Box sx={{ flexGrow: 1 }} /> {/* Pushes icons to the right */}

            <Box sx={{ display: 'flex', alignItems: 'center', marginRight: expanded ? '120px' : '320px', position: 'relative' }}>
              <IconButton onClick={handleNotificationsOpen} className='notifi-icon' disableRipple>
                <Badge badgeContent={unreadNotificationsCount} color="secondary">
                  <NotificationsOutlinedIcon style={{ color: '#262b3b' }} />
                </Badge>
              </IconButton>

              <IconButton onClick={handleProfileMenuOpen} className="header-profile no-hover" disableRipple>
                {userData.profilePicture ? (
                  <img
                    src={`${BASE_URL}${userData.profilePicture}`}
                    alt='Profile'
                    className='header-avatar'
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <AccountCircle className="profile-icon" style={{ fontSize: '40px', color: '#262b3b' }} />
                )}
                <Box className="header-profile-text">
                  <Typography variant="body2" className="header-profile-role" style={{ color: '#262b3b' }}>
                    {userData.fullName}
                  </Typography>
                </Box>
                <ArrowDropDownOutlinedIcon style={{ color: '#262b3b' }} />
              </IconButton>

              <IconButton className="settings-icon" onClick={handleSettingsClick}>
                <SettingsOutlinedIcon style={{ color: '#262b3b' }} />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        {renderMenu}

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={isNotificationMenuOpen}
          onClose={handleNotificationsClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {notifications.length === 0 ? (
            <MenuItem disabled>No notifications</MenuItem>
          ) : (
            notifications.map(notification => (
              <MenuItem 
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
              >
                {notification.message}
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Logout Dialog */}
        <Dialog open={openDialog} onClose={handleCancel}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogActions>
            <Button onClick={handleCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleLogout} color="primary">
              Logout
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
