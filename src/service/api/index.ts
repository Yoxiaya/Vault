import request, { ApiResponse } from '../index';
import { Account, AccountCategory, CategoryColor, CategoryIcon } from '../../type';

export interface PublicUser {
	id: number;
	username: string;
	email: string;
}
export interface Profile {
	id: number;
	userId: number;
	profileName: string;
	profileAvatar: string | null;
	phoneNumber: string | null;
}
export type AccountPayload = Pick<Account, 'appName' | 'username' | 'password'> &
	Partial<
		Pick<
			Account,
			'email' | 'webSite' | 'categoryId' | 'logoUrl' | 'lastUpdated' | 'twoFactorEnabled' | 'description'
		>
	>;
export interface CategoryPayload {
	name: string;
	icon: CategoryIcon;
	color: CategoryColor;
}

export const getAccounts = (): Promise<ApiResponse<Account[]>> => request('/vault-accounts');
export const getAccount = (id: string | number): Promise<ApiResponse<Account>> => request(`/vault-accounts/${id}`);
export const addAccount = (data: AccountPayload): Promise<ApiResponse> =>
	request('/vault-accounts', { method: 'POST', data });
export const updateAccount = (id: string | number, data: Partial<AccountPayload>): Promise<ApiResponse> =>
	request(`/vault-accounts/${id}`, { method: 'PUT', data });
export const deleteAccount = (id: string | number): Promise<ApiResponse> =>
	request(`/vault-accounts/${id}`, { method: 'DELETE' });
export const uploadAccountLogo = (id: string | number, data: FormData): Promise<ApiResponse<{ logoUrl: string }>> =>
	request(`/vault-accounts/${id}/image`, { method: 'POST', data });
export const uploadImage = (data: FormData): Promise<ApiResponse<{ url: string }>> =>
	request('/images', { method: 'POST', data });

export const getCategories = (): Promise<ApiResponse<AccountCategory[]>> => request('/vault-categories');
export const createCategory = (data: CategoryPayload): Promise<ApiResponse<AccountCategory>> =>
	request('/vault-categories', { method: 'POST', data });
export const updateCategory = (id: string, data: Partial<CategoryPayload>): Promise<ApiResponse<AccountCategory>> =>
	request(`/vault-categories/${id}`, { method: 'PATCH', data });
export const reorderCategories = (categoryIds: string[]): Promise<ApiResponse> =>
	request('/vault-categories/reorder', { method: 'PUT', data: { categoryIds } });
export const deleteCategory = (
	id: string,
	moveToCategoryId: string | null
): Promise<ApiResponse<{ movedAccountCount: number }>> =>
	request(`/vault-categories/${id}`, { method: 'DELETE', data: { moveToCategoryId } });

export const login = (data: {
	account: string;
	password: string;
	clientType?: 'app' | 'web';
}): Promise<ApiResponse<{ token: string; user: PublicUser }>> =>
	request('/auth/login', { method: 'POST', data, auth: false });
export const register = (data: {
	username: string;
	password: string;
	email: string;
	code: string;
}): Promise<ApiResponse> => request('/auth/register', { method: 'POST', data, auth: false });
export const sendVerifyCode = (data: { email: string }): Promise<ApiResponse> =>
	request('/auth/send-code', { method: 'POST', data, auth: false });

export const getUserInfo = (): Promise<ApiResponse<Profile | null>> => request('/users/me/profile');
export const updateUserInfo = (data: {
	profileName?: string;
	profileAvatar?: string | null;
	phoneNumber?: string | null;
}): Promise<ApiResponse> => request('/users/me/profile', { method: 'PATCH', data });
export const uploadProfileAvatar = (data: FormData): Promise<ApiResponse<string>> =>
	request('/users/me/avatar', { method: 'PUT', data });
