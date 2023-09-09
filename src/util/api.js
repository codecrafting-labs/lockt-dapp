import { useAuthTokenInterceptor } from 'axios-jwt';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create();

const requestRefresh = async refreshToken => {
  const res = await axios.post(API_URL + '/auth/refresh_token', {
    token: refreshToken,
  });
  return {
    accessToken: res.data.access_token,
    refreshToken: res.data.refresh_token,
  };
};

useAuthTokenInterceptor(apiClient, { requestRefresh });

async function get(endpoint, params = {}) {
  const apiEndpoint = API_URL + endpoint;
  if (params !== {}) {
    return apiClient.get(apiEndpoint, { params: params });
  } else {
    return apiClient.get(apiEndpoint);
  }
}

async function post(endpoint, data, headers = {}) {
  return apiClient.post(API_URL + endpoint, data, headers);
}

const request = {
  get,
  post,
  delete: async endpoint => apiClient.delete(API_URL + endpoint),
};

export { request, API_URL };
