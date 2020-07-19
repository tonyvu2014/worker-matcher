const axios = require('axios')

const api_base_url = process.env.API_BASE_URL || 'http://test.swipejobs.com/api'
const GET_WORKERS_API = `${api_base_url}/workers`

exports.getWorker = async (id) => {
    try {
        const response = await axios.get(GET_WORKERS_API)
        const workers = response.data
        return workers.find(w => w.guid === id)
    } catch (error) {
        console.log(error)
    }
}