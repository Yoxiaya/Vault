/**
 * JWT 工具 — 解码标准三段格式（header.payload.signature）的 token
 *
 * JWT 使用 base64url 编码：
 *   - 将 + 替换为 -
 *   - 将 / 替换为 _
 *   - 去除末尾的 = 填充
 */

/** JWT 标准注册声明 + 常见自定义声明 */
interface JwtPayload {
	/** 签发者 */
	iss?: string;
	/** 主题（通常是用户 ID） */
	sub?: string;
	/** 接收方 */
	aud?: string | string[];
	/** 过期时间（Unix 秒） */
	exp?: number;
	/** 不早于（Unix 秒） */
	nbf?: number;
	/** 签发时间（Unix 秒） */
	iat?: number;
	/** 唯一标识 */
	jti?: string;
	/** 其他自定义字段 */
	[key: string]: unknown;
}

/** 解码结果 */
interface DecodedJwt {
	header: Record<string, unknown>;
	payload: JwtPayload;
	signature: string;
}

/**
 * 将 base64url 字符串还原为标准 base64，然后解码为 UTF-8 文本
 */
function base64UrlDecode(str: string): string {
	// 补回被移除的 = 填充
	let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4 !== 0) {
		base64 += '=';
	}
	// 在 React Native 环境使用全局 atob（或 polyfill）
	return global.atob(base64);
}

/**
 * 解码 JWT token，返回 header / payload / signature
 * 注意：此函数不验证签名，仅做解码。签名验证应在服务端完成。
 */
export function decodeJwt(token: string): DecodedJwt | null {
	try {
		const segments = token.split('.');
		if (segments.length !== 3) {
			return null;
		}

		const [headerB64, payloadB64, signature] = segments;

		const headerStr = base64UrlDecode(headerB64);
		const payloadStr = base64UrlDecode(payloadB64);

		const header = JSON.parse(headerStr) as Record<string, unknown>;
		const payload = JSON.parse(payloadStr) as JwtPayload;

		return { header, payload, signature };
	} catch {
		return null;
	}
}

/**
 * 判断 token 是否已过期
 * @returns true 表示已过期 / 无效 / 无 exp 字段
 */
export function isTokenExpired(token: string): boolean {
	const decoded = decodeJwt(token);
	if (!decoded || !decoded.payload.exp) {
		return true; // 无法解析或无过期时间，视为过期
	}
	// exp 是 Unix 秒，Date.now() 是毫秒
	const nowSeconds = Math.floor(Date.now() / 1000);
	return decoded.payload.exp < nowSeconds;
}

/**
 * 从 JWT payload 中提取常用用户信息
 */
export function extractUserFromJwt(token: string): {
	userId: string;
	username?: string;
	email?: string;
} | null {
	const decoded = decodeJwt(token);
	if (!decoded) return null;

	const { sub, username, email, preferred_username, userId } = decoded.payload;

	// 优先取 userId 字段，其次取 sub；number 类型统一转 string
	const rawId = userId ?? sub;
	const userIdStr = rawId != null ? String(rawId) : '';

	return {
		userId: userIdStr,
		username: (username as string) || (preferred_username as string),
		email: (email as string),
	};
}
