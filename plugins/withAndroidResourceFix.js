const { withDangerousMod, withGradleProperties } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * 修复 AppCompat 1.7.1 + AGP 9.0 的 "Invalid <color>" 资源编译错误。
 *
 * 根因：AppCompat 1.7.1 中多个 <color> 资源通过 ?attr/ 间接引用主题属性，
 * AGP 9.0 的 AAPT2 不再容忍这种间接引用，导致合并失败。
 *
 * 修复策略：
 * 1. 在单独的资源文件中以显式色值覆盖全部 AppCompat 颜色资源，打断引用链
 * 2. 兜底关闭 AAPT2 资源优化（兼容旧版 AGP）
 */
function withAndroidResourceFix(config) {
  // 策略 1：显式覆盖 AppCompat 颜色资源（独立文件，不影响默认 colors.xml）
  config = withDangerousMod(config, [
    'android',
    (cfg) => {
      const resValuesDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'values'
      );
      fs.mkdirSync(resValuesDir, { recursive: true });

      const fixFile = path.join(resValuesDir, 'appcompat-fix.xml');
      fs.writeFileSync(
        fixFile,
        `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!--
      Fix AppCompat 1.7.1 + AGP 9.0 resource compilation error.
      All AppCompat color aliases resolved to explicit hex values
      to avoid ?attr/ references that newer AAPT2 rejects.
    -->

    <!-- Hint / Text colors -->
    <color name="abc_hint_foreground_material_dark">#80ffffff</color>
    <color name="abc_hint_foreground_material_light">#42000000</color>
    <color name="abc_primary_text_disable_only_material_dark">#4dffffff</color>
    <color name="abc_primary_text_disable_only_material_light">#61000000</color>
    <color name="abc_primary_text_material_dark">#ffffffff</color>
    <color name="abc_primary_text_material_light">#de000000</color>
    <color name="abc_secondary_text_material_dark">#b3ffffff</color>
    <color name="abc_secondary_text_material_light">#8a000000</color>
    <color name="abc_search_url_text">#ff1e88e5</color>

    <!-- Tint colors — these commonly reference ?attr/colorControlNormal etc.
         and are the most frequent source of "Invalid <color>" in AGP 9.0 -->
    <color name="abc_tint_btn_checkable">#1e88e5</color>
    <color name="abc_tint_default">#1e88e5</color>
    <color name="abc_tint_edittext">#1e88e5</color>
    <color name="abc_tint_seek_thumb">#1e88e5</color>
    <color name="abc_tint_spinner">#1e88e5</color>
    <color name="abc_tint_switch_track">#1e88e5</color>

    <!-- Background / foreground helpers -->
    <color name="abc_background_cache_hint_selector_material_dark">#33ffffff</color>
    <color name="abc_background_cache_hint_selector_material_light">#33000000</color>
    <color name="abc_bright_foreground_disabled_material_dark">#4dffffff</color>
    <color name="abc_bright_foreground_disabled_material_light">#4d000000</color>
    <color name="abc_bright_foreground_inverse_material_dark">#de000000</color>
    <color name="abc_bright_foreground_inverse_material_light">#deffffff</color>
    <color name="abc_bright_foreground_material_dark">#ffffffff</color>
    <color name="abc_bright_foreground_material_light">#ff000000</color>

    <!-- Button / highlight -->
    <color name="abc_btn_colored_borderless_text_material">#1e88e5</color>
    <color name="abc_btn_colored_text_material">#1e88e5</color>
    <color name="abc_color_highlight_material">#331e88e5</color>

    <!-- Status guard -->
    <color name="abc_decor_view_status_guard">#ff000000</color>
    <color name="abc_decor_view_status_guard_light">#ffffffff</color>

    <!-- Input method -->
    <color name="abc_input_method_navigation_guard">#ff000000</color>
</resources>
`
      );

      return cfg;
    },
  ]);

  // 策略 2（兜底）：关闭 AAPT2 资源优化，兼容旧版 AGP
  config = withGradleProperties(config, (cfg) => {
    const existing = cfg.modResults.find(
      (p) => p.type === 'property' && p.key === 'android.enableResourceOptimizations'
    );
    if (!existing) {
      cfg.modResults.push({
        type: 'property',
        key: 'android.enableResourceOptimizations',
        value: 'false',
      });
    }
    return cfg;
  });

  return config;
}

module.exports = withAndroidResourceFix;
