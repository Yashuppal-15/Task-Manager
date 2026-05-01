import api from "../api/axios";

export const createProject = (data) => api.post("/api/projects", data);
export const getAllProjects = () => api.get("/api/projects");
export const getProjectById = (id) => api.get(`/api/projects/${id}`);
export const updateProject = (id, data) => api.put(`/api/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/api/projects/${id}`);
export const addMember = (projectId, userId) => api.post(`/api/projects/${projectId}/members/${userId}`);
export const removeMember = (projectId, userId) => api.delete(`/api/projects/${projectId}/members/${userId}`);
export const getMembers = (projectId) => api.get(`/api/projects/${projectId}/members`);