import { create } from 'zustand';
import { createVault, rewrapVaultKey, unlockVault, type VaultMetadata } from 'vault-cryption';
import { createVaultMetadata, getAccounts, getVaultMetadata, updateVaultWrappedKey } from '../service/api';

interface VaultStore {
	dek: Uint8Array | null;
	metadata: VaultMetadata | null;
	initializing: boolean;
	initializingPhase: 'idle' | 'loading' | 'deriving' | 'saving';
	initializeWithPassword: (masterPassword: string) => Promise<void>;
	changeMasterPassword: (newMasterPassword: string) => Promise<void>;
	requireDek: () => Uint8Array;
	lock: () => void;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
	dek: null,
	metadata: null,
	initializing: false,
	initializingPhase: 'idle',
	initializeWithPassword: async (masterPassword) => {
		set({ initializing: true, initializingPhase: 'loading' });
		try {
			const metadataResponse = await getVaultMetadata();
			if (!metadataResponse.success) throw new Error(metadataResponse.message || '无法加载密码库元数据');
			if (metadataResponse.data) {
				set({ initializingPhase: 'deriving' });
				const dek = await unlockVault(masterPassword, metadataResponse.data);
				set({ dek, metadata: metadataResponse.data });
				return;
			}
			// On first use, overlap the legacy-account check with the expensive local
			// Argon2id key derivation instead of waiting for them one after another.
			const [accountsResponse, created] = await Promise.all([
				getAccounts(),
				(async () => {
					set({ initializingPhase: 'deriving' });
					return createVault(masterPassword);
				})(),
			]);
			if (!accountsResponse.success || !accountsResponse.data)
				throw new Error(accountsResponse.message || '无法检查现有账号');
			if (accountsResponse.data.length > 0) throw new Error('密码库缺少加密元数据');
			set({ initializingPhase: 'saving' });
			const result = await createVaultMetadata(created.metadata);
			if (!result.success) throw new Error(result.message || '初始化密码库失败');
			set({ dek: created.dek, metadata: result.data ?? created.metadata });
		} catch (error) {
			get().lock();
			throw error;
		} finally {
			set({ initializing: false, initializingPhase: 'idle' });
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
