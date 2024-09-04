import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ReactStars from 'react-rating-stars-component';
import '../Styles/TaskTable.css';


const MySwal = withReactContent(Swal);

const handleExpandClick = () => {
    setExpanded(!expanded);
  };

const staticCategories = [
    { id: 1, name: 'Nature' },
    { id: 2, name: 'Urban' },
    { id: 3, name: 'Abstract' }
];

const staticDepartments = [
    { id: 1, name: 'Marketing' },
    { id: 2, name: 'Development' },
    { id: 3, name: 'Design' }
];

const staticTasks = [
    { id: 1, title: '4G Saturation', status: 'Pending', category_name: 'Urban', tags_name: ['#incredible india #connectivity'], file: 'https://thumbs.dreamstime.com/z/abstract-india-map-network-internet-global-connection-concept-wire-frame-d-mesh-polygonal-line-design-sphere-dot-structure-148209716.jpg?w=768', department_name: 'Department of Telecommunication' },
    { id: 2, title: 'JANMAN yojna', status: 'Approved', category_name: 'Rural', tags_name: ['#pvtg #USOF '], file: 'https://tse1.mm.bing.net/th/id/OIP.OmzanZ_ijZKCrCtiOWdNoQHaEt?rs=1&pid=ImgDetMain', department_name: 'Department of Telecommunication' },
    { id: 3, title: 'Postal Service', status: 'Rejected', category_name: 'Hills', tags_name: ['#Postal'], file: 'https://tse3.mm.bing.net/th/id/OIP.hDZVLzkQdMep-9DQJhXU8AHaEK?rs=1&pid=ImgDetMain', department_name: 'Department of Posts' }
];

function ImageTable() {
    const [tasks, setTasks] = useState(staticTasks);
    const [filteredTasks, setFilteredTasks] = useState(staticTasks);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [editTaskId, setEditTaskId] = useState(null); // New state for editing
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState(staticCategories);
    const [department, setDepartment] = useState('');
    const [departments, setDepartments] = useState(staticDepartments);
    const [image, setImage] = useState(null);
    const [tags, setTags] = useState('');
    const [searchTags, setSearchTags] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [displayType, setDisplayType] = useState('table');
    const [statusFilter, setStatusFilter] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [expanded, setExpanded] = React.useState(false);

    const filterTasks = (tasks) => {
        let filtered = [...tasks];

        if (statusFilter === 'Pending') {
            filtered = tasks.filter(task => task.status.toLowerCase() === 'pending');
        } else if (statusFilter === 'Approved') {
            filtered = tasks.filter(task => task.status.toLowerCase() === 'approved');
        } else if (statusFilter === 'Rejected') {
            filtered = tasks.filter(task => task.status.toLowerCase() === 'rejected');
        }

        if (searchTags) {
            const tagsArray = searchTags.split(' ').map(tag => tag.toLowerCase());
            filtered = filtered.filter(task =>
                tagsArray.some(tag =>
                    task.tags_name.some(taskTag => taskTag.toLowerCase().includes(tag))
                )
            );
        }

        if (filterDepartment) {
            filtered = filtered.filter(task => task.department_name === filterDepartment);
        }

        setFilteredTasks(filtered);
    };

    const handleApprove = () => {
        setTasks(tasks.map(task =>
            selectedTasks.includes(task.id) ? { ...task, status: 'Approved' } : task
        ));
        setSelectedTasks([]);
    };
    const getStatusBadge = (status) => {
        let color;
        if (status.toLowerCase() === 'pending') {
            color = 'primary';
        } else if (status.toLowerCase() === 'approved') {
            color = 'success';
        } else if (status.toLowerCase() === 'rejected') {
            color = 'error';
        }
        return <Chip label={status} color={color} />;
    };
    
    const handleReject = () => {
        setTasks(tasks.map(task =>
            selectedTasks.includes(task.id) ? { ...task, status: 'Rejected' } : task
        ));
        setSelectedTasks([]);
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
        setImage(null);
        setTags('');
    };

    const handleUpload = () => {
        if (title.trim() === '') {
            setSnackbarMessage('Title is required');
            setSnackbarOpen(true);
            return;
        }

        if (!image) {
            setSnackbarMessage('Please select an image to upload');
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
        const allowedImageTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/svg+xml'
        ];

        if (!allowedImageTypes.includes(image.type)) {
            setSnackbarMessage('Please select a JPEG, PNG, GIF, or SVG image');
            setSnackbarOpen(true);
            return;
        }

        // Check if the title is unique
        if (tasks.some(task => task.title === title)) {
            setSnackbarMessage('Title is already used. Please use a different title.');
            setSnackbarOpen(true);
            return;
        }

        const newTask = {
            id: tasks.length + 1,
            title,
            status: 'Pending',
            category_name: category,
            tags_name: tags.split(',').map(tag => tag.trim()),
            file: URL.createObjectURL(image),
            department_name: department
        };

        setTasks([...tasks, newTask]);
        handleCloseUploadDialog();
        filterTasks([...tasks, newTask]);
    };

    const handleDisplayChange = (event, newDisplayType) => {
        setDisplayType(newDisplayType);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
    };
    const handleDepartmentFilter = (departmentId) => {
        if (departmentId === 'all') {
            setFilterDepartment('');
        } else {
            setFilterDepartment(departmentId);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleEdit = (task) => {
        setEditTaskId(task.id);
        setTitle(task.title);
        setCategory(task.category_name);
        setDepartment(task.department_name);
        setTags(task.tags_name.join(', '));
        setImage(null); // Reset the image input to avoid showing the old image
        setOpenUploadDialog(true); // Open the dialog
    };

    const handleDelete = (task) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                MySwal.fire(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                );
                // Handle delete logic here
                setTasks(tasks.filter(t => t.id !== task.id));
                setFilteredTasks(filteredTasks.filter(t => t.id !== task.id));
            }
        });
    };

    const handleView = (task) => {
        MySwal.fire({
            title: task.title,
            html: (
                <div>
                    <p>View task details</p>
                    <img 
                        src={task.file} 
                        alt="Task Image" 
                        style={{ width: '400px', height: '200px' }} 
                    />
                    <div style={{display:'inline-block'}}>
                        <h3>Rate this image:</h3>
                        <ReactStars
                            count={5}
                            value={task.rating}
                            size={24}
                            activeColor="#ffd700"
                            isHalf={true}
                            edit={true}
                        />
                    </div>
                </div>
            ),
            showConfirmButton: true,
        });
    };

    return (
        <Box display="flex" flexDirection="column">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box display="flex">
                    <FormControl variant="outlined" size="small" sx={{ marginTop: '11px', minWidth: 200, maxWidth: 200 }}>
                        <InputLabel>Status Filter</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            label="Status Filter"
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" size="small" sx={{ marginTop: '11px', minWidth: 200, maxWidth: 200, ml: 2 }}>
                        <InputLabel>Department Filter</InputLabel>
                        <Select
                            value={filterDepartment}
                            onChange={(e) => handleDepartmentFilter(e.target.value)}
                            label="Department Filter"
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            {departments
                                .filter(dept => dept.name !== 'Super Department') // Filter out "Super Department"
                                .map((dept) => (
                                    <MenuItem key={dept.id} value={dept.name}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box display="flex" alignItems="center">
                    <TextField
                        label="Search by Tags"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={searchTags}
                        onChange={(e) => setSearchTags(e.target.value)}
                        placeholder="Enter tags separated by spaces, including #"
                        size="small" // Makes the input smaller
                        sx={{ minWidth: 120, maxWidth: 200, marginTop: '11px' }} // Adjusts the width and aligns with dropdowns
                    />
                    <Button onClick={() => filterTasks(tasks)} sx={{ height: 40, marginTop: '11px', ml: 2 }}>Apply Filter</Button>
                </Box>

                <Box>
                    <ToggleButtonGroup
                        value={displayType}
                        exclusive
                        onChange={handleDisplayChange}
                        aria-label="Display Type"
                        sx={{ marginTop: '11px' }}
                    >
                        <ToggleButton value="table" aria-label="Table View">
                            <TableViewIcon style={{color:'#f4b400'}}/>
                        </ToggleButton>
                        <ToggleButton value="grid" aria-label="Grid View">
                            <ViewModuleIcon style={{color:'#f4b400'}}/>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
            <Box mt={2} display="flex" justifyContent="space-between" style={{margin:'5px'}}>
                {/* <Button onClick={handleOpenUploadDialog}>Upload Image</Button> */}
                <Button
                    onClick={handleOpenUploadDialog}
                    variant="contained"
                    startIcon={<UploadIcon />}
                    sx={{ color: '#f4b400', backgroundColor: '#262b3b' }} // Yellow text and black background
                >
                    Image
                </Button>
                <Box>
                <Button
                    onClick={handleApprove}
                    disabled={selectedTasks.length === 0}
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    sx={{ marginRight: '10px', backgroundColor: 'green', color: '#fff' }} // Green background and white text
                >
                    Approve
                </Button>
                <Button
                    onClick={handleReject}
                    disabled={selectedTasks.length === 0}
                    variant="contained"
                    startIcon={<CancelIcon />}
                    sx={{ marginRight: '10px', backgroundColor: 'red', color: '#fff' }} // Red background and white text
                >
                    Reject
                </Button>
                </Box>
            </Box>
            {displayType === 'table' ? (
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Category</th>
                            <th>Tags</th>
                            <th>Image</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{border:'none'}}>
                        {filteredTasks.map(task => (
                            <tr key={task.id}>
                                <td>
                                    <Checkbox
                                        checked={selectedTasks.includes(task.id)}
                                        onChange={() => handleTaskSelection(task.id)}
                                    />
                                </td>
                                <td>{task.title}</td>
                                <td>{getStatusBadge(task.status)}</td>
                                <td>{task.category_name}</td>
                                <td>{task.tags_name.join(', ')}</td>
                                <td>{task.file ? <img src={task.file} alt={task.title} width="50" height="50" /> : 'No Image'}</td>
                                <td>{task.department_name}</td>
                                <td>
                                    <Button className="icon-button" onClick={() => handleEdit(task)}>
                                        <Edit className="icon edit-icon" />
                                    </Button>
                                    <Button className="icon-button" aria-label="delete" onClick={() => handleDelete(task)}>
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
            ) : (
                <Grid container spacing={2}>
                    {filteredTasks.map(task => (
                        <Grid item key={task.id} xs={12} sm={6} md={4}>
                             <Card sx={{ maxWidth: 345 }}>
                                  <CardHeader
                                    avatar={
                                      <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                                        R
                                      </Avatar>
                                    }
                                    action={
                                        <Checkbox
                                        checked={selectedTasks.includes(task.id)}
                                        onChange={() => handleTaskSelection(task.id)}
                                    />
                                    }
                                    title={task.title}
                                    subheader={task.status}
                                  />
                                  <CardMedia
                                    component="img"
                                    sx={{
                                        height: 150,       // Fixed height
                                        objectFit: 'cover', // Cover ensures the image covers the area without distortion
                                        width: '100%' 
                                    }}                  
                                    // height="150"
                                    image={task.file}
                                    alt="Paella dish"
                                  />
                                  <CardContent>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                padding: 2
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                                    Category:
                                                </Typography>
                                                <Typography variant="body2" color="text.primary">
                                                    {task.category_name}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                                    Tags:
                                                </Typography>
                                                <Typography variant="body2" color="text.primary">
                                                    {task.tags_name.join(', ')}
                                                </Typography>
                                            </Box>
                                        
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                                    Department:
                                                </Typography>
                                                <Typography variant="body2" color="text.primary">
                                                    {task.department_name}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <CardActions disableSpacing className='justify-between'>
                                        <Button className="icon-button" onClick={() => handleEdit(task)}>
                                            <Edit className="icon edit-icon" />
                                        </Button>
                                        <Button style={{marginLeft:'-100px'}} className="icon-button" aria-label="delete" onClick={() => handleDelete(task)}>
                                            <Delete className="icon delete-icon" />
                                        </Button>
                                            <div>
                                                <ReactStars
                                                count={5}
                                                value={task.rating}
                                                size={24}
                                                activeColor="#ffd700"
                                                isHalf={true}
                                                edit={true}
                                                />
                                            </div>
                                    </CardActions>
                                    
                                </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog}>
                <DialogTitle>Upload New Image</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        fullWidth
                        margin="normal"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            label="Category"
                        >
                            {categories.map(category => (
                                <MenuItem key={category.id} value={category.name}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            label="Department"
                        >
                            {departments.map(department => (
                                <MenuItem key={department.id} value={department.name}>
                                    {department.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Tags (comma separated)"
                        fullWidth
                        margin="normal"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
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
        </Box>
    );
}

export default ImageTable;
