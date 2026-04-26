import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getChallenges = () => API.get('/challenges');
export const getChallengeById = (id) => API.get(`/challenges/${id}`);
export const getMCQs = (category) => API.get(`/mcqs?category=${category}`);
export const submitQuiz = (answers) => API.post('/mcqs/submit', { answers });
export const submitCode = (data) => API.post('/submissions', data);
export const getMySubmissions = () => API.get('/submissions/my');
export const getLeaderboard = () => API.get('/submissions/leaderboard');