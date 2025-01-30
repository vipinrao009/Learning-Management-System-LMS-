// import axios from "axios";

// // const BASE_URL = "https://deployment-6zkz.onrender.com/api/v1"
// const BASE_URL = "http://localhost:3000/api/v1"

// const axiosInstance = axios.create();

// axiosInstance.defaults.baseURL = BASE_URL

// axiosInstance.defaults.withCredentials = true

// export default axiosInstance

import axios from "axios";

// const BASE_URL = "https://deployment-6zkz.onrender.com/api/v1";
const BASE_URL = "http://localhost:3000/api/v1"

const axiosInstance = axios.create({
    baseURL: BASE_URL,   // ✅ Set base URL correctly
    withCredentials: true, // ✅ Ensures cookies are always included
});

export default axiosInstance;