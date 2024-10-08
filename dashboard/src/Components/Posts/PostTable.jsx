import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { styled } from '@mui/material/styles';
import { 
    Event as EventIcon, 
    Warning as WarningIcon,
    Label as LabelIcon,
    Flag as FlagIcon,
    Star as StarIcon
  } from '@mui/icons-material';
import { 
    Card, CardContent, Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
    Button, Dialog, DialogActions, DialogContent, DialogTitle, List,
    ListItem, ListItemText, ListItemIcon, Checkbox, Snackbar,
    Typography, Drawer, Box,Pagination, Paper, IconButton, ToggleButtonGroup, ToggleButton, CardMedia, LinearProgress,
    FormControlLabel
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
    Close as CloseIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactStars from 'react-rating-stars-component';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../utils/AuthContext';
import '../Styles/TaskTable.css';
import { BASE_URL } from '../../config';
import moment from 'moment';

const MySwal = withReactContent(Swal);

const PostTable = () => {
    const { userData } = useAuth();
    const { userRole } = userData;
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [department, setDepartment] = useState('');
    const [division, setDivision] = useState('');
    const [subdivision, setSubdivision] = useState('');
    const [departments, setDepartments] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [subdivisions, setSubdivisions] = useState([]);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [mediaType, setMediaType] = useState('');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [displayType, setDisplayType] = useState('table');
    const [statusFilter, setStatusFilter] = useState('');
    const [filterDivision, setFilterDivision] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [attachMedia, setAttachMedia] = useState(false);
    const currentDate = moment().format('YYYY-MM-DD');
    const [openUploadDrawer, setOpenUploadDrawer] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [openSettings, setOpenSettings] = useState(false);
    const [visibleFields, setVisibleFields] = useState([
        'title', 'submitted_by', 'submitted_on', 'category', 'department','division',
        'subdivision', 'status', 'actions'
    ]);
    const [hiddenFields, setHiddenFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [columnWidths, setColumnWidths] = useState({});
    const [isResizing, setIsResizing] = useState(false);
    const resizingRef = useRef(null);
    const tableRef = useRef(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
                setDepartments(departmentsResponse.data.departments);
                setDivisions(departmentsResponse.data.divisions);
                setSubdivisions(departmentsResponse.data.subdivisions);

                setImages(imagesResponse.data.images || []);
                setVideos(videosResponse.data.videos || []);

                filterTasks(tasksResponse.data, statusFilter, filterDivision);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [page, itemsPerPage, statusFilter, filterDivision]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeItemsPerPage = (event) => {
        const newItemsPerPage = parseInt(event.target.value, 10);
        setItemsPerPage(newItemsPerPage);
        setPage(1);
        setTotalPages(Math.ceil(filteredTasks.length / newItemsPerPage));
    };



    useEffect(() => {
        filterTasks(tasks, statusFilter, filterDivision);
    }, [tasks, statusFilter, filterDivision]);

    useEffect(() => {
        const initialWidths = {};
        visibleFields.forEach((field) => {
            initialWidths[field] = 150; // Default width
        });
        setColumnWidths(initialWidths);
    }, [visibleFields]);

    const filterTasks = (tasks, status = '', division = '') => {
        let filtered = [...tasks];
    
        if (status) {
            filtered = filtered.filter(task => task.status.toLowerCase() === status.toLowerCase());
        }
    
        if (division) {
            filtered = filtered.filter(task => task.division_name.toLowerCase() === division.toLowerCase());
        }
    
        setFilteredTasks(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setPage(1); // Reset to first page when filter changes
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
    const getCategoryIcon = (catName) => {
        if (catName.startsWith('Event -')) return <EventIcon sx={{ color: '#262b3b' }} />;
        if (catName === 'Urgent') return <WarningIcon sx={{ color: '#ff6b6b' }} />;
        if (catName === 'Important') return <StarIcon sx={{ color: '#4dabf5' }} />;
        if (catName === 'Follow-up') return <FlagIcon sx={{ color: '#51cf66' }} />;
        return <LabelIcon sx={{ color: '#868e96' }} />; 
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

    const handleOpenUploadDrawer = () => {
        setOpenUploadDrawer(true);
        resetUploadProgress();
    };

    const handleCloseUploadDrawer = () => {
        setOpenUploadDrawer(false);
        setTitle('');
        setDescription('');
        setCategory('');
        setDepartment('');
        setSubdivision('');
        setDivision('');
        setSelectedMedia(null);
        setMediaType('');
        setAttachMedia(false);
        resetUploadProgress();
    };

    const resetUploadProgress = () => {
        setUploadProgress(0);
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
        if (selectedMedia.type && !selectedMedia.type.startsWith('image/') && !selectedMedia.type.startsWith('video/')) {
            setSnackbarMessage('Invalid media type. Please select an image or video.');
            setSnackbarOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category_name', category);
        formData.append('department_name', department);
        formData.append('division_name', division);
        formData.append('subdivision_name', subdivision);

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

        axiosInstance.post('/api/posts/dashboard/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        })
        .then(response => {
            const newTask = {
                id: response.data.post.id,
                title,
                description,
                rating: 0,
                status: 'Pending',
                image_url: response.data.post.image_url,
                video_url: response.data.post.video_url,
                category_name: category,
                department_name: department,
                division_name: division,
                subdivision_name: subdivision,
                submitted_by: userData.fullName,
                submitted_on: currentDate
            };

            setTasks([...tasks, newTask]);
            handleCloseUploadDrawer();
            filterTasks([...tasks, newTask]);
            setSnackbarMessage('Post uploaded successfully');
            setSnackbarOpen(true);
        })
        .catch(error => {
            console.error('Error uploading post:', error);
            setSnackbarMessage('Error uploading post');
            setSnackbarOpen(true);
            resetUploadProgress();
        });
    };

    const urlToFile = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const extension = blob.type.split('/')[1];  // Extract file extension from MIME type
        return new File([blob], `${filename}.${extension}`, { type: blob.type });
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setSelectedMedia({
                id: null,
                file: file,
                type: file.type.startsWith('image/') ? 'image' : 'video',
                url: URL.createObjectURL(file),
                title: file.name,
            });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: 'image/*,video/*',
        maxSize: 50 * 1024 * 1024 // 50MB
    });

    const getFieldName = (field) => {
        const fieldNames = {
            title: 'Title',
            submitted_by: 'Submitted By',
            submitted_on: 'Submitted On',
            category: 'Category',
            department: 'Department',
            division: 'Division',
            subdivision: 'Sub-Division',
            status: 'Status',
            actions: 'Actions'
        };
        return fieldNames[field] || field;
    };

    const renderFieldContent = (task, field) => {
        switch (field) {
          case 'title':
            return task.title;
          case 'submitted_by':
            return task.submitted_by;
          case 'submitted_on':
            return moment(task.submitted_on).format('MMMM Do, YYYY');
          case 'category':
            return task.category_name;
          case 'department':
            return task.department_name;
          case 'division':
                return task.division_name;
          case 'subdivision':
                return task.subdivision_name;
          case 'status':
            return renderStatusWithDate(task);
          case 'actions':
            return (
              <>
                <IconButton onClick={() => handleDelete([task])}>
                  <Delete />
                </IconButton>
                <IconButton onClick={() => handleView(task)}>
                  <Visibility />
                </IconButton>
              </>
            );
          default:
            return null;
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
                dateText = `on ${moment(statusChangeDate || submittedOn).format('MMMM Do, YYYY')}`;
                fontColor = 'green';
                break;
            case 'Rejected':
                statusLabel = 'Rejected';
                dateText = `on ${moment(statusChangeDate || submittedOn).format('MMMM Do, YYYY')}`;
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

    const handleView = (task) => {
        const imageUrl = task.image_url ? `${BASE_URL}${task.image_url}` : null;
        const videoUrl = task.video_url ? `${BASE_URL}${task.video_url}` : null;
    
        MySwal.fire({
            title: task.title,
            html: (
                <div style={{ textAlign: 'center' }}>
                    <p>{task.description}</p>
    
                    {imageUrl && (
                        <div style={{ 
                            marginTop: '15px', 
                            height: '200px', 
                            width: '100%', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center' 
                        }}>
                            <img 
                                src={imageUrl} 
                                alt="Task Image" 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '100%', 
                                    objectFit: 'contain' 
                                }} 
                            />
                        </div>
                    )}
    
                    {videoUrl && (
                        <div style={{ 
                            marginTop: '15px', 
                            height: '200px', 
                            width: '100%', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center' 
                        }}>
                            <video 
                                src={videoUrl} 
                                controls 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '100%', 
                                    objectFit: 'cover' 
                                }} 
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}
    
                    {userRole === 'superadmin' || userRole === 'departmentadmin' ? (
                        <div style={{ 
                            marginTop: '15px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center' 
                        }}>
                            <h3 style={{ marginBottom: '10px' }}>Rate this post:</h3>
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
            customClass: {
                confirmButton: 'swal-confirm-button',
                cancelButton: 'swal-cancel-button',
            }
        });
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

    const handleDelete = (selectedTasks) => {
        if (!selectedTasks || selectedTasks.length === 0) {
            console.error('No tasks selected for deletion.');
            return;
        }
    
        MySwal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${selectedTasks.length > 1 ? 'these posts' : `"${selectedTasks[0].title}"`}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'No, keep them',
            customClass: {
                confirmButton: 'swal-confirm-button',
                cancelButton: 'swal-cancel-button',
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const postIds = selectedTasks.map(task => task.id);
                
                axiosInstance.delete('/api/posts/delete/', {
                    data: { post_ids: postIds }
                })
                .then(() => {
                    const remainingTasks = tasks.filter(t => !postIds.includes(t.id));
                    setTasks(remainingTasks);
                    filterTasks(remainingTasks);
                    setSnackbarMessage('Posts deleted successfully');
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

    const handleApprove = async () => {
        try {
            await axiosInstance.post('/api/posts/approve/', {
                task_ids: selectedTasks
            });
    
            const currentDate = moment().format('YYYY-MM-DD');
    
            const updatedTasks = tasks.map(task =>
                selectedTasks.includes(task.id)
                    ? { ...task, status: 'Approved', status_change_date: currentDate }
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

    const handleReject = async () => {
        try {
            await axiosInstance.post('/api/posts/reject/', {
                task_ids: selectedTasks
            });
    
            const currentDate = moment().format('YYYY-MM-DD');
    
            const updatedTasks = tasks.map(task =>
                selectedTasks.includes(task.id)
                    ? { ...task, status: 'Rejected', status_change_date: currentDate }
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

    const handleTaskSelection = (taskId) => {
        setSelectedTasks((prevSelected) =>
            prevSelected.includes(taskId)
                ? prevSelected.filter((id) => id !== taskId)
                : [...prevSelected, taskId]
        );
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        filterTasks(tasks, status, filterDepartment);
    };

    const handleDivisionFilter = (divisionName) => {
        setFilterDivision(divisionName === 'all' ? '' : divisionName);
        filterTasks(tasks, statusFilter, divisionName === 'all' ? '' : divisionName);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleMediaTypeChange = (event) => {
        setMediaType(event.target.value);
        setSelectedMedia(null);
    };

    const handleMediaSelect = (media) => {
        setSelectedMedia(selectedMedia?.id === media.id ? null : {
            id: media.id,
            file: media.file || null,
            url: media.image_url || media.video_url,
            title: media.title,
        });
    };

    const handleAttachMediaChange = (event) => {
        setAttachMedia(event.target.checked);
        if (!event.target.checked) {
            setMediaType('');
            setSelectedMedia(null);
        }
    };

    return (
        <div>
            <Card className="post-table-card">
                <CardContent>
                    <Grid container spacing={2} alignItems="center" wrap="nowrap">
                        <Grid item xs={12} sm={4} md={3}>
                            <FormControl fullWidth className="department-select">
                            <InputLabel>Division</InputLabel>
                                <Select
                                    value={filterDivision}
                                    onChange={(e) => handleDivisionFilter(e.target.value)}
                                    label="Division"
                                >
                                    <MenuItem value="">
                                        <em>All</em>
                                    </MenuItem>
                                    {divisions.map((div) => (
                                        <MenuItem key={div.id} value={div.name}>
                                            {div.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} md={6} container alignItems="center">
                            {/* You can add additional controls here if needed */}
                        </Grid>
                        <Grid item xs={12} sm={4} md={3} container justifyContent="flex-end" alignItems="center">
                            {userRole === 'user' || userRole === 'divisionadmin' || userRole === 'subdivisionuser' || userRole === 'superadmin' ? (
                                <Box display="flex" alignItems="center">
                                    <Button
                                        variant="contained"
                                        onClick={handleOpenUploadDrawer}
                                        className="ControlButton"
                                    >
                                        <UploadIcon sx={{ marginRight: '8px' }} />
                                        Post
                                    </Button>
                                   
                                </Box>
                            ) : null}
                             <Button 
                                        className="ControlButton" 
                                        onClick={handleOpenSettings} 
                                        sx={{ ml: '8px' }} 
                                        startIcon={<SettingsIcon sx={{ color: 'black' }} />} 
                                    />
                        </Grid>
                    </Grid>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Box display="flex" sx={{ color: '#f4b400', textAlign: 'center' }}>
                            <div className="button-container">
                                {['', 'Pending', 'Approved', 'Rejected'].map((status) => (
                                    <Button
                                        key={status}
                                        onClick={() => handleStatusFilter(status)}
                                        className={`filter-button ${statusFilter === status ? 'active' : 'inactive'}`}
                                    >
                                        {status === '' ? 'All' : status}
                                    </Button>
                                ))}
                            </div>
                        </Box>

                        {(userRole === 'superadmin' || userRole === 'departmentadmin') && (
                            <Box display="flex" sx={{ color: '#f4b400', textAlign: 'center' }}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={handleApprove}
                                    disabled={selectedTasks.length === 0}
                                    className="action-button"
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleReject}
                                    disabled={selectedTasks.length === 0}
                                    className="action-button"
                                >
                                    Reject
                                </Button>
                            </Box>
                        )}
                    </Box>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="styled-table" ref={tableRef}>
                            <thead>
                                <tr>
                                    <th style={{ width: 50 }}>Select</th>
                                    {visibleFields.map((field) => (
                                        <th 
                                            key={field} 
                                            style={{ width: columnWidths[field] || 150 }}
                                        >
                                            {getFieldName(field)}
                                            <div 
                                                className="ResizeHandle" 
                                                onMouseDown={(e) => handleResizeStart(e, field)} 
                                            />
                                        </th>
                                    ))}
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
                                        {visibleFields.map((field) => (
                                            <td key={field} style={{ width: columnWidths[field] || 150 }}>
                                                {renderFieldContent(task, field)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <FormControl variant="outlined" size="small">
                            <Select
                                value={itemsPerPage}
                                onChange={handleChangeItemsPerPage}
                                displayEmpty
                            >
                                <MenuItem value={10}>10 per page</MenuItem>
                                <MenuItem value={25}>25 per page</MenuItem>
                                <MenuItem value={50}>50 per page</MenuItem>
                            </Select>
                        </FormControl>
                        <Pagination
  count={totalPages}
  page={page}
  onChange={handleChangePage}
  sx={{
    '& .MuiPaginationItem-root': {
      color: 'black', // Font color for pagination items
    },
    '& .MuiPaginationItem-root.Mui-selected': {
      backgroundColor: 'gold', // Background color for the selected page
      color: 'black', // Font color for the selected page
    },
    '& .MuiPaginationItem-root:hover': {
      backgroundColor: 'lightgoldenrodyellow', // Background color on hover
    },
  }}
/>
                    </Box>
                </CardContent>
            </Card>

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

        <Drawer className="UploadDrawer" anchor="right" open={openUploadDrawer} onClose={handleCloseUploadDrawer}>
            <Box sx={{ position: 'relative', height: '100%', width: 300, padding: 3 }}>
                <IconButton
                    onClick={handleCloseUploadDrawer}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#262b3b' }}>
                    Create New Post
                </Typography>
                <TextField
                    margin="dense"
                    label="Title"
                    fullWidth
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 2 }}
                />
               <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
               <InputLabel>Category</InputLabel>
      <Select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        label="Category"
      >
        {categories.map(cat => (
          <MenuItem
            key={cat.id}
            value={cat.name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              ...(cat.name.startsWith('Event-') && {
                borderLeft: '4px solid #FFD700',
                paddingLeft: '12px',
                '&:hover': {
                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                },
              }),
              ...(cat.name === 'Urgent' && {
                borderLeft: '4px solid #ff6b6b',
                paddingLeft: '12px',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: 'rgba(255, 107, 107, 0.1)',
                },
              }),
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {getCategoryIcon(cat.name)}
              </Box>
              <Typography
                sx={{
                  fontWeight: cat.name === 'Urgent' ? 'bold' : 
                            cat.name.startsWith('Event -') ? 'medium' : 'normal',
                  color: cat.name === 'Urgent' ? '#ff6b6b' : 'inherit',
                }}
              >
                {cat.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
                <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
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
                <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                    <InputLabel>Division</InputLabel>
                    <Select
                        value={division || ''}
                        onChange={(e) => setDivision(e.target.value)}
                        label="Division"
                    >
                        {(!divisions || divisions.length === 0 || divisions.every(dept => dept === null || dept.name === null)) ? (
                            <MenuItem disabled value="">
                                No Division Available
                            </MenuItem>
                        ) : (
                            divisions
                                .map(dept => (
                                    <MenuItem key={dept.id} value={dept.name}>
                                        {dept.name}
                                    </MenuItem>
                                ))
                        )}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                    <InputLabel>Sub-Division</InputLabel>
                    <Select
                        value={subdivision || ''}
                        onChange={(e) => setSubdivision(e.target.value)}
                        label="Sub-Division"
                    >
                        {(!subdivisions || subdivisions.length === 0 || subdivisions.every(dept => dept === null || dept.name === null)) ? (
                            <MenuItem disabled value="">
                                No Sub-Division Available
                            </MenuItem>
                        ) : (
                            subdivisions
                                .map(dept => (
                                    <MenuItem key={dept.id} value={dept.name}>
                                        {dept.name}
                                    </MenuItem>
                                ))
                        )}
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
                {attachMedia && (
                    <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                        <InputLabel>Media Type</InputLabel>
                        <Select
                            value={mediaType}
                            onChange={handleMediaTypeChange}
                            label="Media Type"
                        >
                            <MenuItem value="image">Approved Images</MenuItem>
                            <MenuItem value="video">Approved Videos</MenuItem>
                            <MenuItem value="device">From Device</MenuItem>
                        </Select>
                    </FormControl>
                )}
                {mediaType === 'image' && (
                    <Grid container spacing={2} marginTop={2}>
                        {images.map((image) => (
                            <Grid item xs={6} key={image.id}>
                                <Card
                                    sx={{ height: 100, position: 'relative' }}
                                    onClick={() => handleMediaSelect(image)}
                                >
                                    <CardMedia
                                        component="img"
                                        alt={image.title}
                                        height="100%"
                                        image={`${BASE_URL}${image.image_url}`}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <Checkbox
                                        checked={selectedMedia?.id === image.id}
                                        sx={{ position: 'absolute', top: 0, right: 0 }}
                                    />
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {mediaType === 'video' && (
                    <Grid container spacing={2} marginTop={2}>
                        {videos.map((video) => (
                            <Grid item xs={6} key={video.id}>
                                <Card
                                    sx={{ height: 100, position: 'relative' }}
                                    onClick={() => handleMediaSelect(video)}
                                >
                                    <CardMedia
                                        component="video"
                                        height="100%"
                                        src={`${BASE_URL}${video.video_url}`}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <Checkbox
                                        checked={selectedMedia?.id === video.id}
                                        sx={{ position: 'absolute', top: 0, right: 0 }}
                                    />
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {mediaType === 'device' && (
                    <div className="DropzoneArea" {...getRootProps()}>
                        <input {...getInputProps()} />
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#f4b400', mb: 2 }} />
                        {isDragActive ? (
                            <Typography>Drop the file here...</Typography>
                        ) : (
                            <Typography>Drag and drop a file here, or click to select</Typography>
                        )}
                    </div>
                )}
                {selectedMedia && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">Selected Media:</Typography>
                        <Typography variant="body2">{selectedMedia.title}</Typography>
                    </Box>
                )}
                {uploadProgress > 0 && (
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                        <Typography variant="body2" color="text.secondary" align="center">
                            {`${Math.round(uploadProgress)}%`}
                        </Typography>
                    </Box>
                )}
                <Button
                    className="UploadButton"
                    fullWidth
                    onClick={handleUpload}
                    disabled={!title || !description || !category || !department || uploadProgress > 0}
                    variant="contained"
                >
                    Create Post
                </Button>
            </Box>
        </Drawer>

        <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            message={snackbarMessage}
            action={
                <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleCloseSnackbar}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            }
        />
    </div>
);
};

export default PostTable;