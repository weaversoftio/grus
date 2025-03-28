import { api } from "../utils/api"

const login = async (data) => new Promise(async (resolve, reject) => {
    try {
        const response = await api.post(`/registry/login`, data)
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})


export const registryApi = {
    login
}