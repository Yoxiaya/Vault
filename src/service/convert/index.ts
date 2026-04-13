export default class Convert<T = any> {
	[key: string]: (data: T) => T;
}
