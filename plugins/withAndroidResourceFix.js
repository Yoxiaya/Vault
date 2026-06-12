const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * 修复 AppCompat 1.7.1 + AGP 9.0 的 "Invalid <color>" 资源编译错误。
 *
 * 根因：AppCompat 1.7.1 中多个颜色资源（含 ColorStateList）通过 ?attr/
 * 间接引用主题属性，AGP 9.0 的 AAPT2 拒绝这种间接引用。
 *
 * 修复策略：
 *   1. res/color/*.xml   — 覆盖 ColorStateList 选择器（abc_tint_* 等）
 *   2. res/values/appcompat-fix.xml — 覆盖普通 <color> 值
 */

/** 写入文件，自动创建父目录 */
function writeFile(parts, content) {
  const filePath = path.join(...parts);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

/** 生成一个始终返回指定颜色的简单 ColorStateList */
function selector(color) {
  return `<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:color="${color}"/>
</selector>
`;
}

function withAndroidResourceFix(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const base = [root, 'app', 'src', 'main', 'res'];

      // ─────────────────────────────────────────────────
      // 1. ColorStateList 选择器 —— 覆盖 res/color/ 下引用 ?attr/ 的资源
      // ─────────────────────────────────────────────────
      const colorDir = [...base, 'color'];

      // abc_tint_* — 这些是 AppCompat 最常见的报错来源
          // 它们通常定义为引用 ?attr/colorControlNormal 的选择器
      writeFile([...colorDir, 'abc_tint_btn_checkable.xml'],    selector('#1e88e5'));
      writeFile([...colorDir, 'abc_tint_default.xml'],          selector('#1e88e5'));
      writeFile([...colorDir, 'abc_tint_edittext.xml'],         selector('#1e88e5'));
      writeFile([...colorDir, 'abc_tint_seek_thumb.xml'],       selector('#1e88e5'));
      writeFile([...colorDir, 'abc_tint_spinner.xml'],          selector('#1e88e5'));
      writeFile([...colorDir, 'abc_tint_switch_track.xml'],     selector('#1e88e5'));

      // abc_hint_foreground_* — 也可能在 res/color/ 下有选择器定义
      writeFile([...colorDir, 'abc_hint_foreground_material_dark.xml'],  selector('#80ffffff'));
      writeFile([...colorDir, 'abc_hint_foreground_material_light.xml'], selector('#42000000'));

      // abc_search_url_text
      writeFile([...colorDir, 'abc_search_url_text.xml'], selector('#ff1e88e5'));

      // ─────────────────────────────────────────────────
      // 2. 普通 <color> 值 —— 覆盖 res/values/ 下的引用链
      // ─────────────────────────────────────────────────
      writeFile([...base, 'values', 'appcompat-fix.xml'], `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 显式色值，打断 AppCompat 内部通过 @color/ 或 ?attr/ 的引用链 -->

    <!-- 文本颜色 -->
    <color name="abc_hint_foreground_material_dark">#80ffffff</color>
    <color name="abc_hint_foreground_material_light">#42000000</color>
    <color name="abc_primary_text_disable_only_material_dark">#4dffffff</color>
    <color name="abc_primary_text_disable_only_material_light">#61000000</color>
    <color name="abc_primary_text_material_dark">#ffffffff</color>
    <color name="abc_primary_text_material_light">#de000000</color>
    <color name="abc_secondary_text_material_dark">#b3ffffff</color>
    <color name="abc_secondary_text_material_light">#8a000000</color>
    <color name="abc_search_url_text">#ff1e88e5</color>

    <!-- 背景/前景辅助色 -->
    <color name="abc_background_cache_hint_selector_material_dark">#33ffffff</color>
    <color name="abc_background_cache_hint_selector_material_light">#33000000</color>
    <color name="abc_bright_foreground_disabled_material_dark">#4dffffff</color>
    <color name="abc_bright_foreground_disabled_material_light">#4d000000</color>
    <color name="abc_bright_foreground_inverse_material_dark">#de000000</color>
    <color name="abc_bright_foreground_inverse_material_light">#deffffff</color>
    <color name="abc_bright_foreground_material_dark">#ffffffff</color>
    <color name="abc_bright_foreground_material_light">#ff000000</color>

    <!-- 按钮 / 高亮 -->
    <color name="abc_btn_colored_borderless_text_material">#1e88e5</color>
    <color name="abc_btn_colored_text_material">#1e88e5</color>
    <color name="abc_color_highlight_material">#331e88e5</color>

    <!-- 状态栏保护色 -->
    <color name="abc_decor_view_status_guard">#ff000000</color>
    <color name="abc_decor_view_status_guard_light">#ffffffff</color>
    <color name="abc_input_method_navigation_guard">#ff000000</color>
</resources>
`);

      return cfg;
    },
  ]);
}

module.exports = withAndroidResourceFix;
