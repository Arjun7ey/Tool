import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance'
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import DescriptionIcon from '@mui/icons-material/Description'; 
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import ReactStars from 'react-rating-stars-component';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import UploadIcon from '@mui/icons-material/Upload';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableViewIcon from '@mui/icons-material/TableView';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../Styles/TaskTable.css';
import moment from 'moment';
import { BASE_URL } from '../../config';
import { useAuth } from '../utils/AuthContext';

const MySwal = withReactContent(Swal);

const DocumentTable = () => {
    const { userData } = useAuth();
    const { userRole } = userData;
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [editTaskId, setEditTaskId] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [department, setDepartment] = useState('');
    const [departments, setDepartments] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [displayType, setDisplayType] = useState('table');
    const [statusFilter, setStatusFilter] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState([]);
    const [rating, setRating] = useState(0);
    const currentDate = moment().format('YYYY-MM-DD');

    useEffect(() => {
        const fetchData = async () => {
            try {
               
                const tasksResponse = await axiosInstance.get('api/documents/dashboard/');
                const categoriesResponse = await axiosInstance.get('/api/categories/');
                const departmentsResponse = await axiosInstance.get('/api/department-userwise/');

                setTasks(tasksResponse.data);
                setCategories(categoriesResponse.data);
                setDepartments(departmentsResponse.data);

                
                filterTasks(tasksResponse.data, statusFilter, filterDepartment);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []); 

    useEffect(() => {
        filterTasks(tasks, statusFilter, filterDepartment);
    }, [tasks, statusFilter, filterDepartment]);

    const filterTasks = (tasks, status = '', department = '') => {
        let filtered = [...tasks];

        if (status) {
            filtered = filtered.filter(task => task.status.toLowerCase() === status.toLowerCase());
        }

       

        if (department) {
            filtered = filtered.filter(task => task.department_name.toLowerCase() === department.toLowerCase());
        }

        setFilteredTasks(filtered);
    };

    
    const handleApprove = async () => {
        try {
            await axiosInstance.post('/api/documents/approve/', {
                task_ids: selectedTasks
            });
            const currentDate = moment().format('YYYY-MM-DD');
           
            const updatedTasks = tasks.map(task =>
                selectedTasks.includes(task.id)
                    ? { ...task, status: 'Approved', status_change_date: currentDate  }
                    : task
            );
    
            setTasks(updatedTasks);
            filterTasks(updatedTasks); 
            setSelectedTasks([]);
        } catch (error) {
            console.error('Error approving tasks:', error);
            setSnackbarMessage('Error approving tasks');
            setSnackbarOpen(true);
        }
    };

    const renderStatusWithDate = (task) => {
        const status = task.status;
        const submittedOn = task.submitted_on; 
        const statusChangeDate = task.status_change_date; 
    
        let statusLabel = '';
        let dateText = '';
        let fontColor = '';
    
        switch (status) {
            case 'Pending':
                statusLabel = 'Pending';
                dateText = `since ${moment(submittedOn).format('MMMM Do, YYYY')}`;
                fontColor = 'blue';
                break;
            case 'Approved':
                statusLabel = 'Approved';
                dateText = `on ${moment(statusChangeDate).format('MMMM Do, YYYY')}`;
                fontColor = 'green';
                break;
            case 'Rejected':
                statusLabel = 'Rejected';
                dateText = `on ${moment(statusChangeDate).format('MMMM Do, YYYY')}`;
                fontColor = 'red';
                break;
            default:
                statusLabel = status;
                dateText = '';
                break;
        }
         return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body1" style={{ fontWeight: 'bold', color: fontColor }}>
                    {statusLabel}
                </Typography>
                <Typography variant="body2" style={{ color: fontColor }}>
                    {dateText}
                </Typography>
            </div>
        );
    };
    const getStatusBadge = (status) => {
        let color;
        let outlineColor;
    
        switch (status.toLowerCase()) {
            case 'pending':
                color = 'blue';
                outlineColor = 'lightblue';
                break;
            case 'approved':
                color = 'green';
                outlineColor = 'lightgreen';
                break;
            case 'rejected':
                color = 'red';
                outlineColor = 'lightcoral';
                break;
            default:
                color = 'black';
                outlineColor = 'gray';
                break;
        }
    
        return (
            <div
                style={{
                    position: 'relative',
                    display: 'inline-block',
                    padding: '2px 4px',
                    color: color,
                    fontWeight: 'bold',
                    fontSize: '14px', 
                    lineHeight: '1.2', 
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        color: outlineColor,
                        zIndex: '-1',
                        textShadow: `0px 0px 2px ${outlineColor}, 0px 0px 2px ${outlineColor}`,
                    }}
                >
                    {status}
                </span>
                {status}
            </div>
        );
    };
    
    const handleReject = async () => {
        try {
            await axiosInstance.post('/api/documents/reject/', {
                task_ids: selectedTasks
            });
            const currentDate = moment().format('YYYY-MM-DD');
           
            const updatedTasks = tasks.map(task =>
                selectedTasks.includes(task.id)
                    ? { ...task, status: 'Rejected', status_change_date: currentDate  }
                    : task
            );
    
            setTasks(updatedTasks);
            filterTasks(updatedTasks); 
            setSelectedTasks([]);
        } catch (error) {
            console.error('Error rejecting tasks:', error);
            setSnackbarMessage('Error rejecting tasks');
            setSnackbarOpen(true);
        }
    };
    const handleRatingChange = (newRating, taskId) => {
        setRating(newRating);
        
        
        axiosInstance.patch(`api/documents/rate/${taskId}/`, { rating: newRating })
            .then(response => {
                console.log('Rating updated successfully:', response.data);
                
                setTasks(prevTasks => 
                    prevTasks.map(task => 
                        task.id === taskId ? { ...task, rating: newRating } : task
                    )
                );
            })
            .catch(error => {
                console.error('Error updating rating:', error);
            });
    };

    const handleTaskSelection = (taskId) => {
        setSelectedTasks((prevSelected) =>
            prevSelected.includes(taskId)
                ? prevSelected.filter((id) => id !== taskId)
                : [...prevSelected, taskId]
        );
    };

    const handleOpenUploadDialog = () => {
        setOpenUploadDialog(true);
    };

    const handleCloseUploadDialog = () => {
        setOpenUploadDialog(false);
        setTitle('');
        setCategory('');
        setDepartment('');
        setFile(null);
        
    };

    const handleUpload = () => {
        if (title.trim() === '') {
            setSnackbarMessage('Title is required');
            setSnackbarOpen(true);
            return;
        }

        if (!file) {
            setSnackbarMessage('Please select an file to upload');
            setSnackbarOpen(true);
            return;
        }
        if (category === '') {
            setSnackbarMessage('Category is required');
            setSnackbarOpen(true);
            return;
        }
        if (department === '') {
            setSnackbarMessage('Department is required');
            setSnackbarOpen(true);
            return;
        }
        const fileType = file.type;
        const allowedDocumentTypes = [
            'application/pdf',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-powerpoint', // .ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
            'text/plain', // .txt
            'application/rtf' // .rtf
        ];
        if (!allowedDocumentTypes.includes(fileType)) {
            setSnackbarMessage('Please select a valid document (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF)');
            setSnackbarOpen(true);
            return;
        }

      
        if (tasks.some(task => task.title === title)) {
            setSnackbarMessage('Title is already used. Please use a different title.');
            setSnackbarOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category_name', category);
        formData.append('department_name', department);
        formData.append('docfile', file);

        axiosInstance.post('/api/documents/dashboard/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            console.log("url",response.data.file)
            const newTask = {
                id: response.data.document.id,
                title,
                file:response.data.document.file,
                status: 'Pending',
                category_name: category,
                department_name: department,
                submitted_by: userData.fullName, 
                submitted_on: currentDate 
            };

            setTasks([...tasks, newTask]);
            handleCloseUploadDialog();
            filterTasks([...tasks, newTask]);
        })
        .catch(error => {
            console.error('Error uploading task:', error);
            setSnackbarMessage('Error uploading task');
            setSnackbarOpen(true);
        });
    };

    const handleDisplayChange = (event, newDisplayType) => {
        setDisplayType(newDisplayType);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        filterTasks(tasks, status, filterDepartment);
    };

    const handleDepartmentFilter = (departmentName) => {
        console.log('Setting Filter Department:', departmentName); 
        setFilterDepartment(departmentName === 'all' ? '' : departmentName);
        filterTasks(tasks, statusFilter, departmentName === 'all' ? '' : departmentName); 
    };
 
    
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleEdit = (task) => {
        setEditTaskId(task.id);
        setTitle(task.title);
        setCategory(task.category_name);
        setDepartment(task.department_name);
        
        setFile(null);
        setOpenUploadDialog(true);
    };

    const handleDelete = (selectedTasks) => {
        if (!selectedTasks || selectedTasks.length === 0) {
            console.error('No tasks selected for deletion.');
            return;
        }
    
        const firstTaskTitle = selectedTasks[0]?.title;
    
        MySwal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${selectedTasks.length > 1 ? 'these tasks' : `"${firstTaskTitle}"`}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'No, keep them'
        }).then((result) => {
            if (result.isConfirmed) {
                const documentIds = selectedTasks.map(task => task.id);
    
                axiosInstance.delete('/api/documents/delete/', {
                    data: { document_ids: documentIds }
                })
                .then(() => {
                    const remainingTasks = tasks.filter(t => !documentIds.includes(t.id));
                    setTasks(remainingTasks);
                    filterTasks(remainingTasks);
                    setSnackbarMessage('Dcouments deleted successfully');
                    setSnackbarOpen(true);
                })
                .catch(error => {
                    console.error('Error deleting documents:', error);
                    setSnackbarMessage('Error deleting documents');
                    setSnackbarOpen(true);
                });
            }
        });
    };
    
    const handleView = (task) => {
        const fileUrl = `${BASE_URL}${task.file}`;
    
        MySwal.fire({
            title: task.title,
            html: (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                
                <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'red', marginTop: '10px' }} 
                >
                    <DescriptionIcon style={{ fontSize: 40 }} /> 
                </a>
                  
                    {(userRole === 'superadmin' || userRole === 'departmentadmin') && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                            <h3>Rate this document:</h3>
                            <ReactStars
                                count={5}
                                value={task.rating}
                                size={24}
                                activeColor="#ffd700"
                                isHalf={false}  
                                edit={true}
                                onChange={(newRating) => handleRatingChange(newRating, task.id)}
                            />
                        </div>
                    )}
                </div>
            ),
            showCloseButton: true,  
            showConfirmButton: true,
        });
    };
    
    
    

    return (
        <div>
            <Card className="document-table-card">
            <CardContent>
    <Grid container spacing={2} alignItems="center">
      
        <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                    value={filterDepartment}
                    onChange={(e) => handleDepartmentFilter(e.target.value)}
                    label="Department"
                    sx={{ height: '56px' }} 
                >
                    <MenuItem value="">
                        <em>All</em>
                    </MenuItem>
                    {departments
                        .filter(dept => dept.name !== 'Super Department')
                        .map((dept) => (
                            <MenuItem key={dept.id} value={dept.name}>
                                {dept.name}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3} container alignItems="center">
           
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
        </Grid>
    <Grid item xs={12} sm={4} md={3} container justifyContent="flex-end">
    {userRole === 'user' ||userRole=== 'divisionadmin'||userRole==='subdivisionuser'|| userRole === 'superadmin' ? (
            <Button
                variant="contained"
                onClick={handleOpenUploadDialog}
                sx={{
                    backgroundColor:'#FFE600', 
                    color: '#262b3b', 
                    borderRadius: '20px', 
                    padding: '6px 12px', 
                    borderColor: 'transparent', 
                    borderWidth: '1px', 
                    borderStyle: 'solid', 
                    boxShadow: statusFilter === '' ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)', 
                     marginRight: '4px',
                    '&:hover': {
                      borderColor: '#262b3b', 
                      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', 
                      backgroundColor:  '#FFE600', 
                    },
                  }}
            >
                <UploadIcon />
                Upload
            </Button>
        ) : null}
    </Grid>
</Grid>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
    
    <Box display="flex" sx={{ color: '#f4b400', textAlign: 'center' }}>
    <Button 
    onClick={() => handleStatusFilter('')} 
    variant="outlined" 
    sx={{
        backgroundColor: statusFilter === '' ? '#ffffff' : '#FFE600', 
        color: '#262b3b', 
        borderRadius: '20px', 
        padding: '6px 12px', 
        borderColor: statusFilter === '' ? '#262b3b' : 'transparent', 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        boxShadow: statusFilter === '' ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)', 
         marginRight: '4px',
        '&:hover': {
          borderColor: '#262b3b', 
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', 
          backgroundColor: statusFilter === '' ? '#ffffff' : '#FFE600', 
        },
      }}
>
    All
</Button>
<Button 
    onClick={() => handleStatusFilter('Pending')} 
    variant="outlined" 
    sx={{
        backgroundColor: statusFilter === 'Pending' ? '#ffffff' : '#FFE600', 
        color: '#262b3b', 
        borderRadius: '20px', 
        padding: '6px 12px', 
        borderColor: statusFilter === 'Pending' ? '#262b3b' : 'transparent', 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        boxShadow: statusFilter === 'Pending' ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)', 
        marginRight: '4px',
        '&:hover': {
          borderColor: '#262b3b', 
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', 
          backgroundColor: statusFilter === 'Pending' ? '#ffffff' : '#FFE600', 
        },
      }}
      
>
    Pending
</Button>
<Button 
    onClick={() => handleStatusFilter('Approved')} 
    variant="outlined" 
    sx={{
        backgroundColor: statusFilter === 'Approved' ? '#ffffff' : '#FFE600', 
        color: '#262b3b', 
        borderRadius: '20px', 
        padding: '6px 12px', 
        borderColor: statusFilter === 'Approved' ? '#262b3b' : 'transparent', 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        boxShadow: statusFilter === 'Approved' ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)', 
        marginRight: '4px',
        '&:hover': {
          borderColor: '#262b3b', 
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', 
          backgroundColor: statusFilter === 'Approved' ? '#ffffff' : '#FFE600', 
        },
      }}
      
>
    Approved
</Button>
<Button 
    onClick={() => handleStatusFilter('Rejected')} 
    variant="outlined" 
    sx={{
        backgroundColor: statusFilter === 'Rejected' ? '#ffffff' : '#FFE600', 
        color: '#262b3b', 
        borderRadius: '20px', 
        padding: '6px 12px', 
        borderColor: statusFilter === 'Rejected' ? '#262b3b' : 'transparent', 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        boxShadow: statusFilter === 'Rejected' ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)', 
        marginRight: '4px',
        '&:hover': {
          borderColor: '#262b3b', 
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', 
          backgroundColor: statusFilter === 'Rejected' ? '#ffffff' : '#FFE600', 
        },
      }}
>
    Rejected
</Button>

</Box>

{/* Approve/Reject Actions */}
{(userRole === 'superadmin' || userRole === 'departmentadmin') && (
    <Box display="flex" sx={{ color: '#f4b400', textAlign: 'center' }}>
        <Button
            variant="outlined"
            color="success"
            onClick={handleApprove}
            disabled={selectedTasks.length === 0}
            sx={{
                borderColor: selectedTasks.length > 0 ? 'transparent' : '#262b3b', 
                color: selectedTasks.length > 0 ? '#000000' : '#f4b400', 
                backgroundColor: selectedTasks.length > 0 ? '#FFE600' : 'transparent', 
                margin: '0 8px',
                padding: '6px 12px',
                borderRadius: '20px',
        
                '&:hover': {
                    backgroundColor: selectedTasks.length > 0 ? '#FFE600' : '#262b3b',
                    borderColor: selectedTasks.length > 0 ? '#000000' : '#262b3b', 
                    color: selectedTasks.length > 0 ? '#000000' : '#f4b400', 
                    textDecoration: 'none',
                    backgroundColor: '#FFE600',
                }
            }}
        >
            Approve
        </Button>
        <Button
            variant="outlined"
            color="error"
            onClick={handleReject}
            disabled={selectedTasks.length === 0}
            sx={{
                borderColor: selectedTasks.length > 0 ? 'transparent' : '#262b3b', 
                color: selectedTasks.length > 0 ? '#000000' : '#f4b400', 
                backgroundColor: selectedTasks.length > 0 ? '#FFE600' : 'transparent', 
                margin: '0 2px 0 0',
                padding: '6px 12px',
                borderRadius: '20px',
        
                '&:hover': {
                    backgroundColor: selectedTasks.length > 0 ? '#FFE600' : '#262b3b', 
                    borderColor: selectedTasks.length > 0 ? '#000000' : '#262b3b', 
                    color: selectedTasks.length > 0 ? '#000000' : '#f4b400', 
                    textDecoration: 'none',
                    backgroundColor: '#FFE600',
                }
            }}
        >
            Reject
        </Button>
    </Box>
)}

</Box>


                    {displayType === 'table' ? (
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Title</th>
                                    <th>Submitted By</th>
                                    <th>Submitted on</th>
                                    <th>Category</th>
                                    <th>Department</th>
                                   
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(task => (
                                    <tr key={task.id}>
                                        <td>
                                            <Checkbox
                                                checked={selectedTasks.includes(task.id)}
                                                onChange={() => handleTaskSelection(task.id)}
                                            />
                                        </td>
                                        <td>{task.title}</td>
                                        <td>{task.submitted_by}</td>
                                        <td>{moment(task.submitted_on).format('MMMM Do, YYYY')}</td>
                                        <td>{task.category_name}</td>
                                        <td>{task.department_name}</td>
                                        

                                        <td>{renderStatusWithDate(task)}</td>
                                        <td>
                                      
                                        <Button
                            className="icon-button"
                            aria-label="delete"
                            onClick={() => handleDelete([task])}  
                        >
                            <Delete className="icon delete-icon" />
                        </Button>
                                    <Button className="icon-button" aria-label="view" onClick={() => handleView(task)}>
                                        <Visibility  className="icon visibility-icon"  />
                                    </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : null}
                       
                    

                    
                </CardContent>
            </Card>

            <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog}>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            label="Category"
                        >
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Department</InputLabel>
                        <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            label="Department"
        >
            {departments
                .filter(dept => dept.name !== 'Super Department') 
                .map(dept => (
                    <MenuItem key={dept.id} value={dept.name}>
                        {dept.name}
                    </MenuItem>
                ))}
        </Select>
                    </FormControl>
                 
                    <input
    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.csv,.rtf,.odt,.ods,.odp,.json,.xml"
    type="file"
    onChange={(e) => setFile(e.target.files[0])}
/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUploadDialog}>Cancel</Button>
                    <Button onClick={handleUpload}>Upload</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
            />
        </div>
    );
};

export default DocumentTable;
