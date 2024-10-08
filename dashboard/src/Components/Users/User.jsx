import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { styled } from '@mui/material/styles';
import { 
    Card, CardContent, Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
    Button, Dialog, DialogActions, DialogContent, DialogTitle, List,
    ListItem, ListItemText, ListItemIcon, Checkbox, Snackbar,
    Typography, Drawer, Box, Paper, IconButton, ToggleButtonGroup, ToggleButton, CardMedia, LinearProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { 
    Upload as UploadIcon, 
    TableView as TableViewIcon, 
    ViewModule as ViewModuleIcon, 
    Edit, 
    Settings as SettingsIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    DragIndicator as DragIndicatorIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon,
    Delete, 
    Visibility,
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../Styles/TaskTable.css';
import { BASE_URL } from '../../config';
import moment from 'moment';
import DepartmentSelection from './DepartmentSelection';

const MySwal = withReactContent(Swal);

const Users = () => {
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [displayType, setDisplayType] = useState('table');
    const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
    const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openAddDepartmentDialog, setOpenAddDepartmentDialog] = useState(false);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [departments, setDepartments] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [openSettings, setOpenSettings] = useState(false);
    const [visibleFields, setVisibleFields] = useState([
        'full_name', 'email', 'departments', 'divisions', 'subdivisions', 'role', 'actions'
    ]);
    const [hiddenFields, setHiddenFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [columnWidths, setColumnWidths] = useState({});
    const [isResizing, setIsResizing] = useState(false);
    const resizingRef = useRef(null);
    const tableRef = useRef(null);

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, filter, searchTerm]);

    useEffect(() => {
        const initialWidths = {};
        visibleFields.forEach((field) => {
            initialWidths[field] = 150; // Default width
        });
        setColumnWidths(initialWidths);
    }, [visibleFields]);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/api/users/');
            const filteredUsers = response.data.filter(user => user.role !== 'superadmin');
            setUsers(filteredUsers);
            setFilteredUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axiosInstance.get('api/departments-divisions-subdivisions/');
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const filterUsers = () => {
        let filtered = users;
        if (filter !== 'all') {
            filtered = filtered.filter(user => user.role === filter);
        }
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.full_name.toLowerCase().includes(lowercasedTerm) ||
                user.email.toLowerCase().includes(lowercasedTerm) ||
                (user.department_names && user.department_names.join(', ').toLowerCase().includes(lowercasedTerm))
            );
        }
        setFilteredUsers(filtered);
    };

    const handleOpenSettings = () => {
        setOpenSettings(true);
    };

    const handleCloseSettings = () => {
        setOpenSettings(false);
    };

    const handleFieldClick = (field) => {
        setSelectedField(field === selectedField ? null : field);
    };

    const moveField = (direction) => {
        if (!selectedField) return;
    
        const sourceList = visibleFields.includes(selectedField) ? visibleFields : hiddenFields;
        const destinationList = visibleFields.includes(selectedField) ? hiddenFields : visibleFields;
    
        const updatedSourceList = sourceList.filter(field => field !== selectedField);
        const updatedDestinationList = [selectedField, ...destinationList];
    
        if (visibleFields.includes(selectedField)) {
          setVisibleFields(updatedSourceList);
          setHiddenFields(updatedDestinationList);
        } else {
          setHiddenFields(updatedSourceList);
          setVisibleFields(updatedDestinationList);
        }
    
        setSelectedField(null);
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;
    
        const sourceList = source.droppableId === 'visible' ? visibleFields : hiddenFields;
        const destList = destination.droppableId === 'visible' ? visibleFields : hiddenFields;
    
        const [removed] = sourceList.splice(source.index, 1);
        destList.splice(destination.index, 0, removed);
    
        setVisibleFields([...visibleFields]);
        setHiddenFields([...hiddenFields]);
    };

    const handleResizeStart = useCallback((e, field) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = columnWidths[field] || 150;
        setIsResizing(true);
        resizingRef.current = { field, startX, startWidth };

        const handleMouseMove = (moveEvent) => {
            if (!resizingRef.current) return;
            const { field, startX, startWidth } = resizingRef.current;
            const diff = moveEvent.clientX - startX;
            const newWidth = Math.max(50, startWidth + diff);
            setColumnWidths(prev => ({
                ...prev,
                [field]: newWidth,
            }));
        };
        
        const handleMouseUp = () => {
            setIsResizing(false);
            resizingRef.current = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
    }, [columnWidths]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    const handleDisplayChange = (event, newDisplayType) => {
        setDisplayType(newDisplayType);
    };

    const handleOpenAddUserDialog = () => {
        setOpenAddUserDialog(true);
    };

    const handleCloseAddUserDialog = () => {
        setOpenAddUserDialog(false);
    };

    const handleOpenEditUserDialog = (user) => {
        setEditUser(user);
        setOpenEditUserDialog(true);
    };

    const handleCloseEditUserDialog = () => {
        setOpenEditUserDialog(false);
        setEditUser(null);
    };

    const handleOpenAddDepartmentDialog = () => {
        setOpenAddDepartmentDialog(true);
    };

    const handleCloseAddDepartmentDialog = () => {
        setOpenAddDepartmentDialog(false);
        setNewDepartmentName('');
    };

    const handleAddDepartment = async () => {
        if (!newDepartmentName.trim()) {
            setSnackbarMessage('Please enter Division Name');
            setSnackbarOpen(true);
            return;
        }
        try {
            const response = await axiosInstance.post('/api/add-departments/', { name: newDepartmentName });
            setDepartments([...departments, response.data]);
            handleCloseAddDepartmentDialog();
            setSnackbarMessage('Division added successfully');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error adding division:', error);
            setSnackbarMessage('Error adding division');
            setSnackbarOpen(true);
        }
    };

    const handleUserUpdated = async () => {
        if (!editUser) return;

        try {
            const response = await axiosInstance.put(`/api/update-user/${editUser.id}/`, editUser);
            const updatedUsers = users.map(user =>
                user.id === editUser.id ? { ...user, ...response.data } : user
            );
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
            handleCloseEditUserDialog();
            setSnackbarMessage('User updated successfully');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error updating user:', error);
            setSnackbarMessage('Error updating user');
            setSnackbarOpen(true);
        }
    };

    const handleDeleteUser = (userId) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            customClass: {
              confirmButton: 'swal-confirm-button',
              cancelButton: 'swal-cancel-button',
          }
        }).then((result) => {
            if (result.isConfirmed) {
                axiosInstance.delete(`/api/delete-users/${userId}/`)
                    .then(() => {
                        const updatedUsers = users.filter(user => user.id !== userId);
                        setUsers(updatedUsers);
                        setFilteredUsers(updatedUsers);
                        setSnackbarMessage('User deleted successfully');
                        setSnackbarOpen(true);
                    })
                    .catch(error => {
                        console.error('Error deleting user:', error);
                        setSnackbarMessage('Error deleting user');
                        setSnackbarOpen(true);
                    });
            }
        });
    };

    const exportData = () => {
        const dataToExport = filteredUsers.map(user => ({
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            departments: user.department_names ? user.department_names.join(', ') : '',
            role: user.role
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "users.xlsx");
    };

    const handleRowClick = (userId) => {
        navigate(`/usersdetails/${userId}`);
    };

    const getFieldName = (field) => {
        const fieldNames = {
            full_name: 'Name',
            email: 'Email',
            departments: 'Departments',
            divisions: 'Divisions',
            subdivisions: 'Subdivisions',
            role: 'Role',
            actions: 'Actions'
        };
        return fieldNames[field] || field;
    };

    const renderFieldContent = (user, field) => {
        switch (field) {
            case 'full_name':
                return (
                    <span 
                        onClick={() => handleRowClick(user.id)} 
                        style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        {user.full_name}
                    </span>
                );
            case 'email':
                return user.email;
            case 'departments':
                return user.department_names?.map((dept, index) => (
                    <Chip key={index} label={dept} style={{ margin: '2px' }} />
                ));
            case 'divisions':
                return user.division_names?.length > 0 
                    ? user.division_names.map((name, index) => (
                        <Chip key={index} label={name} style={{ margin: '2px' }} />
                      ))
                    : <Chip label="NA" color="default" />;
            case 'subdivisions':
                return user.subdivision_names?.length > 0
                    ? user.subdivision_names.map((name, index) => (
                        <Chip key={index} label={name} style={{ margin: '2px' }} />
                      ))
                    : <Chip label="NA" color="default" />;
            case 'role':
                return user.role === 'departmentadmin' ? 'Department Head' :
                       user.role === 'superadmin' ? 'Super Admin' :
                       user.role === 'divisionadmin' ? 'Division Head' :
                       user.role === 'subdivisionuser' ? 'Sub Division User' :
                       user.role === 'user' ? 'Department User' :
                       user.role === 'readonlyuser' ? 'Read Only User' : '';
            case 'actions':
                return (userData.userRole === 'superadmin' || userData.userRole === 'departmentadmin') ? (
                    <>
                        <IconButton onClick={() => handleOpenEditUserDialog(user)}>
                            <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteUser(user.id)}>
                            <Delete />
                        </IconButton>
                    </>
                ) : null;
            default:
                return null;
        }
    };
    const filterOptions = [
      { value: 'all', label: 'All' },
     
      { value: 'divisionadmin', label: 'Division Admin' },
      { value: 'subdivisionuser', label: 'Subdivision User' },
     
    ];

    return (
      <div style={{ padding: '20px', margin: 0 }}>
          <Box className="p-6">
              <Box className="flex justify-between items-center mb-4">
                  <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {userData.userRole === 'superadmin' && (
                          <Button
                              variant="contained"
                              onClick={handleOpenAddDepartmentDialog}
                              className="ControlButton"
                              sx={{
                                  backgroundColor: '#FFE600',
                                  color: '#262b3b',
                                  '&:hover': {
                                      backgroundColor: '#FFE600',
                                      borderColor: '#262b3b',
                                  },
                                  marginRight: '8px'
                              }}
                          >
                              Add New Division
                          </Button>
                      )}
                      {(userData.userRole === 'superadmin' || userData.userRole === 'departmentadmin') && (
                          <Button
                              variant="contained"
                              onClick={handleOpenAddUserDialog}
                              className="ControlButton"
                              sx={{
                                  backgroundColor: '#FFE600',
                                  color: '#262b3b',
                                  '&:hover': {
                                      backgroundColor: '#FFE600',
                                      borderColor: '#262b3b',
                                  },
                                  marginRight: '8px'
                              }}
                          >
                              Add New User
                          </Button>
                      )}
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <ToggleButtonGroup
                                value={displayType}
                                exclusive
                                onChange={handleDisplayChange}
                                size="small"
                                className="display-toggle-group"
                            >
                                <ToggleButton value="table"><TableViewIcon /></ToggleButton>
                                <ToggleButton value="grid"><ViewModuleIcon /></ToggleButton>
                            </ToggleButtonGroup>
                  <Button 
                      className="ControlButton" 
                      onClick={handleOpenSettings} 
                      sx={{ ml: '8px' }} 
                      startIcon={<SettingsIcon sx={{ color: 'black' }} />} 
                  />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TextField
                          variant="outlined"
                          sx={{ flexGrow: 1, maxWidth: 400, marginRight: '10px' }}
                          label="Search users by name, email or department"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="rounded-textfield"
                      />
                  </Box>
                  <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="button-container">
                  {filterOptions.map((filterOption) => (
      <Button
        key={filterOption.value}
        onClick={() => handleFilterChange(filterOption.value)} // Handle the filter change
        className={`filter-button ${filterUsers === filterOption.value ? 'active' : 'inactive'}`}
      >
        {filterOption.label} {/* Display the label correctly */}
      </Button>
    ))}
  </div>
                 <Box sx={{ ml: 'auto' }}>
    <Button
      variant="contained"
      onClick={exportData}
      className="ControlButton"
    >
      <UploadIcon sx={{ marginRight: '8px' }} />
      Export
    </Button>
  </Box>

                  </Box>
              </Box>

              {displayType === 'table' ? (
                  <TableContainer component={Paper}>
                      <Table className="styled-table" ref={tableRef}>
                          <TableHead>
                              <TableRow>
                                  {visibleFields.map((field) => (
                                      <TableCell
                                          key={field}
                                          style={{
                                              width: columnWidths[field] || 150,
                                              backgroundColor: '#262b3b',
                                              color: '#FFFFFF',
                                              fontWeight: 'bold',
                                          }}
                                      >
                                          {getFieldName(field)}
                                          <div
                                              className="ResizeHandle"
                                              onMouseDown={(e) => handleResizeStart(e, field)}
                                          />
                                      </TableCell>
                                  ))}
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {filteredUsers.map((user) => (
                                  <TableRow key={user.id}>
                                      {visibleFields.map((field) => (
                                          <TableCell key={field} style={{ width: columnWidths[field] || 150 }}>
                                              {renderFieldContent(user, field)}
                                          </TableCell>
                                      ))}
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </TableContainer>
              ) : (
                <div className="task-grid">
                <Box
                  flex="1"
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="space-evenly"
                  gap="20px"
                >
                  {filteredUsers.map((user) => (
                    <Card
                      key={user.id}
                      className="user-card"
                      sx={{
                        width: 250,
                        height: 320,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center', // Center content horizontally
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'scale(1.03)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        },
                        marginBottom: '20px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {user.profile_picture && user.profile_picture.trim() !== '' ? (
                          <CardMedia
                            component="img"
                            image={`${BASE_URL}${user.profile_picture}`}
                            alt={user.full_name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover', // Ensures the image fits and covers the box
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f5f5f5',
                              textAlign: 'center',
                              fontSize: '1rem',
                              color: '#999',
                            }}
                          >
                            No image available
                          </Typography>
                        )}
                      </Box>
                      <CardContent
                        sx={{
                          textAlign: 'center', // Center all text content
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                          {user.full_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.email}
                        </Typography>
                        <Box mt={1} display="flex" justifyContent="center" flexWrap="wrap">
                          {user.department_names?.map((dept, index) => (
                            <Chip key={index} label={dept} size="small" sx={{ margin: '2px' }} />
                          ))}
                        </Box>
                        <Typography variant="body2" sx={{ marginTop: '8px' }}>
                          {renderFieldContent(user, 'role')}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </div>
              
              )}
          </Box>

          <Dialog className="StyledDialog" open={openSettings} onClose={handleCloseSettings} maxWidth="md" fullWidth>
              <DialogTitle>
                  <Typography variant="h5" component="span" fontWeight="bold">
                      Table Field Settings
                  </Typography>
                  <IconButton
                      aria-label="close"
                      onClick={handleCloseSettings}
                      sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                      <CloseIcon />
                  </IconButton>
              </DialogTitle>
              <DialogContent>
                  <DragDropContext onDragEnd={onDragEnd}>
                      <Grid container spacing={3} alignItems="flex-start">
                          <Grid item xs={5}>
                              <Typography variant="h6" gutterBottom>Visible Fields</Typography>
                              <Droppable droppableId="visible">
                                  {(provided) => (
                                      <Paper className="FieldList" {...provided.droppableProps} ref={provided.innerRef}>
                                          {visibleFields.map((field, index) => (
                                              <Draggable key={field} draggableId={field} index={index}>
                                                  {(provided, snapshot) => (
                                                      <ListItem
                                                          ref={provided.innerRef}
                                                          {...provided.draggableProps}
                                                          {...provided.dragHandleProps}
                                                          onClick={() => handleFieldClick(field)}
                                                          className={`FieldItem ${snapshot.isDragging ? 'isDragging' : ''} ${selectedField === field ? 'isSelected' : ''}`}
                                                      >
                                                          <ListItemIcon>
                                                              <DragIndicatorIcon />
                                                          </ListItemIcon>
                                                          <ListItemText primary={getFieldName(field)} />
                                                          <ListItemIcon>
                                                              <VisibilityIcon />
                                                          </ListItemIcon>
                                                      </ListItem>
                                                  )}
                                              </Draggable>
                                          ))}
                                          {provided.placeholder}
                                      </Paper>
                                  )}
                              </Droppable>
                          </Grid>
                          <Grid item xs={2} container direction="column" alignItems="center" justifyContent="center">
                              <IconButton className="ArrowButton" onClick={() => moveField('right')} disabled={!selectedField || hiddenFields.includes(selectedField)}>
                                  <ArrowForwardIcon />
                              </IconButton>
                              <IconButton 
                                  className="ArrowButton"
                                  onClick={() => moveField('left')} 
                                  disabled={!selectedField || visibleFields.includes(selectedField)}
                              >
                                  <ArrowBackIcon />
                              </IconButton>
                          </Grid>
                          <Grid item xs={5}>
                              <Typography variant="h6" gutterBottom>Hidden Fields</Typography>
                              <Droppable droppableId="hidden">
                                  {(provided) => (
                                      <Paper 
                                          className="FieldList"
                                          {...provided.droppableProps} 
                                          ref={provided.innerRef}
                                      >
                                          {hiddenFields.map((field, index) => (
                                              <Draggable key={field} draggableId={field} index={index}>
                                                  {(provided, snapshot) => (
                                                      <ListItem 
                                                          className={`FieldItem ${snapshot.isDragging ? 'isDragging' : ''} ${selectedField === field ? 'isSelected' : ''}`}
                                                          ref={provided.innerRef} 
                                                          {...provided.draggableProps} 
                                                          {...provided.dragHandleProps} 
                                                          onClick={() => handleFieldClick(field)}
                                                      >
                                                          <ListItemIcon>
                                                              <DragIndicatorIcon />
                                                          </ListItemIcon>
                                                          <ListItemText primary={getFieldName(field)} />
                                                          <ListItemIcon>
                                                              <VisibilityOffIcon />
                                                          </ListItemIcon>
                                                      </ListItem>
                                                  )}
                                              </Draggable>
                                          ))}
                                          {provided.placeholder}
                                      </Paper>
                                  )}
                              </Droppable>
                          </Grid>
                      </Grid>
                  </DragDropContext>
              </DialogContent>
              <DialogActions>
                  <Button
                      variant="contained"
                      onClick={handleCloseSettings}
                      className="ControlButton"
                  >
                      Close
                  </Button>
              </DialogActions>
          </Dialog>

          <DepartmentSelection 
              open={openAddUserDialog}
              onClose={handleCloseAddUserDialog}
          />

          <Dialog open={openAddDepartmentDialog} onClose={handleCloseAddDepartmentDialog}>
              <DialogTitle>Add New Division</DialogTitle>
              <DialogContent>
                  <TextField
                      label="Division Name"
                      fullWidth
                      margin="normal"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                  />
              </DialogContent>
              <DialogActions>
                  <Button onClick={handleCloseAddDepartmentDialog} color="primary">
                      Cancel
                  </Button>
                  <Button onClick={handleAddDepartment} color="primary">
                      Add
                  </Button>
              </DialogActions>
          </Dialog>

          <Dialog open={openEditUserDialog} onClose={handleCloseEditUserDialog}>
              <DialogTitle>Edit User</DialogTitle>
              <DialogContent>
                  {editUser && (
                      <Box>
                          <TextField
                              label="full_name"
                              fullWidth
                              margin="normal"
                              value={editUser.full_name}
                              onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                          />
                          <TextField
                              label="Email"
                              fullWidth
                              margin="normal"
                              value={editUser.email}
                              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                          />
                          <FormControl fullWidth margin="normal">
                              <InputLabel>Role</InputLabel>
                              <Select
                                  value={editUser.role}
                                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                              >
                                  <MenuItem value="user">Department User</MenuItem>
                                  <MenuItem value="departmentadmin">Department Head</MenuItem>
                                  <MenuItem value="readonlyuser">Read Only User</MenuItem>
                                    <MenuItem value="divisionadmin">Division Head</MenuItem>
                                    <MenuItem value="subdivisionuser">Sub Division User</MenuItem>
                                </Select>
                            </FormControl>
                            {(editUser.role === 'departmentadmin' || editUser.role === 'readonlyuser' || editUser.role === 'user' || editUser.role === 'superadmin') && (
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Departments</InputLabel>
                                    <Select
                                        multiple
                                        value={editUser.department_ids || []}
                                        onChange={(e) => {
                                            const selectedIds = e.target.value.filter(id => id !== undefined);
                                            setEditUser({ ...editUser, department_ids: selectedIds });
                                        }}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const department = departments.find((dep) => dep.id === value);
                                                    return (
                                                        <Chip key={value} label={department ? department.name : ''} />
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {departments
                                            .filter(department => department.name !== 'Super Department')
                                            .map((department) => (
                                                <MenuItem key={department.id} value={department.id}>
                                                    <Checkbox checked={(editUser.department_ids || []).indexOf(department.id) > -1} />
                                                    {department.name}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditUserDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleUserUpdated} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={() => setSnackbarOpen(false)}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </div>
    );
};

export default Users;