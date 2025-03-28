import { api } from "../utils/api"

const create = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/config/secret/create`, data)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const update = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.put(`/config/secret/update`, data)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const getList = async () => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get(`/config/secret/list`)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

const remove = async (name) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.delete(`/config/secret/delete`, { data: { name } })
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

export const secretApi = {
    getList,
    create,
    update,
    remove,
}