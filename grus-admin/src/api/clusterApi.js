import { api } from "../utils/api"

const getById = async (checkpoint_id) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/checkpoints/${checkpoint_id}`)
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const getList = async () => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/config/cluster/list`)
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const create = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/config/cluster/create`, data)
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const uploadSshkey = async (clusterName, formData) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/config/cluster/nodes/upload-ssh-key?cluster_name=${encodeURIComponent(clusterName)}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const remove = async (name) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.delete(`/config/cluster/delete`, { data: { name } })
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const login = async (cluster_config_name) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/kubectl/login`, { cluster_config_name })
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const verify = async (clusterName) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/cluster/verify_checkpointing`, { clusterName })
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const enableCheckpointing = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/cluster/enable_checkpointing`, data)
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const installRunC = async (clusterName) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/cluster/install_runc`, { clusterName })
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const getStatistics = async () => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/cluster/statistics`)
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})


export const clusterApi = {
    getById,
    getList,
    create,
    uploadSshkey,
    remove,
    login,
    verify,
    enableCheckpointing,
    installRunC,
    getStatistics
}