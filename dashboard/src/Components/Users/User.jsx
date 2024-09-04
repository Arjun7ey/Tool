import React, { useState, useEffect } from 'react';
import { Box, ListItemText ,Link,Typography,Radio,Alert, Button, RadioGroup,FormControlLabel,FormLabel,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Chip, FormHelperText, Checkbox } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import CardActions from '@mui/material/CardActions';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import axiosInstance from '../utils/axiosInstance';
import Snackbar from '@mui/material/Snackbar';
import { useAuth } from '../utils/AuthContext';
import { BASE_URL } from '../../config';
import TableViewIcon from '@mui/icons-material/TableView';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import DepartmentSelection from './DepartmentSelection'; 
import '../Styles/TaskTable.css';


const Users = () => {
  const { userData } = useAuth(); 
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [displayType, setDisplayType] = useState('table');
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState([]);
  const [openAddDepartmentDialog, setOpenAddDepartmentDialog] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [includeDivision, setIncludeDivision] = useState(false);
  const [includeSubDivision, setIncludeSubDivision] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState('');
  const [newSubDivisionName, setNewSubDivisionName] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [editUser, setEditUser] = useState({
    id: null,
    username: '',
    email: '',
    role: '',
    department_ids: [], 
  });
  const departmentMapping = {
    'Dept. of Tourism': 'Digital Bharat Nidhi',
    'DOT': 'BSNL',
    'Dept. of Post': 'NBM'
};

  const [departments, setDepartments] = useState([]); 
  const [departmentError, setDepartmentError] = useState(false); 
 

  useEffect(() => {
    fetchUsers();
    fetchDepartments(); 
  }, []);

  const filteredUsersrole = users.filter(user => filter === 'all' || user.role === filter);

  const handleFilterChange = (role) => {
    console.log(`Filter changed to: ${role}`); // Debugging line
    setFilter(role);
};

  const fetchUsers = () => {
    axiosInstance.get('/api/users/')
      .then(response => {
        // Filter out users with the role 'superadmin'
        const filteredUsers = response.data.filter(user => user.role !== 'superadmin');
        
        // Update state with the filtered users
        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  };
  
  const fetchDepartments = () => {
    axiosInstance.get('api/departments-divisions-subdivisions/')
      .then(response => {
        setDepartments(response.data || []);
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
      });
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
  
    // Filter users based on the search term
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.department_names && user.department_names.join(', ').toLowerCase().includes(searchTerm))
    );
  
    setFilteredUsers(filtered);
  };
  

  const exportData = () => {
    
    const selectedData = filteredUsers.map(user => ({
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      departments: user.department_names ? user.department_names.join(', ') : '',
      role: user.is_staff ? 'Admin' : 'User'
    }));

    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  const deleteUsers = (userId, users, setUsers, setFilteredUsers) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axiosInstance.delete(`/api/delete-users/${userId}/`)
          .then(response => {
            console.log('User deleted successfully:', response.data);
  
            // Update the state to remove the deleted user
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
  
            // Show success message
            Swal.fire(
              'Deleted!',
              'User has been deleted.',
              'success'
            );
          })
          .catch(error => {
            console.error('Error deleting user:', error);
            Swal.fire(
              'Error!',
              'There was a problem deleting the user.',
              'error'
            );
          });
      }
    });
  };


  const handleOpenAddDepartmentDialog = () => {
    setOpenAddDepartmentDialog(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
};

  const handleDisplayChange = (event, newDisplayType) => {
    setDisplayType(newDisplayType);
};
  const handleCloseAddDepartmentDialog = () => {
    setOpenAddDepartmentDialog(false);
    setNewDepartmentName('');
  };
 

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    setSelectedDepartments([]);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  const handleAddDepartment = () => {
    if (!newDepartmentName.trim()) {
      setSnackbarMessage('Please enter Department Name');
      setSnackbarOpen(true);
      return;
    }
    axiosInstance.post('/api/add-departments/', { name: newDepartmentName })
      .then(response => {
        console.log('Department added successfully:', response.data);
        setDepartments([...departments, response.data]); 
        handleCloseAddDepartmentDialog();
      })
      .catch(error => {
        console.error('Error adding department:', error);
      });
  };

  const handleOpenAddUserDialog = () => {
    setOpenAddUserDialog(true);
  };

  const handleCloseAddUserDialog = () => {
    
    setOpenAddUserDialog(false);
};


  const handleOpenEditUserDialog = (user) => {
    fetchDepartments(); 
    const userDepartments = user.departments.map(dep => dep.id); 
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      department_ids: userDepartments.length > 0 ? userDepartments : [],
    });
    setOpenEditUserDialog(true);
  };

  const handleCloseEditUserDialog = () => {
    setOpenEditUserDialog(false);
    setEditUser(null);
    setDepartmentError(false); 
  };

  const handleUserUpdated = () => {
    if (!editUser) {
      console.error('Edit user is null or undefined.');
      return;
    }
  
    const { id, username, email, role, department_ids } = editUser;
  
    // Validation checks
    if (!username) {
      setSnackbarMessage('Username cannot be empty');
      setSnackbarOpen(true);
      return;
    }
    if (!email) {
      setSnackbarMessage('Email cannot be empty');
      setSnackbarOpen(true);
      return;
    }
    if (!role) {
      setSnackbarMessage('Role cannot be empty');
      setSnackbarOpen(true);
      return;
    }
    if (!department_ids || department_ids.length === 0 || department_ids.includes(null) || department_ids.includes(undefined)) {
      setSnackbarMessage('Select at least one department');
      setSnackbarOpen(true);
      return;
    }
  
    const updatedUser = {
      id,
      username,
      email,
      role,
      department_ids,
    };
  
    console.log('Updating user with data:', updatedUser);
  
    axiosInstance.put(`/api/update-user/${id}/`, updatedUser)
      .then(response => {
        console.log('User updated successfully:', response.data);
  
        // Update the user list with the updated user data
        const updatedUsers = users.map(user =>
          user.id === id ? { ...user, ...response.data } : user
        );
  
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setEditUser(null);
        setOpenEditUserDialog(false);
  
        // Show success message
        setSnackbarMessage('User updated successfully!');
        setSnackbarOpen(true);
      })
      .catch(error => {
        console.error('Error updating user:', error);
        setSnackbarMessage('Error updating user. Please try again.');
        setSnackbarOpen(true);
      });
  };
  
  
  const handleDepartmentsUpdated = async () => {
    try {
      const response = await axiosInstance.get('/api/department-userwise/');
      const filteredDepartments = response.data.filter(dep => dep.name !== 'Super Department');
      setDepartments(filteredDepartments); 
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredUsers.map((user) => user.id);
      setSelectedUsers(newSelecteds);
      return;
    }
    setSelectedUsers([]);
  };
  const handleRowClick = (event, id) => {
    event.stopPropagation(); 
    handleRedirect(id); 
};

const handleRedirect = (userId) => {
    navigate(`/usersdetails/${userId}`); 
};
  
  
  const handleClick = (event, id) => {
    event.stopPropagation(); 
  
    const selectedIndex = selectedUsers.indexOf(id);
    let newSelected = [];
  
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedUsers, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedUsers.slice(1));
    } else if (selectedIndex === selectedUsers.length - 1) {
      newSelected = newSelected.concat(selectedUsers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedUsers.slice(0, selectedIndex),
        selectedUsers.slice(selectedIndex + 1),
      );
    }
  
    setSelectedUsers(newSelected);
  };

  const isSelected = (id) => selectedUsers.indexOf(id) !== -1;

  return (
    <div style={{ padding: '20px', margin: 0 }}>
  <Box className="p-6">
    <Box className="flex justify-between items-center mb-4">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0, // Prevent shrinking
        }}
      >
       {userData.userRole === 'superadmin' && (
  <>
    <Button
      variant="contained"
      sx={{
        backgroundColor: '#FFE600', 
        borderColor: 'transparent', 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        color: '#262b3b', 
        borderRadius: '20px',
        padding: '6px 12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          backgroundColor: '#FFE600', 
          borderColor: '#262b3b', 
          color: '#262b3b', 
          borderWidth: '1px', 
          borderStyle: 'solid', 
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', 
        },
        width: 'auto',
        marginRight: '8px' // Add space between buttons
      }}
      onClick={handleOpenAddDepartmentDialog}
    >
      Add New Department
    </Button>
  </>
)}

{(userData.userRole === 'superadmin' || userData.userRole === 'departmentadmin') && (
  <Button
    variant="contained"
    sx={{
      backgroundColor: '#FFE600', 
      borderColor: 'transparent', 
      borderWidth: '1px', 
      borderStyle: 'solid', 
      color: '#262b3b', 
      borderRadius: '20px',
      padding: '6px 12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      '&:hover': {
        backgroundColor: '#FFE600', 
        borderColor: '#262b3b', 
        color: '#262b3b', 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', 
      },
      width: 'auto',
      marginRight: '8px' // Add space between buttons
    }}
    onClick={handleOpenAddUserDialog}
  >
    Add New User
  </Button>
)}

      </Box>
      <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push toggle button group to the right */}
      <ToggleButtonGroup
        value={displayType}
        exclusive
        onChange={handleDisplayChange}
        sx={{
          height: '40px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ToggleButton
          value="table"
          sx={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TableViewIcon />
        </ToggleButton>
        <ToggleButton
          value="grid"
          sx={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ViewModuleIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          variant="outlined"
          sx={{
            flexGrow: 1, // Allows the TextField to take up remaining space
            maxWidth: 400, // Reduced length of the TextField
            marginRight: '10px', // Space between TextField and Buttons
          }}
          label="Search users by name, email or department"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <Button
    onClick={() => handleFilterChange('all')}
    variant="outlined"
    sx={{
        borderColor: filter === 'all' ? '#262b3b' : '#FFE600',
        color: '#000000', 
        backgroundColor: filter === 'all' ? '#ffffff' : '#FFE600', 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        height: '35px', 
        padding: '0 12px', 
        borderRadius: '20px', 
        '&:hover': {
            backgroundColor: filter === 'all' ? '#ffffff' : '#FFE600',
            borderColor: '#000000', 
            textDecoration: 'none', 
        },
        height: '35px', 
        padding: '0 12px', 
    }}
>
    All
</Button>



<Button
    onClick={() => handleFilterChange('departmentadmin')}
    variant="outlined"
    sx={{
        borderColor: filter === 'departmentadmin' ? '#262b3b' : '#FFE600',
        color: filter === 'departmentadmin' ? '#000000' : '#000000', 
        backgroundColor: filter === 'departmentadmin' ? '#ffffff' : '#FFE600', 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        height: '35px', 
        padding: '0 12px', 
        borderRadius: '20px', 
        '&:hover': {
            backgroundColor: filter === 'departmentadmin' ? '#ffffff' : '#FFE600', 
            borderColor: '#000000',
            color: '#000000', 
            textDecoration: 'none', 
        },
        height: '35px', 
        padding: '0 12px', 
    }}
>
    Department Heads
</Button>

<Button
    onClick={() => handleFilterChange('divisionadmin')}
    sx={{
        backgroundColor: filter === 'divisionadmin' ? '#ffffff' : '#FFE600',
        color: '#262b3b', 
        borderColor: filter === 'divisionadmin' ? '#262b3b' : '#FFE600',
        borderWidth: '1px', 
        borderStyle: 'solid', 
        height: '35px', 
        padding: '0 12px', 
        borderRadius: '20px', 
        '&:hover': {
            backgroundColor: '#ffffff',
            color: '#262b3b', 
            borderColor: '#262b3b', 
        },
        '&.Mui-selected': { 
            backgroundColor: '#ffffff', 
            color: '#262b3b', 
            borderColor: '#262b3b',
        }
    }}
>
    Division Heads
</Button>

<Button
    onClick={() => handleFilterChange('subdivisionuser')}
    sx={{
         backgroundColor: filter === 'subdivisionuser' ? '#ffffff' : '#FFE600',
        color: '#262b3b', 
        borderColor: filter === 'divisionadmin' ? '#262b3b' : '#FFE600',
        borderWidth: '1px', 
        borderStyle: 'solid', 
        height: '35px', 
        padding: '0 12px', 
        borderRadius: '20px', 
        '&:hover': {
            backgroundColor: '#ffffff', 
            color: '#262b3b', 
            borderColor: '#262b3b', 
        },
        '&.Mui-selected': { 
            backgroundColor: '#ffffff', 
            color: '#262b3b', 
            borderColor: '#262b3b', 
        }
    }}
>
    Subdivision Users
</Button>

<Button
    variant="contained"
    onClick={exportData}
    sx={{
        backgroundColor: '#FFE600', 
        color: '#262b3b', 
        borderColor: 'transparent', 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        height: '35px', 
        padding: '0 12px', 
        marginLeft: 'auto', 
        borderRadius: '20px', 
        '&:hover': {
            backgroundColor: '#FFE600', 
            color: '#262b3b', 
            borderColor: '#262b3b', 
        },
    }}
>
    Export Data
</Button>


      </Box>
    </Box>


   
      
      <TableContainer component={Paper}>
    {displayType === 'table' ? (
        <Table className="styled-table">
        <TableHead>
            <TableRow>
                <TableCell
                    style={{
                        backgroundColor: '#262b3b',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        height: '60px',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    Select
                </TableCell>
                <TableCell
                    style={{
                        backgroundColor: '#262b3b',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        height: '60px',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    Name
                </TableCell>
                <TableCell
                    style={{
                        backgroundColor: '#262b3b',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        height: '60px',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    Email
                </TableCell>
                <TableCell
                    style={{
                        backgroundColor: '#262b3b',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        height: '60px',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    Departments
                </TableCell>
                <TableCell
                    style={{
                        backgroundColor: '#262b3b',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        height: '60px',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    Divisions
                </TableCell>
                <TableCell
                    style={{
                        backgroundColor: '#262b3b',
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                        height: '60px',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    Sub Divisions
                </TableCell>
                <TableCell
    style={{
        backgroundColor: '#262b3b',
        color: '#FFFFFF',
        fontWeight: 'bold',
        height: '60px',
        padding: '0', // Ensure consistent padding
        borderBottom: userData.userRole === 'superadmin' || userData.userRole === 'departmentadmin' ? '1px solid #ddd' : 'none', // Conditionally remove border
        borderTop: 'none', // Ensure no top border
        whiteSpace: 'nowrap',
    }}
    colSpan={userData.userRole !== 'superadmin' && userData.userRole !== 'departmentadmin' ? 2 : 1} // Adjust colspan based on action cell visibility
>
    Role
</TableCell>
                {(userData.userRole === 'superadmin' || userData.userRole === 'departmentadmin') && (
                    <TableCell
                        style={{
                            backgroundColor: '#262b3b',
                            color: '#FFFFFF',
                            fontWeight: 'bold',
                            height: '60px',
                            borderBottom: '1px solid #ddd',
                            padding: '0', // Ensure consistent padding
                        }}
                    >
                        Actions
                    </TableCell>
                )}
            </TableRow>
        </TableHead>
        <TableBody>
            {filteredUsersrole.map((user) => {
                const isItemSelected = isSelected(user.id);
                return (
                    <TableRow
                        key={user.id}
                        selected={isItemSelected}
                        style={{
                            backgroundColor: isItemSelected ? '#f5f5f5' : 'inherit',
                            '&:hover': {
                                backgroundColor: '#e0e0e0',
                            },
                        }}
                    >
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={isItemSelected}
                                onChange={(event) => handleClick(event, user.id)}
                                onClick={(e) => e.stopPropagation()} 
                            />
                        </TableCell>
                        <TableCell>
                            <span 
                                onClick={(event) => handleRowClick(event, user.id)} 
                                style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                                {user.full_name}
                            </span>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            {user.department_names?.map((dept, index) => (
                                <Chip key={index} label={dept} />
                            ))}
                        </TableCell>
                        <TableCell>
    {user.division_names && Array.isArray(user.division_names) && user.division_names.length > 0 ? (
        user.division_names.map((name, index) => (
            <Chip key={index} label={name} />
        ))
    ) : (
      <Chip label="NA" color="default" />
    )}
</TableCell>

<TableCell>
    {user.subdivision_names && Array.isArray(user.subdivision_names) && user.subdivision_names.length > 0 ? (
        user.subdivision_names.map((name, index) => (
            <Chip key={index} label={name} />
        ))
    ) : (
      <Chip label="NA" color="default" />
    )}
</TableCell>

                        <TableCell>
                            {user.role === 'departmentadmin' ? 'Department Head' :
                                user.role === 'superadmin' ? 'Super Admin' :
                                user.role === 'divisionadmin' ? 'Division Head' :
                                user.role === 'subdivisionuser' ? 'Sub Division User' :
                                    user.role === 'user' ? 'Department User' :
                                        user.role === 'readonlyuser' ? 'Read Only User' :
                                            ''}
                        </TableCell>
                        {(userData.userRole === 'superadmin' || userData.userRole === 'departmentadmin') && (
                            <TableCell
                                style={{
                                    padding: 0, // Removes padding
                                    borderBottom: 'none', // Ensures no extra border at the bottom
                                    textAlign: 'center', // Aligns icons horizontally in the center
                                    verticalAlign: 'middle', // Ensures icons are vertically centered
                                    height: '56px', // Sets a consistent height for the cell (adjust based on your row height)
                                }}
                            >
                               <IconButton
  edge="end"
  aria-label="edit"
  onClick={(e) => {
    e.stopPropagation();
    handleOpenEditUserDialog(user);
  }}
  style={{
    padding: '6px',
    verticalAlign: 'middle',
    lineHeight: 'normal',
    color: '#4caf50', // Green color for edit icon
    marginRight: '8px', // Add margin to create spacing
  }}
>
  <Edit />
</IconButton>

<IconButton
  edge="end"
  aria-label="delete"
  onClick={(e) => {
    e.stopPropagation();
    deleteUsers(user.id, users, setUsers, setFilteredUsers);
  }}
  style={{
    padding: '6px',
    verticalAlign: 'middle',
    lineHeight: 'normal',
    color: '#f44336',   
  }}
>
  <Delete />
</IconButton>

                            </TableCell>
                        )}
                    </TableRow>
                );
            })}
        </TableBody>
    </Table>
    ) : (
      <div className="task-grid">
  <Box
    flex="1"
    display="flex"
    flexWrap="wrap"
    justifyContent="space-evenly"
    gap="20px"
  >
    {filteredUsersrole.map((user) => {
      const isItemSelected = isSelected(user.id); // Check if the user is selected
      return (
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
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'scale(1.03)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            },
            marginBottom: '20px',
            backgroundColor: isItemSelected ? '#f5f5f5' : 'inherit', // Change background color if selected
          }}
          onClick={() => handleClick(user.id)} // Handle card click
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
                alt={user.username}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
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
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '1.2rem',
                color: '#333',
              }}
            >
              {user.full_name}
            </Typography>
            {user.department_names && user.department_names.length > 0 ? (
              <Box>
                {user.department_names.includes('Super Department') ? (
                  <Chip
                    label="Super Department"
                    variant="outlined"
                    style={{ marginRight: '5px', marginBottom: '5px' }}
                  />
                ) : (
                  user.department_names.map((dept, index) => (
                    <Chip
                      key={index}
                      label={dept}
                      variant="outlined"
                      style={{ marginRight: '5px', marginBottom: '5px' }}
                    />
                  ))
                )}
              </Box>
            ) : (
              'N/A'
            )}
            {user.role === 'departmentadmin' ? 'Department Head' :
              user.role === 'superadmin' ? 'Super Admin' :
              user.role === 'divisionadmin' ? 'Division Head' :
              user.role === 'subdivisionuser' ? 'Sub Division User' :
              user.role === 'user' ? 'Department User' :
              user.role === 'readonlyuser' ? 'Read Only User' :
              ''}
          </CardContent>
        </Card>
      );
    })}
  </Box>
</div>

    )}
</TableContainer>



      {/* AddUserDialog component */}
      <DepartmentSelection 
  open={openAddUserDialog}
  onClose={handleCloseAddUserDialog}
/>


        <Dialog open={openAddDepartmentDialog} onClose={handleCloseAddDepartmentDialog}>
  <DialogTitle>Add New Department</DialogTitle>
  <DialogContent>
    <TextField
      label="Department Name"
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
<Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
            />
      <Dialog open={openEditUserDialog} onClose={handleCloseEditUserDialog}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && (
            <Box>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
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
              {(editUser.role === 'departmentadmin' || editUser.role === 'readonlyuser'|| editUser.role === 'user' ||editUser.role === 'superadmin') && (
                 <FormControl fullWidth margin="normal" error={departmentError}>
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


                 {departmentError && (
                   <FormHelperText>Please select at least one department.</FormHelperText>
                 )}
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
    </Box>
    </div>
  );
};
export default Users;