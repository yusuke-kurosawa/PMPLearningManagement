import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid, Network, Layers, Home, Menu, X, BookOpen, Sparkles, TrendingUp, Brain, GraduationCap } from 'lucide-react';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム', icon: Home },
    { path: '/matrix', label: 'マトリックス', icon: Grid },
    { path: '/network', label: 'ネットワーク図', icon: Network },
    { path: '/integrated', label: '統合ビュー', icon: Layers },
    { path: '/visualizations', label: 'ビジュアル', icon: Sparkles, isNew: true },
    { path: '/glossary', label: '用語集', icon: BookOpen },
    { path: '/progress', label: '学習進捗', icon: TrendingUp, isNew: true },
    { path: '/flashcards', label: 'フラッシュカード', icon: Brain, isNew: true },
    { path: '/mock-exam', label: '模擬試験', icon: GraduationCap, isNew: true }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold text-gray-800">PMBOK学習システム</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map(({ path, label, icon: Icon, isNew }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {isNew && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 animate-slide-in">
            {navItems.map(({ path, label, icon: Icon, isNew }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    relative flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {isNew && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;