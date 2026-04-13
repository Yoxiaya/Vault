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
