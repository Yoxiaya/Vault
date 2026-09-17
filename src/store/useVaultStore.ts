import { create } from 'zustand';
import { createVault, rewrapVaultKey, unlockVault, type VaultMetadata } from 'vault-cryption';
import { createVaultMetadata, getAccounts, getVaultMetadata, updateVaultWrappedKey } from '../service/api';

interface VaultStore {
	dek: Uint8Array | null;
	metadata: VaultMetadata | null;
	initializing: boolean;
	initializeWithPassword: (masterPassword: string) => Promise<void>;
	changeMasterPassword: (newMasterPassword: string) => Promise<void>;
	requireDek: () => Uint8Array;
	lock: () => void;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
	dek: null,
	metadata: null,
	initializing: false,
	initializeWithPassword: async (masterPassword) => {
		set({ initializing: true });
		try {
			const metadataResponse = await getVaultMetadata();
			if (!metadataResponse.success) throw new Error(metadataResponse.message || '无法加载密码库元数据');
			if (metadataResponse.data) {
				const dek = await unlockVault(masterPassword, metadataResponse.data);
				set({ dek, metadata: metadataResponse.data });
				return;
			}
			const accountsResponse = await getAccounts();
			if (!accountsResponse.success || !accountsResponse.data)
				throw new Error(accountsResponse.message || '无法检查现有账号');
			if (accountsResponse.data.length > 0) throw new Error('密码库缺少加密元数据');
			const created = await createVault(masterPassword);
			const result = await createVaultMetadata(created.metadata);
			if (!result.success) throw new Error(result.message || '初始化密码库失败');
			set({ dek: created.dek, metadata: result.data ?? created.metadata });
		} catch (error) {
			get().lock();
			throw error;
		} finally {
			set({ initializing: false });
		}
	},
	changeMasterPassword: async (newMasterPassword) => {
		const updated = await rewrapVaultKey(get().requireDek(), newMasterPassword);
		const response = await updateVaultWrappedKey(updated);
		if (!response.success) throw new Error(response.message || '更新主密码失败');
		set({ metadata: response.data ?? updated });
	},
	requireDek: () => {
		const dek = get().dek;
		if (!dek) throw new Error('密码库尚未解锁');
		return dek;
	},
	lock: () => {
		get().dek?.fill(0);
		set({ dek: null, metadata: null });
	},
}));
