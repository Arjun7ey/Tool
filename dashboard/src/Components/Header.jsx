import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Badge, 
  Box, 
  Typography, 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogActions, 
  DialogTitle, 
  Button, 
  Avatar, 
  Tooltip 
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled, alpha } from '@mui/material/styles';
import { 
  NotificationsOutlined, 
  SettingsOutlined, 
  ExitToApp, 
  AccountCircle 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/utils/AuthContext';
import axiosInstance from '../Components/utils/axiosInstance'; 
import { BASE_URL } from '../config';

const SIDEBAR_WIDTH = 250; 

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'isAnyModalOpen',
})(({ theme, isAnyModalOpen }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: 'none',
  position: 'fixed',
  top: 0,
  left: `${SIDEBAR_WIDTH}px`,
  right: 0,
  width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
  zIndex: isAnyModalOpen ? -1 : theme.zIndex.appBar,
  pointerEvents: isAnyModalOpen ? 'none' : 'auto',
  transition: theme.transitions.create(['z-index', 'pointer-events', 'background-color'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FFD700',
    color: '#000',
    fontWeight: 'bold',
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid #FFD700',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
}));

export default function Header({ isAnyModalOpen }) {
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
      navigate(`/usersdetails/${userData.userId}`);
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

  const handleNotificationsOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationAnchorEl(null);
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

  return (
    <StyledAppBar isAnyModalOpen={isAnyModalOpen}>
      <Toolbar sx={{ 
        justifyContent: 'flex-end', 
        minHeight: '64px',
        paddingRight: { xs: '16px', sm: '24px' },
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          opacity: isAnyModalOpen ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}>
          <Tooltip title="Notifications">
            <IconWrapper>
              <IconButton onClick={handleNotificationsOpen} size="small">
                <StyledBadge badgeContent={unreadNotificationsCount}>
                  <NotificationsOutlined sx={{ color: '#000' }} />
                </StyledBadge>
              </IconButton>
            </IconWrapper>
          </Tooltip>

          <Tooltip title={userData.fullName || 'Profile'}>
            <IconWrapper>
              <IconButton onClick={handleProfileMenuOpen} size="small">
                {userData.profilePicture ? (
                  <Avatar
                    src={`${BASE_URL}${userData.profilePicture}`}
                    alt={userData.fullName}
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      border: '2px solid #FFD700',
                    }}
                  />
                ) : (
                  <AccountCircle sx={{ color: '#000', fontSize: 32 }} />
                )}
              </IconButton>
            </IconWrapper>
          </Tooltip>

          <Tooltip title="Settings">
            <IconWrapper>
              <IconButton onClick={handleSettingsClick} size="small">
                <SettingsOutlined sx={{ color: '#000' }} />
              </IconButton>
            </IconWrapper>
          </Tooltip>
        </Box>
      </Toolbar>

      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogoutClick}>
          <ExitToApp sx={{ mr: 1, color: '#000' }} />
          <Typography color="#000">Logout</Typography>
        </MenuItem>
      </StyledMenu>

      <StyledMenu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationsClose}
      >
        <AnimatePresence>
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <Typography color="#000">No notifications</Typography>
            </MenuItem>
          ) : (
            notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <MenuItem onClick={() => handleNotificationsClose()}>
                  <Typography color="#000">{notification.message}</Typography>
                </MenuItem>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </StyledMenu>

      <Dialog
        open={openDialog}
        onClose={handleCancel}
        PaperProps={{
          style: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #FFD700',
            borderRadius: '12px',
          },
        }}
      >
        <DialogTitle sx={{ color: '#000' }}>Confirm Logout</DialogTitle>
        <DialogActions>
          <Button onClick={handleCancel} sx={{ color: '#000' }}>
            Cancel
          </Button>
          <Button onClick={handleLogout} sx={{ color: '#FFD700', fontWeight: 'bold' }}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </StyledAppBar>
  );
}