import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // デフォルト設定
  const defaultSettings = {
    darkMode: false,
    primaryColor: 'blue',
    fontSize: 'medium',
    compactMode: false,
    animations: true,
    highContrast: false
  };

  // LocalStorageから設定を読み込み
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('themeSettings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (error) {
      console.error('テーマ設定の読み込みエラー:', error);
      return defaultSettings;
    }
  };

  const [settings, setSettings] = useState(loadSettings);

  // 設定が変更されたらLocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem('themeSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('テーマ設定の保存エラー:', error);
    }
  }, [settings]);

  // ダークモードの適用
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // フォントサイズの適用
  useEffect(() => {
    const fontSizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      xlarge: 'text-xl'
    };

    // 既存のフォントサイズクラスを削除
    Object.values(fontSizeClasses).forEach(cls => {
      document.documentElement.classList.remove(cls);
    });

    // 新しいフォントサイズクラスを追加
    document.documentElement.classList.add(fontSizeClasses[settings.fontSize]);
  }, [settings.fontSize]);

  // 高コントラストモードの適用
  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings.highContrast]);

  // コンパクトモードの適用
  useEffect(() => {
    if (settings.compactMode) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
  }, [settings.compactMode]);

  // アニメーション設定の適用
  useEffect(() => {
    if (!settings.animations) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
  }, [settings.animations]);

  // 設定の更新関数
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // ダークモードの切り替え
  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  // 設定のリセット
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // カラーテーマの定義
  const colorThemes = {
    blue: {
      primary: 'blue-600',
      primaryDark: 'blue-500',
      secondary: 'blue-100',
      secondaryDark: 'blue-900'
    },
    green: {
      primary: 'green-600',
      primaryDark: 'green-500',
      secondary: 'green-100',
      secondaryDark: 'green-900'
    },
    purple: {
      primary: 'purple-600',
      primaryDark: 'purple-500',
      secondary: 'purple-100',
      secondaryDark: 'purple-900'
    },
    red: {
      primary: 'red-600',
      primaryDark: 'red-500',
      secondary: 'red-100',
      secondaryDark: 'red-900'
    },
    indigo: {
      primary: 'indigo-600',
      primaryDark: 'indigo-500',
      secondary: 'indigo-100',
      secondaryDark: 'indigo-900'
    }
  };

  const value = {
    settings,
    updateSettings,
    toggleDarkMode,
    resetSettings,
    colorThemes,
    currentTheme: colorThemes[settings.primaryColor] || colorThemes.blue
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;