const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * 修复 AppCompat 1.7.1 + build-tools 36 / AGP 9.0 的 AAPT2 资源编译错误。
 *
 * 问题：AAPT2 (build-tools 36) 将 AppCompat 中的 `secondary_text_disabled_material_*`
 * 颜色标记为 "Invalid <color>"，导致 TableExtractor 抛出 IllegalStateException。
 * 通过在 App 自己的 colors.xml 中显式覆盖这些颜色值，合并器会优先使用 App
 * 的定义，跳过 AppCompat 中被编译器拒绝的资源。
 */
function withAndroidColorFix(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const resValuesDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app', 'src', 'main', 'res', 'values'
      );
      const colorsPath = path.join(resValuesDir, 'colors.xml');

      fs.mkdirSync(resValuesDir, { recursive: true });

      let content;
      if (fs.existsSync(colorsPath)) {
        content = fs.readFileSync(colorsPath, 'utf-8');
      } else {
        content = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n';
      }

      // 确保 splashscreen_background 使用 @android:color/ 前缀
      // （裸 "transparent" 关键字在新版 AAPT2 中不被接受）
      content = content.replace(
        /(<color name="splashscreen_background">)transparent(<\/color>)/,
        '$1@android:color/transparent$2'
      );

      // 覆盖 AppCompat 1.7.1 中被 AAPT2 拒绝的颜色
      const overrides = [
        'secondary_text_disabled_material_dark',
        'secondary_text_disabled_material_light',
      ];

      overrides.forEach((colorName) => {
        if (content.includes(`name="${colorName}"`)) return; // 已存在，跳过

        const value = getColorValue(colorName);
        content = content.replace(
          '</resources>',
          `  <color name="${colorName}">${value}</color>\n</resources>`
        );
      });

      fs.writeFileSync(colorsPath, content, 'utf-8');
      return cfg;
    },
  ]);
}

function getColorValue(name) {
  const map = {
    secondary_text_disabled_material_dark: '#36ffffff',
    secondary_text_disabled_material_light: '#24000000',
  };
  return map[name] || '#ff000000';
}

module.exports = withAndroidColorFix;
