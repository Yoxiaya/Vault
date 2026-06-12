import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventBus, EventName } from '@/utils';

interface RequestConfig {
	method?: string;
	data?: any;
	headers?: Record<string, string>;
}

interface CustomResponse {
	code: number;
	data: any;
	success: boolean;
}

const baseURL = 'https://vault.yoxiaya.com';

let isRedirecting = false;

const request = async (url: string, config: RequestConfig = {}): Promise<CustomResponse> => {
	const token = (await AsyncStorage.getItem('token')) || '';

	const {
		method = 'GET',
		data,
		headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	} = config;

	const fullUrl = `${baseURL}${url}`;
	const fetchOptions: RequestInit = {
		method,
		headers: headers as Record<string, string>,
	};

	// 处理请求体
	if (data) {
		// 检查是否是 FormData
		if (data instanceof FormData) {
			// FormData 不需要设置 Content-Type，浏览器会自动设置
			const headersObj = fetchOptions.headers as Record<string, string>;
			if (headersObj) {
				delete headersObj['Content-Type'];
			}
			fetchOptions.body = data;
		} else {
			// 其他情况转换为 JSON
			fetchOptions.body = JSON.stringify(data);
		}
	}

	try {
		const response = await fetch(fullUrl, fetchOptions);

		// 处理401
		if (response.status === 401 && !isRedirecting) {
			isRedirecting = true;

			eventBus.emit(EventName.TOKEN_EXPIRED);
			setTimeout(() => {
				isRedirecting = false;
			}, 1000);
			eventBus.emit(EventName.SHOW_TOAST, { type: 'error', title: '登录已过期', message: '请重新登录' });
			throw new Error('登录已过期，请重新登录');
		}

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const responseData = await response.json();

		return responseData;
	} catch (error) {
		console.log('请求出错', error);
		throw error;
	}
};

export default request;
