const { withAndroidStyles, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * 绕过 Android 12+ 系统闪屏 API 限制，实现真正的全屏闪屏图片。
 *
 * 原理：
 *   Android 12+ 的 Theme.SplashScreen API 将 windowSplashScreenAnimatedIcon
 *   强制限制在 ~288dp 居中显示 —— 系统层面无法全屏。
 *   本插件切回 legacy 模式：让闪屏主题继承 AppTheme，使用
 *   android:windowBackground 指向一张全屏 drawable，
 *   图片会被拉伸填满整个窗口。
 *
 * 副作用：
 *   Android 12+ 冷启动时系统仍会先展示极短暂（~100-300ms）的默认闪屏
 *   （App 图标 + 白色背景），然后才过渡到我们的全屏图片。由于背景色一致，
 *   视觉过渡基本无感。
 */
function withAndroidSplashFullScreen(config) {
  // ── 1. 复制闪屏图片并生成 scale-to-fill 的 XML drawable ──
  config = withDangerousMod(config, [
    'android',
    (cfg) => {
      const projectRoot = cfg.modRequest.platformProjectRoot;
      const mainResDir = path.join(projectRoot, 'app', 'src', 'main', 'res');

      // 从 app.json 读取 splash.image 路径
      const splashImageRelPath = config.splash?.image;
      const splashImageSrc = splashImageRelPath
        ? path.join(cfg.modRequest.projectRoot, splashImageRelPath)
        : null;

      if (splashImageSrc && fs.existsSync(splashImageSrc)) {
        // 复制位图到 drawable-nodpi（不做密度缩放），保留原始扩展名
        const srcExt = path.extname(splashImageSrc); // 如 .jpg / .png
        const nodpiDir = path.join(mainResDir, 'drawable-nodpi');
        const bitmapDest = path.join(nodpiDir, `splash_screen_image_bitmap${srcExt}`);
        fs.mkdirSync(nodpiDir, { recursive: true });
        fs.copyFileSync(splashImageSrc, bitmapDest);

        // 创建 XML drawable 使图片 scale-to-fill（拉伸铺满）
        const drawableDir = path.join(mainResDir, 'drawable');
        const xmlDrawablePath = path.join(drawableDir, 'splash_screen_image.xml');
        fs.mkdirSync(drawableDir, { recursive: true });
        fs.writeFileSync(xmlDrawablePath, [
          '<?xml version="1.0" encoding="utf-8"?>',
          '<bitmap xmlns:android="http://schemas.android.com/apk/res/android"',
          '    android:src="@drawable/splash_screen_image_bitmap"',
          '    android:gravity="fill" />',
          ''
        ].join('\n'), 'utf-8');

        console.log('\x1b[32m[withAndroidSplashFullScreen]\x1b[0m: splash image → drawable-nodpi + fill XML');
      } else {
        console.warn(
          '\x1b[33m[withAndroidSplashFullScreen]\x1b[0m: splash image not found at "%s"',
          splashImageRelPath || '(not configured)'
        );
      }

      return cfg;
    },
  ]);

  // ── 2. 用 withAndroidStyles API 覆写闪屏主题（XML 解析，不用脆弱的正则）──
  config = withAndroidStyles(config, (expoConfig) => {
    const xml = expoConfig.modResults;
    let found = false;

    xml.resources.style = (xml.resources.style || []).map((style) => {
      if (style.$.name === 'Theme.App.SplashScreen') {
        found = true;
        // 替换为 legacy 全屏主题
        return {
          $: { name: 'Theme.App.SplashScreen', parent: 'AppTheme' },
          item: [
            { $: { name: 'android:windowBackground' }, _: '@drawable/splash_screen_image' },
            { $: { name: 'postSplashScreenTheme' }, _: '@style/AppTheme' },
          ],
        };
      }
      return style;
    });

    // 如果样式不存在则新增
    if (!found) {
      xml.resources.style.push({
        $: { name: 'Theme.App.SplashScreen', parent: 'AppTheme' },
        item: [
          { $: { name: 'android:windowBackground' }, _: '@drawable/splash_screen_image' },
          { $: { name: 'postSplashScreenTheme' }, _: '@style/AppTheme' },
        ],
      });
    }

    console.log('\x1b[32m[withAndroidSplashFullScreen]\x1b[0m: styles.xml → legacy full-screen mode');
    return expoConfig;
  });

  // ── 3. 移除 MainActivity.kt 中的 SplashScreenManager ──
  config = withDangerousMod(config, [
    'android',
    (cfg) => {
      const projectRoot = cfg.modRequest.platformProjectRoot;

      function findKotlinFile(dir) {
        if (!fs.existsSync(dir)) return null;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const result = findKotlinFile(fullPath);
            if (result) return result;
          } else if (entry.name === 'MainActivity.kt') {
            return fullPath;
          }
        }
        return null;
      }

      const mainActivityPaths = [
        path.join(projectRoot, 'app', 'src', 'main', 'java'),
      ];

      const ktPath = findKotlinFile(mainActivityPaths[0]);
      if (ktPath && fs.existsSync(ktPath)) {
        let content = fs.readFileSync(ktPath, 'utf-8');

        content = content.replace(
          /import expo\.modules\.splashscreen\.SplashScreenManager\s*\n/g,
          ''
        );

        content = content.replace(
          /[ \t]*\/\/ @generated begin expo-splashscreen[\s\S]*?\/\/ @generated end expo-splashscreen\s*/g,
          ''
        );

        fs.writeFileSync(ktPath, content, 'utf-8');
        console.log('\x1b[32m[withAndroidSplashFullScreen]\x1b[0m: MainActivity.kt → removed SplashScreenManager');
      }

      return cfg;
    },
  ]);

  return config;
}

module.exports = withAndroidSplashFullScreen;
