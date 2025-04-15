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

const update = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.put(`/config/cluster/update`, data)
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

const getNodeConfig = async (clusterName) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/config/cluster/node?cluster_name=${encodeURIComponent(clusterName)}`)
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const updateNodeConfig = async (clusterName, data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.put(`/config/cluster/nodes/edit`, { cluster_name: clusterName, updated_config: data })
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const getPlaybookConfigs = async () => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/config/playbooks/list`)
        if (!response.data) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const updatePlaybookConfig = async ({name, data}) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.put(`/config/playbooks/update`, {filename: name, content: data})
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
    update,
    uploadSshkey,
    remove,
    login,
    verify,
    enableCheckpointing,
    installRunC,
    getStatistics,
    getNodeConfig,
    updateNodeConfig,
    getPlaybookConfigs,
    updatePlaybookConfig
}