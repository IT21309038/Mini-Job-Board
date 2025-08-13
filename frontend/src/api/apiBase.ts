import axios, {AxiosError, InternalAxiosRequestConfig} from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Router from "next/router";

const BaseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
    baseURL: BaseURL,
})

export const apiPrivate = axios.create({
    baseURL: BaseURL,
});

apiPrivate.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        toast.error("Error in request");
        return Promise.reject(error);
    }
)
