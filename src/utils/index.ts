// 密码强度计算函数
export const calculatePasswordStrength = (
	password: string,
): { score: number; level: string; color: string; feedback: string } => {
	if (!password) {
		return { score: 0, level: '无', color: '#e5e7eb', feedback: '请输入密码' };
	}

	let score = 0;
	const feedbacks = [];

	// 长度检查
	if (password.length >= 8) {
		score += 1;
		feedbacks.push('长度足够');
	} else if (password.length >= 6) {
		score += 0.5;
		feedbacks.push('长度较短');
	} else {
		feedbacks.push('长度太短');
	}

	// 包含数字
	if (/[0-9]/.test(password)) {
		score += 1;
		feedbacks.push('包含数字');
	}

	// 包含小写字母
	if (/[a-z]/.test(password)) {
		score += 1;
		feedbacks.push('包含小写字母');
	}

	// 包含大写字母
	if (/[A-Z]/.test(password)) {
		score += 1;
		feedbacks.push('包含大写字母');
	}

	// 包含特殊字符
	if (/[^a-zA-Z0-9]/.test(password)) {
		score += 1;
		feedbacks.push('包含特殊字符');
	}

	// 根据分数确定强度等级
	let level = '';
	let color = '';
	let feedback = '';

	if (score < 2) {
		level = '弱';
		color = '#ef4444';
		feedback = '密码太弱，建议增加长度和字符类型';
	} else if (score < 3.5) {
		level = '中';
		color = '#f59e0b';
		feedback = '密码强度中等，可以增加特殊字符提高安全性';
	} else if (score < 5) {
		level = '强';
		color = '#10b981';
		feedback = '密码强度不错';
	} else {
		level = '非常强';
		color = '#3b82f6';
		feedback = '密码强度非常好！';
	}

	return { score: Math.min(score, 5), level, color, feedback: feedback || feedbacks.join('、') };
};
