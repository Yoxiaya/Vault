const { withGradleProperties } = require('expo/config-plugins');

/**
 * 修复 Gradle 9.0 + AppCompat 1.7.1 下部分库（如 slider）的资源编译冲突。
 * 关闭 AAPT2 的 resource optimization，避免 "Invalid <color>" 合并报错。
 */
function withAndroidResourceFix(config) {
  return withGradleProperties(config, (cfg) => {
    cfg.modResults.push({
      type: 'property',
      key: 'android.enableResourceOptimizations',
      value: 'false',
    });
    return cfg;
  });
}

module.exports = withAndroidResourceFix;
