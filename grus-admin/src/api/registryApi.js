import { api } from "../utils/api"

const create = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/config/registry/create`, data)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const update = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.put(`/config/registry/update`, data)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const getList = async () => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/config/registry/list`)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const remove = async (name) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.delete(`/config/registry/delete`, { data: { name } })
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

export const registryApi = {
    getList,
    create,
    update,
    remove,
}