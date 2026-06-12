export enum EventName {
	TOKEN_EXPIRED = 'TOKEN_EXPIRED',
	LOGOUT = 'LOGOUT',
	SHOW_TOAST = 'SHOW_TOAST',
}

export interface ToastEvent {
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
}

export type EventMap = {
	[EventName.TOKEN_EXPIRED]: void;
	[EventName.LOGOUT]: void;
	[EventName.SHOW_TOAST]: ToastEvent;
};
