import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Settings, Users, Heart, MessageCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { isFeatureEnabled } from '../config/features';

interface HeaderProps {
  connectFeatureEnabled?: boolean;
  onToggleConnectFeature?: (enabled: boolean) => void;
  onOpenCollaborativeFeatures?: () => void;
  onOpenPrivateChatRoom?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  connectFeatureEnabled = false, 
  onToggleConnectFeature,
  onOpenCollaborativeFeatures,
  onOpenPrivateChatRoom
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Health Map' },
    { path: '/report', label: 'Report Symptoms' },
    { path: '/phone-ai', label: 'AI Diagnosis' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/about', label: 'About' }
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">
              HealthPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                {item.label}
                </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Private Chat Room Button */}
            <button
              onClick={() => {
                // The PrivateChatRoom component is now self-contained and will handle its own modal
                // We can trigger it by dispatching a custom event
                window.dispatchEvent(new CustomEvent('openPrivateChat'));
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg transition-all hover:scale-105 shadow-lg font-medium"
              title="Open Private Chat Room"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Private Chat</span>
            </button>

            {/* Health Community Button */}
            {isFeatureEnabled('COMMUNITY_ENABLED') && onOpenCollaborativeFeatures && (
              <button
                onClick={onOpenCollaborativeFeatures}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg transition-all hover:scale-105 shadow-lg font-medium"
                title="Open Health Community"
              >
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Community</span>
              </button>
            )}

            {/* Connect Feature Toggle */}
            {onToggleConnectFeature && (
              <button
                onClick={() => onToggleConnectFeature(!connectFeatureEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  connectFeatureEnabled
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title={connectFeatureEnabled ? 'Disable Connect Feature' : 'Enable Connect Feature'}
              >
                <Users className="w-5 h-5" />
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64 z-50">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Settings</h3>
            
            {onToggleConnectFeature && (
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Connect Feature</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Connect with random users</p>
                </div>
                <button
                  onClick={() => onToggleConnectFeature(!connectFeatureEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    connectFeatureEnabled ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      connectFeatureEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toggle theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                  >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;