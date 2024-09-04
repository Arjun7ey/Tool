import axios from 'axios';

const BASE_URL = 'http://localhost:8000';  // Replace with your backend URL

const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/csrf_cookie/`);
    return response.data.csrftoken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

const uploadImage = async (formData) => {
  try {
    const csrfToken = await fetchCsrfToken();
    if (!csrfToken) {
      console.error('CSRF token not available.');
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrfToken,
      },
    };

    const response = await axios.post(`${BASE_URL}/api/dashboard/upload/`, formData, config);
    return response.data;  // Assuming your API returns some data on successful upload
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;  // Propagate the error to handle it elsewhere
  }
};

export { uploadImage };
