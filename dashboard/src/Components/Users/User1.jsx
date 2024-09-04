import React, { useState } from 'react';
import {
  Button,
  Avatar,
  Box,
  Typography,
  IconButton,
  TablePagination,
  Breadcrumbs,
  Link,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Select,
  InputLabel,
  TextField
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2'; // Import SweetAlert2
import '../Styles/TaskTable.css';

const initialData = [
  {
    id: 1,
    name: 'Harish Chandra',
    role: 'Section Officer',
    email: 'harish@DOT.com',
    department: ['DOT'],
    type: 'User',
    avatar: ''
  },
  {
    id: 2,
    name: 'Ramesh Kumar',
    role: 'Department Admin',
    email: 'ramesh@DOT.com',
    department: ['DOT', 'Department of Posts'],
    type: 'Admin',
    avatar: ''
  },
  {
    id: 3,
    name: 'Prakash Kapoor',
    role: 'User',
    email: 'prakash@tourism.com',
    department: ['Ministry of Tourism'],
    type: 'User',
    avatar: ''
  },
  {
    id: 4,
    name: 'Rahul Verma',
    role: 'Department Admin',
    email: 'rahul@tourism.com',
    department: ['Ministry of Tourism'],
    type: 'Admin',
    avatar: ''
  },
  {
    id: 6,
    name: 'Minnie Walter',
    role: 'Frontend Developer',
    email: 'minnie@skote.com',
    department: ['Ministry of Tourism'],
    type: 'Admin',
    avatar: ''
  },
  {
    id: 5,
    name: 'Raman Kumar',
    role: 'Admin',
    email: 'raman@DOT.com',
    department: ['DOT','Department of Tourism','Department of Posts'],
    type: 'Admin',
    avatar: ''
  },
  {
    id: 7,
    name: 'John Santiago',
    role: 'Full Stack Developer',
    email: 'john@skote.com',
    department: ['Ruby', 'Php', 'Java'],
    type: 'Admin',
    avatar: ''
  }
];


const UsersTable = () => {
  const [data, setData] = useState(initialData);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // Track if in edit mode
  const [currentUser, setCurrentUser] = useState(null); // Store the user to be edited
  const [newUser, setNewUser] = useState({
    name: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    password: '',
    department: '',
    type: ''
  });

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredData = sortedData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.some(department =>
        department.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleClickOpen = () => {
    setEditMode(false);
    setNewUser({
      name: '',
      firstName: '',
      lastName: '',
      contactNumber: '',
      password: '',
      department: '',
      type: ''
    });
    setOpen(true);
  };

  const handleEditClick = (user) => {
    setEditMode(true);
    setCurrentUser(user);
    setNewUser({
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ')[1] || '',
      contactNumber: user.contactNumber || '',
      password: '', // Do not pre-fill password for security reasons
      department: user.department[0] || '',
      type: user.type || ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      // Update existing user
      const updatedData = data.map(user => 
        user.id === currentUser.id
          ? { ...user, ...newUser, name: `${newUser.firstName} ${newUser.lastName}` }
          : user
      );
      setData(updatedData);
    } else {
      // Add new user
      const newUserToAdd = {
        id: data.length + 1,
        name: `${newUser.firstName} ${newUser.lastName}`,
        role: 'New Role',
        email: 'newemail@skote.com',
        department: [newUser.department],
        type: newUser.type,
        avatar: ''
      };
      setData(prevData => [...prevData, newUserToAdd]);
    }
    handleClose();
  };

  const handleDeleteClick = (user) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You will not be able to recover this user!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = data.filter(u => u.id !== user.id);
        setData(updatedData);
        Swal.fire(
          'Deleted!',
          'The user has been deleted.',
          'success'
        );
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Box mb={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="textPrimary">Users</Typography>
        </Breadcrumbs>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Search..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
        />
        <Button
          variant="contained"
          color="primary"
          style={{ backgroundColor: '#28a745', borderRadius: '20px' }}
          onClick={handleClickOpen}
        >
          + New User
        </Button>
      </Box>

      <div style={{ overflowX: 'auto' }}>
        <table className='styled-table'>
          <thead style={{ backgroundColor: '#eff2f7' }}>
            <tr>
              <th style={{ cursor: 'pointer' }}>
                <span
                  onClick={() => sortData('id')}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  #
                  {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </span>
              </th>
              <th style={{ cursor: 'pointer' }}>
                <span
                  onClick={() => sortData('name')}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  Username
                  {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </span>
              </th>
              <th>Email</th>
              <th>
                <span
                  onClick={() => sortData('department')}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  Department
                  {sortConfig.key === 'department' && (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
                </span>
              </th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((user) => (
              <tr key={user.id} style={{ height: '36px', cursor: 'pointer' }}>
                <td>{user.id}</td>
                <td>
                  <Box display="flex" alignItems="center">
                    <Avatar src={user.avatar} alt={user.name} style={{ marginRight: '10px' }}>
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{user.name}</Typography>
                      <Typography variant="caption">{user.role}</Typography>
                    </Box>
                  </Box>
                </td>
                <td>{user.email}</td>
                <td>
                  {user.department.map((department, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      style={{
                        marginRight: '5px',
                        marginBottom: '5px',
                        backgroundColor: '#eef2ff',
                        color: '#556ee6'
                      }}
                    >
                      {department}
                    </Button>
                  ))}
                </td>
                <td>{user.type}</td>
                <td>
                  <Box display="flex" alignItems="center">
                    <IconButton color="primary" size="small" onClick={() => handleEditClick(user)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="secondary" size="small" onClick={() => handleDeleteClick(user)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{editMode ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Box display="flex" justifyContent="space-between">
              <TextField
                id="firstName"
                name="firstName"
                label="First Name"
                variant="outlined"
                value={newUser.firstName}
                onChange={handleChange}
                required
                fullWidth
                style={{ marginRight: '8px' }}
              />
              <TextField
                id="lastName"
                name="lastName"
                label="Last Name"
                variant="outlined"
                value={newUser.lastName}
                onChange={handleChange}
                required
                fullWidth
                style={{ marginLeft: '8px' }}
              />
            </Box>
            <Box mt={2}>
              <TextField
                id="contactNumber"
                name="contactNumber"
                label="Contact Number"
                variant="outlined"
                value={newUser.contactNumber}
                onChange={handleChange}
                required
                fullWidth
              />
            </Box>
            <Box mt={2}>
              <TextField
                id="password"
                name="password"
                label="Password"
                variant="outlined"
                type="password"
                value={newUser.password}
                onChange={handleChange}
                required={!editMode} // Require password only for adding new users
                fullWidth
              />
            </Box>
            <Box mt={2}>
              <FormControl variant="outlined" fullWidth required>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  name="department"
                  value={newUser.department}
                  onChange={handleChange}
                  label="Department"
                >
                  <MenuItem value="DOT">DOT</MenuItem>
                  <MenuItem value="Department of Posts">Department of Posts</MenuItem>
                  <MenuItem value="Transportation">Transportation</MenuItem>
                  <MenuItem value="Communication">Communication</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box mt={2}>
              <FormControl variant="outlined" fullWidth required>
                <InputLabel id="type-label">User Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={newUser.type}
                  onChange={handleChange}
                  label="User Type"
                >
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Super Admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTable;
