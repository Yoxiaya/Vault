import { create } from 'zustand';
import {
	CategoryPayload,
	createCategory as createCategoryRequest,
	deleteCategory as deleteCategoryRequest,
	getCategories,
	reorderCategories as reorderCategoriesRequest,
	updateCategory as updateCategoryRequest,
} from '../service/api';
import { AccountCategory } from '../type';

interface CategoriesStore {
	categories: AccountCategory[];
	loading: boolean;
	fetchCategories: () => Promise<void>;
	createCategory: (data: CategoryPayload) => Promise<AccountCategory>;
	updateCategory: (id: string, data: Partial<CategoryPayload>) => Promise<AccountCategory>;
	reorderCategories: (categoryIds: string[]) => Promise<void>;
	deleteCategory: (id: string, moveToCategoryId: string | null) => Promise<number>;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
	categories: [],
	loading: false,
	fetchCategories: async () => {
		set({ loading: true });
		try {
			const response = await getCategories();
			set({ categories: response.data || [] });
		} finally {
			set({ loading: false });
		}
	},
	createCategory: async (data) => {
		const response = await createCategoryRequest(data);
		if (!response.data) throw new Error('创建分类失败');
		set((state) => ({ categories: [...state.categories, response.data!] }));
		return response.data;
	},
	updateCategory: async (id, data) => {
		const response = await updateCategoryRequest(id, data);
		if (!response.data) throw new Error('更新分类失败');
		set((state) => ({
			categories: state.categories.map((category) => (category.id === id ? response.data! : category)),
		}));
		return response.data;
	},
	reorderCategories: async (categoryIds) => {
		await reorderCategoriesRequest(categoryIds);
		set((state) => ({
			categories: categoryIds.map((id, index) => ({
				...state.categories.find((category) => category.id === id)!,
				sortOrder: index,
			})),
		}));
	},
	deleteCategory: async (id, moveToCategoryId) => {
		const response = await deleteCategoryRequest(id, moveToCategoryId);
		set((state) => ({
			categories: state.categories
				.filter((category) => category.id !== id)
				.map((category, index) => ({ ...category, sortOrder: index })),
		}));
		return response.data?.movedAccountCount || 0;
	},
}));
