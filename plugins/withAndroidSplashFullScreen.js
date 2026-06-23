const { withDangerousMod } = require('expo/config-plugins');
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
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const projectRoot = cfg.modRequest.platformProjectRoot;
      const mainResDir = path.join(projectRoot, 'app', 'src', 'main', 'res');

      // ── 1. 复制闪屏图片到 drawable-nodpi（全尺寸，不做密度缩放）──
      const splashImageSrc = path.join(cfg.modRequest.projectRoot, 'assets', '640.png');
      const nodpiDir = path.join(mainResDir, 'drawable-nodpi');
      const splashImageDest = path.join(nodpiDir, 'splash_screen_image.png');

      if (fs.existsSync(splashImageSrc)) {
        fs.mkdirSync(nodpiDir, { recursive: true });
        fs.copyFileSync(splashImageSrc, splashImageDest);
        console.log('\x1b[32m[withAndroidSplashFullScreen]\x1b[0m: splash image → drawable-nodpi/splash_screen_image.png');
      }

      // ── 2. 覆写 styles.xml —— 切到 legacy 全屏模式 ──
      const stylesPath = path.join(mainResDir, 'values', 'styles.xml');
      if (fs.existsSync(stylesPath)) {
        let content = fs.readFileSync(stylesPath, 'utf-8');

        // 移除旧的 Theme.App.SplashScreen (含 Theme.SplashScreen parent)
        content = content.replace(
          /<style name="Theme\.App\.SplashScreen" parent="[^"]*">[\s\S]*?<\/style>/g,
          ''
        );

        // 注入新的 legacy 全屏主题
        const newStyle = `  <style name="Theme.App.SplashScreen" parent="AppTheme">
    <item name="android:windowBackground">@drawable/splash_screen_image</item>
    <item name="postSplashScreenTheme">@style/AppTheme</item>
  </style>`;

        content = content.replace('</resources>', `${newStyle}\n</resources>`);

        fs.writeFileSync(stylesPath, content, 'utf-8');
        console.log('\x1b[32m[withAndroidSplashFullScreen]\x1b[0m: styles.xml → legacy full-screen mode');
      }

      // ── 3. 覆写 MainActivity.kt —— 移除 Theme.SplashScreen 专用 API ──
      const mainActivityPaths = [
        path.join(projectRoot, 'app', 'src', 'main', 'java'),
      ];

      // 递归查找 MainActivity.kt
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

      const ktPath = findKotlinFile(mainActivityPaths[0]);
      if (ktPath && fs.existsSync(ktPath)) {
        let content = fs.readFileSync(ktPath, 'utf-8');

        // 移除 SplashScreenManager import
        content = content.replace(
          /import expo\.modules\.splashscreen\.SplashScreenManager\s*\n/g,
          ''
        );

        // 移除 expo-splashscreen 代码块（包括注释）
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
}

module.exports = withAndroidSplashFullScreen;
