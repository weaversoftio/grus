import { api } from "../utils/api"

const getList = async () => new Promise(async (resolve, reject) => {
    try {
        const response = await api.get('/pod/list')
        if( !response.data ) return reject()
        resolve(response.data)
    } catch (err) {
        reject(err)
    }
})

export const podsApi = {
    getList,
}