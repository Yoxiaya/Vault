const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * 将 app.json 中 splash.contentFit 的值正确同步到 Android 原生资源，
 * 并修复 windowSplashScreenBehavior 阻止全屏的问题。
 *
 * 背景：
 *   1. expo-splash-screen 通过读取 strings.xml 中的
 *      expo_splash_screen_resize_mode 来决定图片缩放模式，
 *      但 expo prebuild 有时不会把 contentFit 正确写入。
 *   2. styles.xml 中 windowSplashScreenBehavior=icon_preferred
 *      会强制 Android 12+ 以固定小图标尺寸显示闪屏。
 */
function withSplashScreenFix(config) {
  const contentFit = config.splash?.contentFit || 'cover';

  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const resValuesDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app', 'src', 'main', 'res', 'values'
      );

      // ── 1. 修正 strings.xml ──
      const stringsPath = path.join(resValuesDir, 'strings.xml');
      if (fs.existsSync(stringsPath)) {
        let content = fs.readFileSync(stringsPath, 'utf-8');

        // 替换或插入 expo_splash_screen_resize_mode
        const regex = /<string name="expo_splash_screen_resize_mode" translatable="false">[^<]*<\/string>/;
        const replacement = `<string name="expo_splash_screen_resize_mode" translatable="false">${contentFit}</string>`;

        if (regex.test(content)) {
          content = content.replace(regex, replacement);
        } else {
          content = content.replace(
            '</resources>',
            `  ${replacement}\n</resources>`
          );
        }

        fs.writeFileSync(stringsPath, content, 'utf-8');
        console.log(`\x1b[32m[withSplashScreenFix]\x1b[0m: strings.xml → resize_mode=${contentFit}`);
      }

      // ── 2. 修正 styles.xml ──
      const stylesPath = path.join(resValuesDir, 'styles.xml');
      if (fs.existsSync(stylesPath)) {
        let content = fs.readFileSync(stylesPath, 'utf-8');

        // 移除 icon_preferred，改为跟随系统默认行为
        content = content.replace(
          /<item name="android:windowSplashScreenBehavior">icon_preferred<\/item>/g,
          '<item name="android:windowSplashScreenBehavior">splash_screen_behavior_default</item>'
        );

        fs.writeFileSync(stylesPath, content, 'utf-8');
        console.log('\x1b[32m[withSplashScreenFix]\x1b[0m: styles.xml → behavior=default');
      }

      return cfg;
    },
  ]);
}

module.exports = withSplashScreenFix;
