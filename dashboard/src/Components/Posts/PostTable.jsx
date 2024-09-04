import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance'; 
import { styled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Card from '@mui/material/Card';
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
import { useAuth } from '../utils/AuthContext';
import { BASE_URL } from '../../config';

const MySwal = withReactContent(Swal);

const PostTable = () => {
    const { userData } = useAuth();
    const { userRole } = userData;
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [editTaskId, setEditTaskId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [department, setDepartment] = useState('');
    const [departments, setDepartments] = useState([]);
    const [images, setImages] = useState([]);
    const [image, setImage] = useState([]);
    const [videos, setVideos] = useState([]);
    const [video, setVideo] = useState([]);
    const [post, setpost] = useState(null);
    const [mediaType, setMediaType] = useState('');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showImages, setShowImages] = useState(false);
    const [showVideos, setShowVideos] = useState(false);
    const [uploadFromDevice, setUploadFromDevice] = useState(false);
    const currentDate = moment().format('YYYY-MM-DD');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [displayType, setDisplayType] = useState('table');
    const [statusFilter, setStatusFilter] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState([]);
    const [rating, setRating] = useState(0);
    const [attachMedia, setAttachMedia] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
              
                const tasksResponse = await axiosInstance.get('api/posts/dashboard/');
                const categoriesResponse = await axiosInstance.get('/api/categories/');
                const departmentsResponse = await axiosInstance.get('/api/department-userwise/');
                const imagesResponse = await axiosInstance.get('/api/approved_images/');
                const videosResponse = await axiosInstance.get('/api/approved_videos/');

                setTasks(tasksResponse.data);
                setCategories(categoriesResponse.data);
                setDepartments(departmentsResponse.data);
                setImages(imagesResponse.data.images || []);
                setVideos(videosResponse.data.videos || []);
                

                
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
            await axiosInstance.post('/api/posts/approve/', {
                task_ids: selectedTasks
            });
            const currentDate = moment().format('YYYY-MM-DD');
            
            const updatedTasks = tasks.map(task =>
                selectedTasks.includes(task.id)
                    ? { ...task, status: 'Approved' , status_change_date: currentDate }
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
    const handleMediaTypeChange = (event) => {
        const newMediaType = event.target.value;
        setMediaType(newMediaType);
        setSelectedMedia(null); // Clear selection when media type changes
    
        // Control visibility based on media type
        setShowImages(newMediaType === 'image');
        setShowVideos(newMediaType === 'video');
        setUploadFromDevice(newMediaType === 'device');
    };

    const handleMediaSelect = (media) => {
        // Check if the clicked media item is already selected
        if (selectedMedia?.id === media.id) {
            // Deselect the media item if it's already selected
            setSelectedMedia(null);
        } else {
            // Handle the selection of a new media item
            const mediaUrl = media.image_url || media.video_url || null;
    
            if (mediaUrl) {
                // Only set selected media if URL is valid
                setSelectedMedia({
                    id: media.id,
                    file: media.file || null, // Handle if media.file is not available
                    url: mediaUrl,
                    title: media.title,
                });
            } else {
                // Handle the case where media URL is invalid or not available
                console.warn('Selected media has no valid URL');
                // Optional: Show an error message to the user if needed
            }
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
    
    const handleReject = async () => {
        try {
            await axiosInstance.post('/api/posts/reject/', {
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
        
       
        axiosInstance.patch(`api/posts/${taskId}/rate/`, { rating: newRating })
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
        setImage('');
        setVideo('');
        setDepartment('');
        setpost(null);
        setAttachMedia('');
        setDescription('')
        setSelectedMedia('');
        setMediaType('')
    };

    const urlToFile = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const extension = blob.type.split('/')[1];  // Extract file extension from MIME type
        return new File([blob], `${filename}.${extension}`, { type: blob.type });
    };  

    const handleUpload = async () => {
        if (title.trim() === '') {
            setSnackbarMessage('Title is required');
            setSnackbarOpen(true);
            return;
        }
    
        if (description.trim() === '') {
            setSnackbarMessage('Description is required');
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
    
        if (tasks.some(task => task.title === title)) {
            setSnackbarMessage('Title is already used. Please use a different title.');
            setSnackbarOpen(true);
            return;
        }
        if (attachMedia && !selectedMedia) {
            setSnackbarMessage('Please select media before uploading.');
            setSnackbarOpen(true);
            return;
        }
    
        
    
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category_name', category);
        formData.append('department_name', department);
        formData.append('description', description);
    
        if (selectedMedia) {
            try {
                const fullUrl = selectedMedia.url.startsWith(BASE_URL)
                    ? selectedMedia.url
                    : `${BASE_URL}${selectedMedia.url}`;
        
                if (mediaType === 'image' && selectedMedia.url) {
                    const file = await urlToFile(fullUrl, selectedMedia.title || 'image.jpg');
                    formData.append('image', file);
                } else if (mediaType === 'video' && selectedMedia.url) {
                    const file = await urlToFile(fullUrl, selectedMedia.title || 'video.mp4');
                    formData.append('video', file);
                } else if (mediaType === 'device' && selectedMedia.file) {
                    const file = selectedMedia.file;
                    const fileType = file.type.split('/')[0]; // "image" or "video"
                    
                    if (fileType === 'image') {
                        formData.append('image', file);
                    } else if (fileType === 'video') {
                        formData.append('video', file);
                    } else {
                        console.error('Selected file is neither an image nor a video');
                    }
                }
            } catch (error) {
                console.error('Error converting media URL to file:', error);
                setSnackbarMessage('Error processing media');
                setSnackbarOpen(true);
                return;
            }
        }
        
        console.log('FormData content:', Array.from(formData.entries()));
    
        axiosInstance.post('/api/posts/dashboard/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            console.log('Upload successful:', response);
            console.log('new id',response.data.post.image_url)
            const newTask = {
                id: response.data.post.id,
                title,
                rating:2,
                status: 'Pending',
                image_url:response.data.post.image_url,
                video_url:response.data.post.video_url,
                category_name: category,
                description,
                department_name: department,
                submitted_by: userData.fullName,
                submitted_on: currentDate
            };
    
            setTasks([...tasks, newTask]);
            handleCloseUploadDialog();
            filterTasks([...tasks, newTask]);
            resetUploadState();
    
            // Display success message
            setSnackbarMessage('Task uploaded successfully');
            setSnackbarOpen(true);
        })
        .catch(error => {
            console.error('Error uploading task:', error);
            setSnackbarMessage('Error uploading task');
            setSnackbarOpen(true);
        });
    };
    
    

    const resetUploadState = () => {
        setSelectedMedia(null);  // Clear selected media
        setMediaType(null);      // Clear media type
        setPreviewUrl(null);     // Clear preview URL
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

    const handleUploadFromDevice = (event) => {
        const { files } = event.target;
    
        if (!files || files.length === 0) {
            console.error('No file selected');
            return;
        }
    
        const file = files[0];
        const fileType = file.type.split('/')[0]; // "image" or "video"
    
        if (file && (fileType === 'image' || fileType === 'video')) {
            setSelectedMedia({
                id: null, // Set to null or a default value if not applicable
                file: file,
                type: fileType,
                url: URL.createObjectURL(file), // Generate a URL for preview if needed
                title: file.name,
            });
        } else {
            console.error('Selected file is not an image or video');
        }
    };
    
    

    

    const handleDelete = (selectedTasks) => {
        if (!selectedTasks || selectedTasks.length === 0) {
            console.error('No tasks selected for deletion.');
            return;
        }
    
        MySwal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${selectedTasks.length > 1 ? 'these tasks' : `"${selectedTasks[0].title}"`}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'No, keep them'
        }).then((result) => {
            if (result.isConfirmed) {
                
                const postIds = selectedTasks.map(task => task.id);
                
                if (postIds.length === 0) {
                    console.error('No valid task IDs found.');
                    return;
                }
        
                axiosInstance.delete('/api/posts/delete/', {
                    data: { post_ids: postIds }  
                })
                .then(() => {
                    const remainingTasks = tasks.filter(t => !postIds.includes(t.id));
                    setTasks(remainingTasks);
                    filterTasks(remainingTasks);
                    setSnackbarMessage('posts deleted successfully');
                    setSnackbarOpen(true);
                })
                .catch(error => {
                    console.error('Error deleting posts:', error);
                    setSnackbarMessage('Error deleting posts');
                    setSnackbarOpen(true);
                });
            }
        });
    };
    
    
    const handleView = (task) => {
        const imageUrl = task.image_url ? `${BASE_URL}${task.image_url}` : null;
        const videoUrl = task.video_url ? `${BASE_URL}${task.video_url}` : null;
    
        MySwal.fire({
            title: task.title,  
            html: (
                <div style={{ textAlign: 'center' }}>
                    <p>{task.description}</p>
                    
                    {imageUrl && (
                        <Card sx={{ height: 200, width: '100%', marginTop: '15px' }}>
                            <CardMedia
                                component="img"
                                src={imageUrl}
                                sx={{ objectFit: 'contain', height: '100%' }}
                            />
                        </Card>
                    )}
    
                    {videoUrl && (
                        <Card sx={{ height: 200, width: '100%', marginTop: '15px' }}>
                            <CardMedia
                                component="video"
                                src={videoUrl}
                                controls
                                sx={{ objectFit: 'cover', height: '100%' }}
                            />
                        </Card>
                    )}
    
                    {userRole === 'superadmin' || userRole === 'departmentadmin' ? (
                        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3>Rate this post:</h3>
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
                    ) : null}
                </div>
            ),
            showCloseButton: true,  
            showConfirmButton: true,
        });
    };
    
   

    const handleAttachMediaChange = (event) => {
        setAttachMedia(event.target.checked);
        if (!event.target.checked) {
            setMediaType(''); // Reset media type if checkbox is unchecked
        }
    };
    
    return (
        <div>
           <Card className="post-table-card">
 
    <CardContent>
    <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                        value={filterDepartment}
                        onChange={(e) => handleDepartmentFilter(e.target.value)}
                        label="Department"
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
            <Grid item xs={12} sm={8} md={9} container justifyContent="flex-end">
            {userRole === 'user' ||userRole=== 'divisionadmin'||userRole==='subdivisionuser'|| userRole === 'superadmin'? (
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
                        Post
                    </Button>
                ) : null}
            </Grid>
        </Grid>

                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
    {/* Status Filter Buttons (Aligned to the Left) */}
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
                    ) : (
                        <div className="task-grid">
    <Box 
        flex="1" 
        display="flex" 
        flexWrap="wrap" 
        justifyContent="space-evenly"
        gap="20px" 
    >
        {filteredTasks.map(task => (
            <Card 
                key={task.id} 
                className="task-card"
                sx={{
                    width: 250,
                    height: 320,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Soft shadow
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Deeper shadow on hover
                    },
                    marginBottom: '20px', // Add this line to add space between the rows
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
                    <CardMedia
                        component="img"
                        post={`${BASE_URL}${task.file}`}
                        alt={task.title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
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
                        {task.title}
                    </Typography>
                    <Typography 
                        color="textSecondary"
                        sx={{ 
                            fontSize: '0.85rem',
                            color: '#666', 
                            marginBottom: '4px',
                        }}
                    >
                        {task.department_name}
                    </Typography>
                    {getStatusBadge(task.status)}
                </CardContent>
            </Card>
        ))}
    </Box>
</div>       

                    )}
                </CardContent>
            </Card>
           
            <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog}>
    <DialogTitle>Create Post</DialogTitle>
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
        <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            .filter(dept => dept.name !== 'Super Department') // Filter out "Super Department"
            .map(dept => (
                <MenuItem key={dept.id} value={dept.name}>
                    {dept.name}
                </MenuItem>
            ))
        }
    </Select>
</FormControl>

<FormControlLabel
                control={
                    <Checkbox
                        checked={attachMedia}
                        onChange={handleAttachMediaChange}
                        color="primary"
                    />
                }
                label="Attach Media"
            />

            {/* Media Type dropdown, visible only if checkbox is checked */}
            {attachMedia && (
                <FormControl fullWidth margin="dense">
                    <InputLabel>Media Type</InputLabel>
                    <Select
                        value={mediaType}
                        onChange={handleMediaTypeChange}
                        label="Media Type"
                        defaultValue="" // Set None as default
                    >
                       
                        <MenuItem value="image">Approved Images</MenuItem>
                        <MenuItem value="video">Approved Videos</MenuItem>
                        <MenuItem value="device">From Device</MenuItem>
                    </Select>
                </FormControl>
            )}
        {/* Approved Images Section */}
        {mediaType === 'image' && (
            <Grid container spacing={2} marginTop={2}>
                {images.map((image) => (
                    <Grid item xs={12} sm={6} md={4} key={image.id}>
                        <Card
                            sx={{ height: 200, width: '100%', position: 'relative' }}
                            onClick={() => {
                                console.log("Image card clicked", image);
                                handleMediaSelect(image);
                            }}
                        >
                            <CardMedia
                                component="img"
                                alt={image.title}
                                height="100%"
                                image={`${BASE_URL}${image.image_url}`}
                                sx={{ objectFit: 'cover', height: '100%' }}
                            />
                            <CardContent>
                                {image.title}
                            </CardContent>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedMedia?.id === image.id}
                                        onChange={() => {
                                            console.log("Image checkbox clicked", image);
                                            handleMediaSelect(image);
                                        }}
                                    />
                                }
                                label=""
                                sx={{ position: 'absolute', top: 0, right: 0 }}
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        )}

        {/* Approved Videos Section */}
        {mediaType === 'video' && (
            <Grid container spacing={2} marginTop={2}>
                {videos.map((video) => (
                    <Grid item xs={12} sm={6} md={4} key={video.id}>
                        <Card
                            sx={{ height: 200, width: '100%', position: 'relative' }}
                            onClick={() => {
                                console.log("Video card clicked", video);
                                handleMediaSelect(video);
                            }}
                        >
                            <CardMedia
                                component="video"
                                controls
                                height="100%"
                                src={`${BASE_URL}${video.video_url}`}
                                sx={{ objectFit: 'cover', height: '100%' }}
                            />
                            <CardContent>
                                {video.title}
                            </CardContent>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedMedia?.id === video.id}
                                        onChange={() => {
                                            console.log("Video checkbox clicked", video);
                                            handleMediaSelect(video);
                                        }}
                                    />
                                }
                                label=""
                                sx={{ position: 'absolute', top: 0, right: 0 }}
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>
        )}

        {/* Upload From Device Section */}
        {mediaType === 'device' && (
    <>
        <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
                console.log("File selected from device", e.target.files[0]);
                handleUploadFromDevice(e);
            }}
        />
             {selectedMedia && (
    <Card sx={{ height: 200, width: '100%' }}>
        <CardMedia
            component={selectedMedia.file.type.startsWith('image/') ? 'img' : 'video'}
            src={selectedMedia.url}
            controls={selectedMedia.file.type.startsWith('video/')}
            sx={{ objectFit: 'contain', height: '100%', width: '100%' }}
        />
        <CardContent>
            {selectedMedia.title}
        </CardContent>
    </Card>
)}


            </>
        )}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleCloseUploadDialog}>Cancel</Button>
        <Button onClick={handleUpload} >Upload</Button>
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

export default PostTable;
