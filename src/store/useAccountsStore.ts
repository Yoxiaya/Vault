import { create } from 'zustand';
import { getAccounts } from '../service/api';
import { Account } from '../type';

interface AccountsStore {
	accounts: Account[];
	loading: boolean;
	fetchAccounts: () => Promise<void>;
	getAccountDetailById: (id: string | number) => Account | undefined;
}

export const useAccountsStore = create<AccountsStore>((set, get) => ({
	accounts: [],
	loading: false,
	fetchAccounts: async () => {
		set({ loading: true });
		try {
			const res = await getAccounts();
			set({ accounts: res.data || [] });
		} finally {
			set({ loading: false });
		}
	},
	getAccountDetailById: (id: string | number) => {
		const { accounts } = get();
		return accounts.find((a) => String(a.id) === String(id));
	},
}));
