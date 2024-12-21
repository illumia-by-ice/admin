import axios from "axios";

const api = axios.create({
    baseURL: "https://illumiacityempire.com/api/api/"
})

export default api;