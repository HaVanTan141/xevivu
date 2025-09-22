// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ưu tiên field 'react-native' / 'browser' để Metro không chọn nhánh Node
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Phòng hờ: tránh bundle gói 'ws' Node vào app RN
config.resolver.blockList = [/node_modules\/ws\/.*/];

module.exports = config;
