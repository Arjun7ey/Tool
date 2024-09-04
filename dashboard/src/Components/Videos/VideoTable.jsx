import React, { useState, useEffect, useCallback,useRef  } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axiosInstance from '../utils/axiosInstance';
import { styled } from '@mui/material/styles';

import { 
    Card, CardContent, Grid, TextField, FormControl, InputLabel, Select, MenuItem, 
    Button, Dialog, DialogActions, DialogContent, DialogTitle,List,
    ListItem,
    ListItemText,
    ListItemIcon, Checkbox, Snackbar,
    Typography,Drawer, Box,Paper, IconButton, ToggleButtonGroup, ToggleButton, CardMedia,LinearProgress,
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
import ReactStars from 'react-rating-stars-component';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../utils/AuthContext';
import { BASE_URL } from '../../config';
import moment from 'moment';

const MySwal = withReactContent(Swal);
const ControlButton = styled(Button)(({ theme }) => ({
    height: '32px',
    borderRadius: '8px',
    padding: '0 16px',
    marginRight: '8px',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '0.75rem',
    textTransform: 'none',
    minWidth: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-2px)',
    },
  }));
const StyledTable = styled('table')(({ theme }) => ({
    borderCollapse: 'separate',
    borderSpacing: 0,
    width: '100%',
    margin: '25px 0',
    fontSize: '0.9em',
    fontFamily: 'Poppins, Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    minWidth: '400px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    '& thead tr': {
        backgroundColor: '#262b3b',
        color: '#ffffff',
        textAlign: 'center',
    },
    '& th, & td': {
        padding: '12px 15px',
        textAlign: 'center',
        borderRight: '1px solid #ddd',
        borderBottom: '1px solid #ddd',
        transition: 'background-color 0.3s ease',
    },
    '& th': {
        whiteSpace: 'nowrap',
        borderLeft: 0,
        fontWeight: 600,
        position: 'relative',
        userSelect: 'none',
    },
    '& tbody tr': {
        '&:nth-of-type(even)': {
            backgroundColor: '#f9f9f9',
        },
        '&:last-of-type': {
            borderBottom: `2px solid #f4b400`,
        },
        '&:hover td': {
            backgroundColor: '#e0e0e0',
        },
    },
    '& tbody td:last-child': {
        borderRight: 0,
        width: '150px',
        padding: '10px',
        minWidth: '120px',
    },
}));
const UploadDrawer = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        width: '400px',
        padding: theme.spacing(3),
        background: 'linear-gradient(145deg, #f6f6f6, #ffffff)',
        boxShadow: '10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff',
        borderRadius: '20px 0 0 20px',
    },
}));

const DropzoneArea = styled('div')(({ theme }) => ({
    border: '2px dashed #f4b400',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'all 0.3s ease-in-out',
    background: 'linear-gradient(145deg, #ffffff, #f6f6f6)',
    boxShadow: 'inset 5px 5px 10px #d1d1d1, inset -5px -5px 10px #ffffff',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 'inset 7px 7px 14px #d1d1d1, inset -7px -7px 14px #ffffff',
    },
}));

const UploadButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(45deg, #FFE600 30%, #FFD100 90%)',
    border: 0,
    borderRadius: 20,
    boxShadow: '0 3px 5px 2px rgba(255, 230, 0, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
    marginTop: theme.spacing(2),
    '&:hover': {
        background: 'linear-gradient(45deg, #FFD100 30%, #FFC000 90%)',
        boxShadow: '0 5px 7px 2px rgba(255, 230, 0, .5)',
    },
}));
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        padding: theme.spacing(2),
        background: theme.palette.background.default,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
}));

const FieldList = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    padding: theme.spacing(2),
    height: 400,
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
    },
}));

const FieldItem = styled(ListItem)(({ theme, isDragging, isSelected }) => ({
    borderRadius: 8,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1, 2),
    transition: 'all 0.2s ease',
    backgroundColor: isDragging 
        ? theme.palette.action.hover 
        : isSelected 
            ? theme.palette.primary.light 
            : theme.palette.background.paper,
    boxShadow: isDragging ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateY(-2px)',
    },
}));

const ArrowButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    margin: theme.spacing(1),
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        transform: 'scale(1.1)',
    },
    '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
    },
}));
const ResizeHandle = styled('div')(({ theme }) => ({
    position: 'absolute',
    right: -5,
    top: 0,
    height: '100%',
    width: 10,
    cursor: 'col-resize',
    userSelect: 'none',
    touchAction: 'none',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));
const VideoTable = () => {
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
    const [video, setVideo] = useState(null);
    const [tags, setTags] = useState('');
    const [searchTags, setSearchTags] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [displayType, setDisplayType] = useState('table');
    const [statusFilter, setStatusFilter] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [rating, setRating] = useState(0);
    const currentDate = moment().format('YYYY-MM-DD');
    const [openUploadDrawer, setOpenUploadDrawer] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [openSettings, setOpenSettings] = useState(false);
    const [visibleFields, setVisibleFields] = useState([
        'title',
        'submitted_by',
        'submitted_on',
        'category',
        'department',
        'tags',
        'status',
        'actions'
    ]);
    const [hiddenFields, setHiddenFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [columnWidths, setColumnWidths] = useState({});
    const [resizing, setResizing] = useState(null);
    const tableRef = useRef(null);
    const [isResizing, setIsResizing] = useState(false);
    const resizingRef = useRef(null);

    const handleFieldClick = (field) => {
        setSelectedField(field === selectedField ? null : field);
      };

     
      useEffect(() => {
        const initialWidths = {};
        visibleFields.forEach((field) => {
            initialWidths[field] = 150; // Default width
        });
        setColumnWidths(initialWidths);
    }, [visibleFields]);



    
    const handleMouseMove = useCallback((e) => {
        if (resizing && tableRef.current) {
            const { left } = tableRef.current.getBoundingClientRect();
            const newWidth = Math.max(100, e.clientX - left);
            setColumnWidths(prev => ({
                ...prev,
                [resizing]: newWidth
            }));
            setResizeIndicatorPosition(e.clientX - left);
        }
    }, [resizing]);

   
    const handleMouseUp = useCallback(() => {
        setResizing(null);
        setResizeIndicatorPosition(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);


   
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const tasksResponse = await axiosInstance.get('api/videos/dashboard/');
                const categoriesResponse = await axiosInstance.get('/api/categories/');
                const departmentsResponse = await axiosInstance.get('/api/department-userwise/');

                setTasks(tasksResponse.data);
                setCategories(categoriesResponse.data);
                setDepartments(departmentsResponse.data);

                filterTasks(tasksResponse.data, statusFilter, filterDepartment, searchTags);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        filterTasks(tasks, statusFilter, filterDepartment, searchTags);
    }, [tasks, statusFilter, filterDepartment, searchTags]);

    const filterTasks = (tasks, status = '', department = '', tags = '') => {
        let filtered = [...tasks];

        if (status) {
            filtered = filtered.filter(task => task.status.toLowerCase() === status.toLowerCase());
        }

        if (tags) {
            const tagsArray = tags.split(' ').map(tag => tag.toLowerCase());
            filtered = filtered.filter(task =>
                tagsArray.some(tag =>
                    task.tags_name.some(taskTag => taskTag.toLowerCase().includes(tag))
                )
            );
        }

        if (department) {
            filtered = filtered.filter(task => task.department_name.toLowerCase() === department.toLowerCase());
        }

        setFilteredTasks(filtered);
    };
    const handleOpenSettings = () => {
        setOpenSettings(true);
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
    
   


    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const move = (source, destination, droppableSource, droppableDestination) => {
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        const [removed] = sourceClone.splice(droppableSource.index, 1);

        destClone.splice(droppableDestination.index, 0, removed);

        const result = {};
        result[droppableSource.droppableId] = sourceClone;
        result[droppableDestination.droppableId] = destClone;

        return result;
    };

    const getFieldName = (field) => {
        const fieldNames = {
            title: 'Title',
            submitted_by: 'Submitted By',
            submitted_on: 'Submitted On',
            category: 'Category',
            department: 'Department',
            tags: 'Tags',
            status: 'Status',
            actions: 'Actions'
        };
        return fieldNames[field] || field;
    };

    const handleCloseSettings = () => {
        setOpenSettings(false);
    };


    const handleOpenUploadDrawer = () => {
        setOpenUploadDrawer(true);
        resetUploadProgress();
    };

    const handleCloseUploadDrawer = () => {
        setOpenUploadDrawer(false);
        setTitle('');
        setCategory('');
        setDepartment('');
        setVideo(null);
        setTags('');
        resetUploadProgress(); 
    };

       const resetUploadProgress = () => {
        setUploadProgress(0);
    };
    const handleApprove = async () => {
        try {
            await axiosInstance.post('/api/videos/approve/', {
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

    useEffect(() => {
        return () => {
            if (isResizing) {
                document.body.style.cursor = 'default';
            }
        };
    }, [isResizing]);
    const handleResizeMove = useCallback((e) => {
        if (resizing) {
            const { field, startX, startWidth } = resizing;
            const diff = e.clientX - startX;
            const newWidth = Math.max(50, startWidth + diff);
            setColumnWidths(prev => ({
                ...prev,
                [field]: newWidth,
            }));
        }
    }, [resizing]);


    const handleResizeEnd = useCallback(() => {
        setResizing(null);
        setIsResizing(false);
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    }, [handleResizeMove]);

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [handleResizeMove, handleResizeEnd]);
    useEffect(() => {
        if (isResizing) {
            document.body.style.cursor = 'col-resize';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [isResizing]);

    const handleReject = async () => {
        try {
            await axiosInstance.post('/api/videos/reject/', {
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
    
    const handleRatingChange = (newRating, taskId) => {
        setRating(newRating);
        
        axiosInstance.patch(`api/videos/${taskId}/rate/`, { rating: newRating })
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

    const handleCloseUploadDialog = () => {
        setOpenUploadDialog(false);
        setTitle('');
        setCategory('');
        setDepartment('');
        setVideo(null);
        setTags('');
    };

    const handleUpload = () => {
        const maxFileSize = 50 * 1024 * 1024;
        
        if (title.trim() === '') {
            setSnackbarMessage('Title is required');
            setSnackbarOpen(true);
            return;
        }
    
        if (!video) {
            setSnackbarMessage('Please select a video to upload');
            setSnackbarOpen(true);
            return;
        }
    
        if (video.size > maxFileSize) {
            setSnackbarMessage('File size exceeds 50MB limit.');
            setSnackbarOpen(true);
            return;
        }
    
        if (!video.type.startsWith('video/')) {
            setSnackbarMessage('The selected file is not a video.');
            setSnackbarOpen(true);
            return;
        }
    
        if (tasks.some(task => task.title === title)) {
            setSnackbarMessage('Title is already used. Please use a different title.');
            setSnackbarOpen(true);
            return;
        }
        resetUploadProgress();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category_name', category);
        formData.append('department_name', department);
        if (tags !== null && tags !== '') {
            formData.append('tags', tags);
        }
        formData.append('video', video);
    
        axiosInstance.post('/api/videos/dashboard/upload/', formData, {
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
                id: response.data.video.id,
                title,
                rating: response.data.video.rating,
                status: 'Pending',
                category_name: category,
                tags_name: tags.split(',').map(tag => tag.trim()),
                file: response.data.video.video_url,
                department_name: department,
                submitted_by: userData.fullName, 
                submitted_on: currentDate 
            };
    
            setTasks([...tasks, newTask]);
            handleCloseUploadDrawer();
            filterTasks([...tasks, newTask]);
            setSnackbarMessage('Video uploaded successfully');
            setSnackbarOpen(true);
        })
        .catch(error => {
            console.error('Error uploading task:', error);
            setSnackbarMessage('Error uploading video');
            setSnackbarOpen(true);
            resetUploadProgress();
        });
    };
    const handleDisplayChange = (event, newDisplayType) => {
        setDisplayType(newDisplayType);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        filterTasks(tasks, status, filterDepartment, searchTags);
    };

    const handleDepartmentFilter = (departmentName) => {
        setFilterDepartment(departmentName === 'all' ? '' : departmentName);
        filterTasks(tasks, statusFilter, departmentName === 'all' ? '' : departmentName, searchTags);
    };

    const handleSearchTagsChange = (e) => {
        const newTags = e.target.value;
        setSearchTags(newTags);
        filterTasks(tasks, statusFilter, filterDepartment, newTags);
    };
    
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
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
                const videoIds = selectedTasks.map(task => task.id);
                
                if (videoIds.length === 0) {
                    console.error('No valid task IDs found.');
                    return;
                }
        
                axiosInstance.delete('/api/videos/delete/', {
                    data: { video_ids: videoIds }
                })
                .then(() => {
                    const remainingTasks = tasks.filter(t => !videoIds.includes(t.id));
                    setTasks(remainingTasks);
                    filterTasks(remainingTasks);
                    setSnackbarMessage('Videos deleted successfully');
                    setSnackbarOpen(true);
                })
                .catch(error => {
                    console.error('Error deleting Videos:', error);
                    setSnackbarMessage('Error deleting Videos');
                    setSnackbarOpen(true);
                });
            }
        });
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
          case 'tags':
            return task.tags_name.join(', ');
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
        MySwal.fire({
            title: task.title,
            html: (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {task.file ? (
                        <video 
                            src={`${BASE_URL}${task.file}`} 
                            controls
                            style={{ maxWidth: '100%', height: 'auto', marginBottom: '15px' }} 
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <p>No video available</p>
                    )}
                    {userRole === 'superadmin' || userRole === 'departmentadmin' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3>Rate this Video:</h3>
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

    const onDrop = useCallback((acceptedFiles) => {
        setVideo(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: 'video/*',
        maxSize: 50 * 1024 * 1024 // 50MB
    });

    return (
        <div>
            <Card className="video-table-card">
                <CardContent>
                
                <Grid container spacing={2} alignItems="center" wrap="nowrap">
    <Grid item xs={12} sm={4} md={3}>
        <TextField
            fullWidth
            label="Search Tags"
            variant="outlined"
            value={searchTags}
            onChange={handleSearchTagsChange}
            className="rounded-textfield"
            sx={{
                '& .MuiOutlinedInput-root': {
                    height: '32px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    padding: '0 10px',
                },
                '& .MuiInputLabel-root': {
                    fontSize: '0.875rem',
                    top: '-6px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8e44ad',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9b59b6',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8e44ad',
                },
            }}
        />
    </Grid>
    <Grid item xs={12} sm={4} md={3}>
        <FormControl fullWidth sx={{
            '& .MuiInputBase-root': {
                height: '32px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                padding: '0 10px',
            },
            '& .MuiInputLabel-root': {
                fontSize: '0.875rem',
                top: '-6px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#8e44ad',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9b59b6',
            },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#8e44ad',
            },
        }}>
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
    <Grid item xs={12} sm={4} md={6} container alignItems="center">
        <ToggleButtonGroup
            value={displayType}
            exclusive
            onChange={handleDisplayChange}
            size="small"
            sx={{
                height: '32px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                '& .MuiToggleButton-root': {
                    padding: '0 10px',
                    borderRadius: '8px',
                    borderColor: '#8e44ad',
                    '&.Mui-selected': {
                        backgroundColor: '#262b3b',
                        color: '#fff',
                    },
                    '&:hover': {
                        backgroundColor: '#9b59b6',
                    },
                },
            }}
        >
            <ToggleButton value="table"><TableViewIcon /></ToggleButton>
            <ToggleButton value="grid"><ViewModuleIcon /></ToggleButton>
        </ToggleButtonGroup>
    </Grid>
    <Grid item xs={12} sm={4} md={3} container justifyContent="flex-end" alignItems="center">
        {userRole === 'user' || userRole === 'divisionadmin' || userRole === 'subdivisionuser' || userRole === 'superadmin' ? (
            <Box display="flex" alignItems="center">
                <Button
                    variant="contained"
                    onClick={handleOpenUploadDrawer}
                    sx={{
                        height: '32px', // Same height as the search box
                        borderRadius: '8px', // Same border-radius as the search box
                        backgroundColor: '#FFE600',
                        color: '#262b3b',
                        padding: '0 16px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        minWidth: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        marginRight: '8px',
                        border: '1px solid transparent',
                        '&:hover': {
                            backgroundColor: '#FFE600',
                            borderColor: '#262b3b',
                            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    <UploadIcon sx={{ marginRight: '8px' }} />
                    Upload
                </Button>
                <ControlButton 
                    onClick={handleOpenSettings} 
                    sx={{ ml: '8px' }} // Adds space between the button and icon
                    startIcon={<SettingsIcon sx={{ color: 'black' }} />} 
                />
            </Box>
        ) : null}
    </Grid>
</Grid>




                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Box display="flex" sx={{ color: '#f4b400', textAlign: 'center' }}>
                            {['', 'Pending', 'Approved', 'Rejected'].map((status) => (
                                <Button
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    variant="outlined"
                                    sx={{
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: statusFilter === status ? '#ffffff' : '#FFE600',
                                        color: '#262b3b',
                                        padding: '0 16px',
                                        borderColor: statusFilter === status ? '#262b3b' : 'transparent',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        boxShadow: statusFilter === status ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        marginRight: '12px',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        minWidth: '120px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transform:statusFilter === status ?'translateY(-2px)' : '',
                                        '&:hover': {
                                            borderColor: '#262b3b',
                                            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                                            backgroundColor: statusFilter === status ? '#ffffff' : '#FFE600',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                >
                                    {status === '' ? 'All' : status}
                                </Button>
                            ))}
                        </Box>

                        {(userRole === 'superadmin' || userRole === 'departmentadmin') && (
                            <Box display="flex" sx={{ color: '#f4b400', textAlign: 'center' }}>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={handleApprove}
                                    disabled={selectedTasks.length === 0}
                                    sx={{
                                        height: '32px',
                                        borderRadius: '8px',
                                        borderColor: selectedTasks.length > 0 ? 'transparent' : '#262b3b',
                                        color: selectedTasks.length > 0 ? '#000000' : '#f4b400',
                                        backgroundColor: selectedTasks.length > 0 ? '#FFE600' : 'transparent',
                                        margin: '0 8px',
                                        padding: '0 16px',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        minWidth: '120px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        '&:hover': {
                                            backgroundColor: selectedTasks.length > 0 ? '#FFE600' : '#262b3b',
                                            borderColor: selectedTasks.length > 0 ? '#000000' : '#262b3b',
                                            color: selectedTasks.length > 0 ? '#000000' : '#f4b400',
                                            textDecoration: 'none',
                                            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                                            transform: 'translateY(-2px)',
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
                                        height: '32px',
                                        borderRadius: '8px',
                                        borderColor: selectedTasks.length > 0 ? 'transparent' : '#262b3b',
                                        color: selectedTasks.length > 0 ? '#000000' : '#f4b400',
                                        backgroundColor: selectedTasks.length > 0 ? '#FFE600' : 'transparent',
                                        margin: '0 2px 0 0',
                                        padding: '0 16px',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        minWidth: '120px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        '&:hover': {
                                            backgroundColor: selectedTasks.length > 0 ? '#FFE600' : '#262b3b',
                                            borderColor: selectedTasks.length > 0 ? '#000000' : '#262b3b',
                                            color: selectedTasks.length > 0 ? '#000000' : '#f4b400',
                                            textDecoration: 'none',
                                            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    Reject
                                </Button>
                            </Box>
                        )}
                    </Box>
                    {displayType === 'table' ? (
                <div style={{ overflowX: 'auto' }}>
                    <StyledTable ref={tableRef}>
                        <thead>
                            <tr>
                                <th style={{ width: 50 }}>Select</th>
                                {visibleFields.map((field) => (
                                    <th 
                                        key={field} 
                                        style={{ width: columnWidths[field] || 150 }}
                                    >
                                        {getFieldName(field)}
                                        <ResizeHandle
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
                    </StyledTable>
                
                </div>
            ) : (
                        <div className="task-grid">
                            <Box 
                                flex="1" 
                                display="flex" 
                                flexWrap="wrap" 
                                justifyContent="space-evenly"
                                gap="20px"
                            >
                                {filteredTasks.map(task => {
                                    const isSelected = selectedTasks.includes(task.id);
                                    return (
                                        <Card 
                                            key={task.id} 
                                            className="task-card"
                                            onClick={() => handleTaskSelection(task.id)}
                                            sx={{
                                                width: 250,
                                                height: 320,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                boxShadow: isSelected ? '0 8px 16px rgba(0, 0, 0, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                transform: isSelected ? 'scale(1.03)' : 'none',
                                                transition: 'transform 0.3s, box-shadow 0.3s',
                                                border: isSelected ? '2px solid #333' : '2px solid transparent',
                                                backgroundColor: isSelected ? '#e0f7fa' : '#fff',
                                                marginBottom: '20px',
                                                '&:hover': {
                                                    transform: 'scale(1.03)',
                                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                                },
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
                                                    component="video"
                                                    src={`${BASE_URL}${task.file}`}
                                                    alt={task.title}
                                                    controls
                                                    sx={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            </Box>
                                            <CardContent
                                                sx={{
                                                    padding: '16px',
                                                    textAlign: 'center',
                                                    background: '#fff', 
                                                }}
                                            >
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        marginBottom: '8px',
                                                        fontSize: '1.2rem',
                                                        color: '#333', 
                                                        transition: 'color 0.3s',
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
                                    );
                                })}
                            </Box>
                        </div>
                    )}
                </CardContent>
            </Card>
            <StyledDialog 
                open={openSettings}
                onClose={handleCloseSettings}
                maxWidth="md" 
                fullWidth
            >
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
                                        <FieldList {...provided.droppableProps} ref={provided.innerRef}>
                                            {visibleFields.map((field, index) => (
                                                <Draggable key={field} draggableId={field} index={index}>
                                                    {(provided, snapshot) => (
                                                        <FieldItem
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => handleFieldClick(field)}
                                                            isDragging={snapshot.isDragging}
                                                            isSelected={selectedField === field}
                                                        >
                                                            <ListItemIcon>
                                                                <DragIndicatorIcon />
                                                            </ListItemIcon>
                                                            <ListItemText primary={getFieldName(field)} />
                                                            <ListItemIcon>
                                                                <VisibilityIcon />
                                                            </ListItemIcon>
                                                        </FieldItem>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </FieldList>
                                    )}
                                </Droppable>
                            </Grid>
                            <Grid item xs={2} container direction="column" alignItems="center" justifyContent="center">
                                <ArrowButton 
                                    onClick={() => moveField('right')} 
                                    disabled={!selectedField || hiddenFields.includes(selectedField)}
                                >
                                    <ArrowForwardIcon />
                                </ArrowButton>
                                <ArrowButton 
                                    onClick={() => moveField('left')} 
                                    disabled={!selectedField || visibleFields.includes(selectedField)}
                                >
                                    <ArrowBackIcon />
                                </ArrowButton>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography variant="h6" gutterBottom>Hidden Fields</Typography>
                                <Droppable droppableId="hidden">
                                    {(provided) => (
                                        <FieldList {...provided.droppableProps} ref={provided.innerRef}>
                                            {hiddenFields.map((field, index) => (
                                                <Draggable key={field} draggableId={field} index={index}>
                                                    {(provided, snapshot) => (
                                                        <FieldItem
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => handleFieldClick(field)}
                                                            isDragging={snapshot.isDragging}
                                                            isSelected={selectedField === field}
                                                        >
                                                            <ListItemIcon>
                                                                <DragIndicatorIcon />
                                                            </ListItemIcon>
                                                            <ListItemText primary={getFieldName(field)} />
                                                            <ListItemIcon>
                                                                <VisibilityOffIcon />
                                                            </ListItemIcon>
                                                        </FieldItem>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </FieldList>
                                    )}
                                </Droppable>
                            </Grid>
                        </Grid>
                    </DragDropContext>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSettings} color="primary" variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </StyledDialog>

            <UploadDrawer
                anchor="right"
                open={openUploadDrawer}
                onClose={handleCloseUploadDrawer}
            >
                <Box sx={{ position: 'relative', height: '100%' }}>
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
                        Upload New Video
                    </Typography>
                    <DropzoneArea {...getRootProps()}>
                        <input {...getInputProps()} />
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#f4b400', mb: 2 }} />
                        {isDragActive ? (
                            <Typography>Drop the video file here...</Typography>
                        ) : (
                            <Typography>Drag and drop a video file here, or click to select</Typography>
                        )}
                    </DropzoneArea>
                    {video && (
                        <Typography variant="body2" gutterBottom>
                            Selected: {video.name}
                        </Typography>
                    )}
                    <TextField
                        margin="dense"
                        label="Title"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                                <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
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
                    <TextField
                        margin="dense"
                        label="Tags (comma separated)"
                        fullWidth
                        variant="outlined"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    {uploadProgress > 0 && (
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                            <Typography variant="body2" color="text.secondary" align="center">
                                {`${Math.round(uploadProgress)}%`}
                            </Typography>
                        </Box>
                    )}
                    <UploadButton
                        fullWidth
                        onClick={handleUpload}
                        disabled={!video || uploadProgress > 0}
                    >
                        Upload Video
                    </UploadButton>
                </Box>
            </UploadDrawer>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
            />
        </div>
    );
};

export default VideoTable;