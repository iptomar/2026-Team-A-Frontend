import { useInsertionEffect, useMemo } from 'react';
const insertedRules = new Set();
const getRuntimeStyleSheet = () => {
  let styleElement = document.getElementById('runtime-component-styles');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'runtime-component-styles';
    document.head.appendChild(styleElement);
  }
  return styleElement.sheet;
};
const hash = value => {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result << 5) - result + value.charCodeAt(index) | 0;
  }
  return Math.abs(result).toString(36);
};
const isSafeColor = color => {
  return /^#[0-9a-f]{3,8}$/i.test(color) || /^rgba?\([\d\s,.%]+\)$/i.test(color) || /^hsla?\([\d\s,.%]+\)$/i.test(color) || /^var\(--[a-z0-9-]+\)$/i.test(color);
};
export const useRuntimeColorClass = (prefix, color, variableName) => {
  const safeColor = isSafeColor(color) ? color : '#28a745';
  const className = useMemo(() => `${prefix}-${hash(`${variableName}:${safeColor}`)}`, [prefix, safeColor, variableName]);
  useInsertionEffect(() => {
    if (insertedRules.has(className)) return;
    const sheet = getRuntimeStyleSheet();
    sheet.insertRule(`.${className} { ${variableName}: ${safeColor}; }`, sheet.cssRules.length);
    insertedRules.add(className);
  }, [className, safeColor, variableName]);
  return className;
};
