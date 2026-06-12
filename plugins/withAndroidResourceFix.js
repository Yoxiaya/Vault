const { withAppBuildGradle, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * 修复 AppCompat 1.7.1 + AGP 9.0 的 "Invalid <color>" 资源编译错误。
 *
 * 策略：AppCompat 1.7.1 的 values.xml 中多个 <color> 使用 ?attr/ 引用主题属性，
 * AGP 9.0 的 AAPT2 拒绝这种引用。由于资源覆盖方式无法在合并前拦截，
 * 改用 Gradle 任务直接修补 AppCompat 源文件。
 */
function withAndroidResourceFix(config) {
  // 策略 1：Gradle 任务 — 在资源合并前修补 AppCompat values.xml
  config = withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents += `
// === Patch AppCompat 1.7.1 values.xml for AGP 9.0 compatibility ===
tasks.register('patchAppCompatValuesXml') {
    doLast {
        def cacheDir = file(gradle.gradleUserHomeDir.path + '/caches/9.0.0/transforms')
        if (!cacheDir.exists()) return
        fileTree(cacheDir).matching {
            include '**/appcompat-1.7*/res/values/values.xml'
        }.each { f ->
            def text = f.getText('UTF-8')
            def patched = text.replaceAll(
                /<color name="([^"]+)">\\?attr\\/[^<]*<\\/color>/,
                '<color name="\$1">#ff000000</color>'
            )
            if (text != patched) {
                f.setText(patched, 'UTF-8')
                logger.lifecycle('[patchAppCompatValuesXml] Patched: ' + f.path)
            }
        }
    }
}
afterEvaluate {
    tasks.matching { it.name.startsWith('merge') && it.name.contains('Resources') }.configureEach {
        dependsOn patchAppCompatValuesXml
    }
}
`;
    return cfg;
  });

  // 策略 2（兜底）：资源覆盖 — 以防 Gradle 任务因权限等原因未生效
  config = withDangerousMod(config, [
    'android',
    (cfg) => {
      const root = cfg.modRequest.platformProjectRoot;
      const base = [root, 'app', 'src', 'main', 'res'];

      // res/color/ — abc_tint_* 选择器
      function selector(color) {
        return '<?xml version="1.0" encoding="utf-8"?>\n<selector xmlns:android="http://schemas.android.com/apk/res/android">\n    <item android:color="' + color + '"/>\n</selector>\n';
      }
      const cd = [...base, 'color'];
      fs.mkdirSync(path.join(...cd), { recursive: true });
      const tints = ['abc_tint_btn_checkable','abc_tint_default','abc_tint_edittext','abc_tint_seek_thumb','abc_tint_spinner','abc_tint_switch_track'];
      tints.forEach(t => fs.writeFileSync(path.join(...cd, t + '.xml'), selector('#1e88e5')));

      // res/values/ — 全部 <color> 覆盖
      const vd = [...base, 'values'];
      fs.mkdirSync(path.join(...vd), { recursive: true });
      fs.writeFileSync(path.join(...vd, 'appcompat-overrides.xml'),
`<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="abc_hint_foreground_material_dark">#80ffffff</color>
    <color name="abc_hint_foreground_material_light">#42000000</color>
    <color name="abc_search_url_text">#ff1e88e5</color>
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

  return config;
}

module.exports = withAndroidResourceFix;
