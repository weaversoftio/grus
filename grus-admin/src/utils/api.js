import axios from "axios";
import { getCookie, removeCookie } from "./cookies";

const config = window.ENV

export const api = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    // headers: {
    //     "ngrok-skip-browser-warning":"any"
    // }
})

api.interceptors.request.use( config => {
    const token = getCookie('token')
    if (!!token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    response => response, 
    error => {
      if (error.response && error.response.status === 401) {
        removeCookie('token')
      }
      return Promise.reject(error);
    }
  );
