import { api } from "../utils/api"
export const userApi = {
  login: async (data) => {
    return await api.post(`/config/user/login`, data);
  },
  create: async (data) => {
    return await api.post(`/config/user/create`, data);
  },
  update: async (data) => {
    return await api.put(`/config/user/update`, data);
  },
  verify: async () => {
    return await api.post(`/config/user/verify`);
  },
  getList: async () => {
    return await api.get(`/config/user/list`);
  },
  remove: async (name) => {
    return await api.delete(`/config/user/delete`, { data: { username: name } });
  },
};