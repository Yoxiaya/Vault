import { UploadAccount } from '../../types';
import request from '../index';

export const getAccounts = () => {
	return request('/vault-accounts', { method: 'get' });
};

export const addAccount = (account: UploadAccount) => {
	return request('/vault-accounts', { method: 'post', data: account });
};
export const updateAccount = (id: string, account: UploadAccount) => {
	return request(`/vault-accounts/${id}`, { method: 'put', data: account });
};

export const deleteAccount = (id: string) => {
	return request(`/vault-accounts/${id}`, { method: 'delete' });
};

export const uploadImage = (file: FormData) => {
	return request('/vault-accounts/upload-image', {
		method: 'post',
		data: file,
	});
};
export const deleteImage = (data: FormData) => {
	return request('/vault-accounts/delete-image', { method: 'post', data });
};
export const login = (data: { account: string; password: string }): Promise<any> => {
	return request('/auth/login', { method: 'post', data });
};
export const register = (data: { username: string; email: string; password: string }) => {
	return request('/auth/register', { method: 'post', data });
};
