type EventMap = {
	TOKEN_EXPIRED: void;
	LOGOUT: void;
};
type EventListener<T extends keyof EventMap> = (payload: EventMap[T]) => void;

class EventBus {
	private events: Map<string, Set<EventListener<any>>> = new Map();

	on<T extends keyof EventMap>(event: keyof EventMap, listener: EventListener<T>) {
		if (!this.events.has(event)) {
			this.events.set(event, new Set());
		}
		this.events.get(event)!.add(listener);
	}
	off<T extends keyof EventMap>(event: keyof EventMap, listener: EventListener<T>) {
		if (!this.events.has(event)) {
			return;
		}
		this.events.get(event)!.delete(listener);
	}
	emit<T extends keyof EventMap>(event: keyof EventMap, payload?: EventMap[T]) {
		if (!this.events.has(event)) {
			return;
		}
		this.events.get(event)!.forEach((listener) => listener(payload));
	}
}
export const eventBus = new EventBus();
