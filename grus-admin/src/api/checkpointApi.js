import { api } from "../utils/api"

const getById = async (checkpoint_id) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/checkpoints/${checkpoint_id}`)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const getList = async () => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/checkpoint/list`)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const createCheckpointCriCtl = async () => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/checkpoint/crictl/checkpoint`)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const createCheckpointKubelet = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/checkpoint/kubelet/checkpoint`, data)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const runCheckpointctl = async (pod_name, checkpoint_name) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/checkpoint/checkpointctl`, { pod_name, checkpoint_name })
        if( !response ) return reject()
        resolve(response.status)
    } catch (err) {
        reject(err)
    }
})

const getCheckpointctlLogs = async (pod_name, checkpoint_name) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/checkpoint/checkpointctl/information?pod_name=${pod_name}&checkpoint_name=${checkpoint_name}`)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const pushCheckpoint = async (data) => new Promise(async (resolve, reject) => {
    try {
        if (!data?.username) return reject("Username is missing")
        const response = await api.post(`/registry/create_and_push_checkpoint_container`, data)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const scanCheckpoint = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/checkpoint/analyze/volatility`, data)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const getScanResults = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/checkpoint/analyze/volatility/results?pod_name=${data.pod_name}&checkpoint_name=${data.checkpoint_name}`)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

export const checkpointApi = {
    getById,
    getList,
    createCheckpointCriCtl,
    createCheckpointKubelet,
    runCheckpointctl,
    getCheckpointctlLogs,
    pushCheckpoint,
    scanCheckpoint,
    getScanResults

}