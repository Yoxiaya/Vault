import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventBus, EventName, isTokenExpired } from '@/utils';

interface RequestConfig {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	data?: unknown;
	headers?: Record<string, string>;
	auth?: boolean;
}

export interface ApiResponse<T = never> {
	success: boolean;
	message?: string;
	data?: T;
}

export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
		public readonly payload?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

const baseURL = 'https://vault.yoxiaya.com';

let isRedirecting = false;

const notifyTokenExpired = () => {
	if (isRedirecting) return;
	isRedirecting = true;
	eventBus.emit(EventName.TOKEN_EXPIRED);
	eventBus.emit(EventName.SHOW_TOAST, { type: 'error', title: '登录已过期', message: '请重新登录' });
	setTimeout(() => {
		isRedirecting = false;
	}, 1000);
};

const request = async <T = never>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> => {
	const { method = 'GET', data, headers = {}, auth = true } = config;
	const token = auth ? (await AsyncStorage.getItem('token')) || '' : '';
	if (auth && token && isTokenExpired(token)) {
		notifyTokenExpired();
		throw new Error('登录已过期，请重新登录');
	}

	const requestHeaders: Record<string, string> = { ...headers };
	if (auth && token) requestHeaders.Authorization = `Bearer ${token}`;
	if (!(data instanceof FormData)) requestHeaders['Content-Type'] = 'application/json';

	const response = await fetch(`${baseURL}${url}`, {
		method,
		headers: requestHeaders,
		body: data == null ? undefined : data instanceof FormData ? data : JSON.stringify(data),
	});
	const contentType = response.headers.get('content-type') || '';
	const payload = contentType.includes('application/json') ? await response.json() : undefined;

	if (response.status === 401 && auth) notifyTokenExpired();
	if (!response.ok) throw new ApiError(payload?.message || `请求失败 (${response.status})`, response.status, payload);
	return payload as ApiResponse<T>;
};

export default request;
