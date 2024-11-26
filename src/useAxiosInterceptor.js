import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const useAxiosInterceptor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response, // Pass through successful responses
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token is expired or invalid, logout and redirect to login page
          localStorage.removeItem('token'); // Clear the token
          navigate('/'); // Redirect to login page
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptor when the component is unmounted
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);
};

export default useAxiosInterceptor;
