
import axios from 'axios'

const api = axios.create({

    baseURL : 'http://localhost:8000/'

})


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        
        if (token){
            config.headers.Authorizaion = `Bearer ${token}`
        }

        else{
            return Promise.reject(errors)
        }
    }
)