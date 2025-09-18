import axios from "axios";

const apiKey = process.env.REACT_APP_APIKEY;  
const baseUrl = process.env.REACT_APP_BASEURL; 

// Ambil daftar film populer
export const getMovieList = async () => {
    try {
        const response = await axios.get(`${baseUrl}/movie/popular?api_key=${apiKey}`);
        return response.data.results || [];
    } catch (err) {
        console.error("Error getMovieList:", err);
        return [];
    }
};

// Cari film berdasarkan query
export const searchMovie = async (q) => {
    if (!q) return [];
    try {
        const response = await axios.get(`${baseUrl}/search/movie?query=${q}&api_key=${apiKey}`);
        return response.data.results || [];
    } catch (err) {
        console.error("Error searchMovie:", err);
        return [];
    }
};

