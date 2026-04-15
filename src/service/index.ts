import Convert from './convert';

type ConvertMethodName = keyof Convert;

interface RequestConfig {
	method?: string;
	data?: any;
	headers?: Record<string, string>;
	convert?: ConvertMethodName;
}

interface CustomResponse {
	code: number;
	data: any;
}

const converts = new Convert();
const baseURL = 'https://vault.yoxiaya.com';

const request = async (url: string, config: RequestConfig = {}): Promise<CustomResponse> => {
	const {
		method = 'GET',
		data,
		headers = {
			'Content-Type': 'application/json',
		},
		convert,
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

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const responseData = await response.json();

		// 处理转换
		if (convert) {
			return (converts as any)[convert](responseData);
		}

		return responseData;
	} catch (error) {
		console.log('请求出错', error);
		throw error;
	}
};

export default request;
