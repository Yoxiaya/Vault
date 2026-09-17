import { create } from 'zustand';
import { decryptRecord, encryptRecord } from 'vault-cryption';
import {
	addAccount as addAccountRequest,
	deleteAccount as deleteAccountRequest,
	getAccounts,
	updateAccount as updateAccountRequest,
	uploadAccountLogo as uploadAccountLogoRequest,
	type AccountPayload,
} from '../service/api';
import { Account, AccountSecret, EncryptedAccountResponse } from '../type';
import { useVaultStore } from './useVaultStore';

const normalizeAccount = (raw: Record<string, any>): Account => ({
	id: Number(raw.id ?? raw._id ?? 0),
	appName: raw.appName ?? raw.app_name ?? raw.name ?? '',
	username: raw.username ?? raw.userName ?? raw.account ?? '',
	email: raw.email ?? null,
	password: raw.password ?? '',
	webSite: raw.webSite ?? raw.web_site ?? raw.website ?? raw.url ?? null,
	categoryId: raw.categoryId ?? raw.category_id ?? raw.category ?? null,
	logoUrl: raw.logoUrl ?? raw.logo_url ?? null,
	logoImageId: raw.logoImageId ?? raw.logo_image_id ?? null,
	lastUpdated: raw.lastUpdated ?? raw.last_updated ?? raw.updatedAt ?? raw.updated_at ?? null,
	twoFactorEnabled: Boolean(raw.twoFactorEnabled ?? raw.two_factor_enabled ?? raw.twoFactor ?? false),
	description: raw.description ?? raw.desc ?? raw.note ?? null,
	userId: Number(raw.userId ?? raw.user_id ?? 0),
});

const decryptAccount = async (raw: Record<string, any>): Promise<Account> => {
	if (!raw.encryptedData) return normalizeAccount(raw);
	const secret = await decryptRecord<AccountSecret>(useVaultStore.getState().requireDek(), raw.encryptedData);
	return normalizeAccount({ ...raw, ...secret });
};

const encryptAccountPayload = async (account: AccountPayload) => ({
	appName: account.appName,
	categoryId: account.categoryId ?? null,
	lastUpdated: account.lastUpdated,
	encryptedData: await encryptRecord(useVaultStore.getState().requireDek(), {
		username: account.username,
		password: account.password,
		email: account.email,
		webSite: account.webSite,
		twoFactorEnabled: account.twoFactorEnabled,
		description: account.description,
	} satisfies AccountSecret),
});

interface AccountsStore {
	accounts: Account[];
	loading: boolean;
	fetchAccounts: () => Promise<void>;
	clearAccounts: () => void;
	addAccount: (account: AccountPayload) => Promise<Account>;
	updateAccount: (id: string | number, account: AccountPayload) => Promise<Account>;
	deleteAccount: (id: string | number) => Promise<void>;
	uploadAccountLogo: (id: string | number, data: FormData) => Promise<string>;
	getAccountDetailById: (id: string | number) => Account | undefined;
}

export const useAccountsStore = create<AccountsStore>((set, get) => ({
	accounts: [],
	loading: false,
	fetchAccounts: async () => {
		set({ loading: true });
		try {
			const response = await getAccounts();
			if (!response.success || !response.data) throw new Error(response.message || '获取账号失败');
			const accounts = await Promise.all(
				response.data.map((item) => decryptAccount(item as EncryptedAccountResponse & Record<string, any>))
			);
			set({ accounts });
		} finally {
			set({ loading: false });
		}
	},
	clearAccounts: () => set({ accounts: [] }),
	addAccount: async (account) => {
		const response = await addAccountRequest(await encryptAccountPayload(account));
		if (!response.success || !response.data) throw new Error(response.message || '创建账号失败');
		const created = await decryptAccount(response.data as EncryptedAccountResponse & Record<string, any>);
		set({ accounts: [...get().accounts, created] });
		return created;
	},
	updateAccount: async (id, account) => {
		const response = await updateAccountRequest(id, await encryptAccountPayload(account));
		if (!response.success || !response.data) throw new Error(response.message || '更新账号失败');
		const updated = await decryptAccount(response.data as EncryptedAccountResponse & Record<string, any>);
		set({ accounts: get().accounts.map((item) => (String(item.id) === String(id) ? updated : item)) });
		return updated;
	},
	deleteAccount: async (id) => {
		const response = await deleteAccountRequest(id);
		if (!response.success) throw new Error(response.message || '删除账号失败');
		set({ accounts: get().accounts.filter((item) => String(item.id) !== String(id)) });
	},
	uploadAccountLogo: async (id, data) => {
		const response = await uploadAccountLogoRequest(id, data);
		const logoUrl = response.data?.logoUrl;
		if (!response.success || !logoUrl) throw new Error(response.message || '上传图标失败');
		set({ accounts: get().accounts.map((item) => (String(item.id) === String(id) ? { ...item, logoUrl } : item)) });
		return logoUrl;
	},
	getAccountDetailById: (id) => get().accounts.find((account) => String(account.id) === String(id)),
}));
