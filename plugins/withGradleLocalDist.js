const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Gradle 分发加速：
 *   1. 有本地 zip → 预填充 wrapper 缓存，跳过下载
 *   2. 无本地 zip → 替换为镜像源下载
 *
 * 镜像源优先级：
 *   GRADLE_MIRROR 环境变量 → 阿里云镜像 → 官方源（不改写）
 */
const OFFICIAL_URL = 'https://services.gradle.org/distributions';
const DEFAULT_MIRROR = 'https://mirrors.aliyun.com/macports/distfiles/gradle';

function withGradleLocalDist(config) {
	return withDangerousMod(config, [
		'android',
		(cfg) => {
			const wrapperPropsPath = path.join(
				cfg.modRequest.platformProjectRoot,
				'gradle',
				'wrapper',
				'gradle-wrapper.properties'
			);

			if (!fs.existsSync(wrapperPropsPath)) {
				console.log('\x1b[32m[withGradleLocalDist]\x1b[0m: wrapper properties 不存在，跳过');
				return cfg;
			}

			const propsContent = fs.readFileSync(wrapperPropsPath, 'utf-8');
			const urlMatch = propsContent.match(/^distributionUrl=(.*)$/m);
			if (!urlMatch) {
				console.log('\x1b[32m[withGradleLocalDist]\x1b[0m: 未找到 distributionUrl，跳过');
				return cfg;
			}

			// 还原 Java properties 转义
			const rawUrl = urlMatch[1].trim();
			const remoteUrl = rawUrl.replace(/\\([:=])/g, '$1');

			// ---- 1. 优先本地 zip：预填充缓存 ----
			const distDir = path.join(cfg.modRequest.projectRoot, 'gradle-dist');
			let localZip = process.env.GRADLE_LOCAL_DIST || null;

			if (!localZip && fs.existsSync(distDir)) {
				const zips = fs.readdirSync(distDir).filter((f) => /^gradle-[\d.]+-bin\.zip$/.test(f));
				if (zips.length > 0) {
					localZip = path.join(distDir, zips[0]);
				}
			}

			if (localZip && fs.existsSync(localZip)) {
				// 缓存路径 = %USERPROFILE%\.gradle\wrapper\dists\<dist>\<sha256(url)>\
				const urlHash = crypto.createHash('sha256').update(remoteUrl).digest('hex');
				const distName = path.basename(remoteUrl.replace(/\\/g, '/'));
				const distBaseName = distName.replace(/\.zip$/, '');

				const gradleUserHome =
					process.env.GRADLE_USER_HOME || path.join(process.env.USERPROFILE || '', '.gradle');

				const cacheDir = path.join(gradleUserHome, 'wrapper', 'dists', distBaseName, urlHash);
				const cacheZip = path.join(cacheDir, distName);

				if (fs.existsSync(cacheZip)) {
					console.log('\x1b[32m[withGradleLocalDist]\x1b[0m: 缓存已存在，跳过');
					return cfg;
				}

				fs.mkdirSync(cacheDir, { recursive: true });
				fs.copyFileSync(localZip, cacheZip);
				fs.writeFileSync(cacheZip + '.ok', '');

				console.log('\x1b[32m[withGradleLocalDist]\x1b[0m: ✅ 已预填充缓存');
				console.log(`\x1b[32m[withGradleLocalDist]\x1b[0m:   ${path.basename(localZip)} → ${cacheDir}`);
				return cfg;
			}

			// ---- 2. 无本地 zip：替换为镜像源 ----
			const mirror = process.env.GRADLE_MIRROR || DEFAULT_MIRROR;

			if (remoteUrl.startsWith(OFFICIAL_URL)) {
				const mirrorUrl = remoteUrl.replace(OFFICIAL_URL, mirror);
				// 转义冒号写回 properties 文件
				const newLine = `distributionUrl=${mirrorUrl.replace(':', '\\:')}`;
				const newContent = propsContent.replace(/^distributionUrl=.*$/m, newLine);

				fs.writeFileSync(wrapperPropsPath, newContent, 'utf-8');

				console.log('\x1b[32m[withGradleLocalDist]\x1b[0m: ✅ 已切换镜像源');
				console.log(`\x1b[32m[withGradleLocalDist]\x1b[0m:   官方: ${OFFICIAL_URL}`);
				console.log(`\x1b[32m[withGradleLocalDist]\x1b[0m:   镜像: ${mirror}`);
			} else {
				console.log('\x1b[32m[withGradleLocalDist]\x1b[0m: 已是镜像/自定义源，保持不动');
			}

			return cfg;
		},
	]);
}

module.exports = withGradleLocalDist;
