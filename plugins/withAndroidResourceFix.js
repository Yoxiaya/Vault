const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * 修复 AppCompat 1.7.1 + AGP 9.0 的 "Invalid <color>" 资源编译错误。
 *
 * 根因：AppCompat 1.7.1 的 values.xml 中多个 <color> 通过 ?attr/ 引用主题属性。
 * AGP 9.0 的 AAPT2 不再容忍 <color> 中使用 ?attr/ 引用。
 *
 * 策略：
 *   - res/color/*.xml    → 覆盖仅存在于 res/color/ 的选择器（如 abc_tint_*）
 *   - res/values/*.xml   → 覆盖 values.xml 中的 <color>（如 abc_hint_foreground_*）
 *   同一个资源名不能在两处同时定义，否则会重复资源冲突。
 */

function writeFile(parts, content) {
  const filePath = path.join(...parts);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

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

      // ── 1. res/color/ 选择器：仅覆盖 AppCompat 中「只存在于 res/color/」的资源 ──
      //    （abc_tint_* 在 AppCompat 的 values.xml 中没有 <color> 定义，不会冲突）
      const cd = [...base, 'color'];
      writeFile([...cd, 'abc_tint_btn_checkable.xml'],  selector('#1e88e5'));
      writeFile([...cd, 'abc_tint_default.xml'],        selector('#1e88e5'));
      writeFile([...cd, 'abc_tint_edittext.xml'],       selector('#1e88e5'));
      writeFile([...cd, 'abc_tint_seek_thumb.xml'],     selector('#1e88e5'));
      writeFile([...cd, 'abc_tint_spinner.xml'],        selector('#1e88e5'));
      writeFile([...cd, 'abc_tint_switch_track.xml'],   selector('#1e88e5'));

      // ── 2. res/values/ <color>：覆盖 values.xml 中引用 ?attr/ 的颜色 ──
      //    abc_hint_foreground_* 和 abc_search_url_text 在 AppCompat 中同时存在于
      //    res/color/ 和 res/values/，必须在这边用 <color> 覆盖才能消除 values.xml 报错
      writeFile([...base, 'values', 'appcompat-overrides.xml'], `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- 这些资源在 AppCompat 的 values.xml 中使用了 ?attr/ 引用，AGP 9 拒绝 -->
    <color name="abc_hint_foreground_material_dark">#80ffffff</color>
    <color name="abc_hint_foreground_material_light">#42000000</color>
    <color name="abc_search_url_text">#ff1e88e5</color>

    <!-- 以下为 AppCompat values.xml 中引用链较长的颜色，显式值化 -->
    <color name="abc_background_cache_hint_selector_material_dark">#33ffffff</color>
    <color name="abc_background_cache_hint_selector_material_light">#33000000</color>
    <color name="abc_btn_colored_borderless_text_material">#1e88e5</color>
    <color name="abc_btn_colored_text_material">#1e88e5</color>
    <color name="abc_primary_text_disable_only_material_dark">#4dffffff</color>
    <color name="abc_primary_text_disable_only_material_light">#61000000</color>
    <color name="abc_primary_text_material_dark">#ffffffff</color>
    <color name="abc_primary_text_material_light">#de000000</color>
    <color name="abc_secondary_text_material_dark">#b3ffffff</color>
    <color name="abc_secondary_text_material_light">#8a000000</color>
    <color name="abc_bright_foreground_disabled_material_dark">#4dffffff</color>
    <color name="abc_bright_foreground_disabled_material_light">#4d000000</color>
    <color name="abc_bright_foreground_inverse_material_dark">#de000000</color>
    <color name="abc_bright_foreground_inverse_material_light">#deffffff</color>
    <color name="abc_bright_foreground_material_dark">#ffffffff</color>
    <color name="abc_bright_foreground_material_light">#ff000000</color>
    <color name="abc_color_highlight_material">#331e88e5</color>
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
