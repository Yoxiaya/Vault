import { create } from 'zustand';
import { getAccounts } from '../service/api';
import { Account } from '../types';

interface AccountsStore {
	accounts: Account[];
	loading: boolean;
	fetchAccounts: () => Promise<void>;
	getAccountDetailById: (id: string) => Account | undefined;
}

export const useAccountsStore = create<AccountsStore>((set, get) => ({
	accounts: [],
	loading: false,
	fetchAccounts: async () => {
		set({ loading: true });
		const res = await getAccounts();
		set({ accounts: res.data, loading: false });
	},
	getAccountDetailById: (id: string) => {
		const { accounts } = get();
		return accounts.find((a) => a.id === id);
	},
}));
