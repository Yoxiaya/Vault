import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import Convert from './convert';

// 定义 Convert 的方法类型
type ConvertMethodName = keyof Convert;

interface RequsestConfig extends AxiosRequestConfig {
	convert?: ConvertMethodName;
}

interface ResponseConfig extends AxiosResponse {
	config: AxiosResponse['config'] & {
		convert?: ConvertMethodName;
	};
}
interface customAxiosResponse {
	code: number;
	data: any;
}
const convert = new Convert();
const axiosInstance = axios.create({
	timeout: 30000,
	baseURL: 'https://vault.yoxiaya.com',
	headers: {
		'Content-Type': 'application/json',
	},
});

axiosInstance.interceptors.request.use((config) => {
	return config;
});
axiosInstance.interceptors.response.use(
	(response: ResponseConfig) => {
		if (response.config.convert) {
			const method = response.config.convert;
			return convert[method](response.data);
		}

		return response.data;
	},
	(error) => {
		console.log('请求出错', error);
		return Promise.reject(error);
	},
);
const request = (url: string, config: RequsestConfig): Promise<customAxiosResponse> => {
	return axiosInstance(url, config);
};
export default request;
