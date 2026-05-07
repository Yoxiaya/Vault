import { UploadAccount } from '../../types';
import request from '../index';

/**
 * 获取账户列表
 */
export const getAccounts = () => {
	return request('/vault-accounts', { method: 'get' });
};

/**
 * 添加新账户
 * @param account - 账户信息
 */
export const addAccount = (account: UploadAccount) => {
	return request('/vault-accounts', { method: 'post', data: account });
};

/**
 * 更新账户信息
 * @param id - 账户ID
 * @param account - 更新后的账户信息
 */
export const updateAccount = (id: string, account: UploadAccount) => {
	return request(`/vault-accounts/${id}`, { method: 'put', data: account });
};

/**
 * 删除账户
 * @param id - 账户ID
 */
export const deleteAccount = (id: string) => {
	return request(`/vault-accounts/${id}`, { method: 'delete' });
};

/**
 * 上传图片
 * @param file - 图片文件
 */
export const uploadImage = (file: FormData) => {
	return request('/vault-accounts/upload-image', {
		method: 'post',
		data: file,
	});
};

/**
 * 删除图片
 * @param data - 包含图片URL的对象
 */
export const deleteImage = (data: { url: string }) => {
	return request('/vault-accounts/delete-image', { method: 'post', data });
};

/**
 * 用户登录
 * @param data - 登录信息（账户名和密码）
 */
export const login = (data: { account: string; password: string }): Promise<any> => {
	return request('/auth/login', { method: 'post', data });
};

/**
 * 用户注册
 * @param data - 注册信息（用户名、邮箱、密码）
 */
export const register = (data: { username: string; email: string; password: string }) => {
	return request('/auth/register', { method: 'post', data });
};
/**
 * 获取用户信息
 */
export const getUserInfo = () => {
	return request('/user/profile', { method: 'get' });
};
/**
 * 上传图片
 * @param file - 图片文件
 */
export const uploadProfileAvatar = (file: FormData) => {
	return request('/user/updateAvatar', {
		method: 'post',
		data: file,
	});
};

/**
 * 更新用户信息
 * @param data - 更新后的用户信息
 */
export const updateUserInfo = (data: { profileName: string }) => {
	return request('/user/updateProfile', { method: 'post', data });
};
