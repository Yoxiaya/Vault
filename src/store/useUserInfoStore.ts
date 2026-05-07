import { create } from 'zustand';
import { getUserInfo, updateUserInfo } from '../service/api';

interface UserInfo {
	profileName: string;
	phoneNumber: string;
	profileAvatar: string;
}

export type UserInfoStore = {
	userInfo: UserInfo;
	loading: boolean;
	fetchUserInfo: () => Promise<void>;
	updateUserInfo: (userInfo: Partial<UserInfo>) => Promise<void>;
};

export const useUserInfoStore = create<UserInfoStore>((set, get) => ({
	userInfo: {} as UserInfo,
	loading: false,
	fetchUserInfo: async () => {
		set({ loading: true });
		const res = await getUserInfo();
		set({ userInfo: res.data, loading: false });
	},
	updateUserInfo: async (data: Partial<UserInfo>) => {
		const { userInfo } = get();
		set({ loading: true });
		const res = await updateUserInfo(userInfo as UserInfo);
		if (res.success) {
			set({ userInfo: { ...userInfo, ...data } });
		}
		set({ loading: false });
	},
}));
