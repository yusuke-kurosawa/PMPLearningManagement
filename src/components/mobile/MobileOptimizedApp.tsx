/**
 * Mobile-Optimized App Shell with PWA Features
 * Developer 6: PWA & Mobile Developer Implementation
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Home,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Download,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Share,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  MoreVertical,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Battery,
  Signal,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';

interface PWACapabilities {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  isOnline: boolean;
  hasNotifications: boolean;
  hasPushNotifications: boolean;
  hasBackgroundSync: boolean;
  hasPeriodicBackgroundSync: boolean;
  supportsTouchGestures: boolean;
  supportsVibration: boolean;
  supportsBatteryAPI: boolean;
  supportsNetworkInformation: boolean;
}

interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'longPress';
  direction?: 'left' | 'right' | 'up' | 'down';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  distance: number;
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  battery?: {
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  };
  network?: {
    effectiveType: string;
    downlink: number;
    saveData: boolean;
  };
}

const MobileOptimizedApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // PWA State
  const [pwaCapabilities, setPwaCapabilities] = useState<PWACapabilities>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    isOnline: navigator.onLine,
    hasNotifications: 'Notification' in window,
    hasPushNotifications: 'PushManager' in window,
    hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    hasPeriodicBackgroundSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
    supportsTouchGestures: 'ontouchstart' in window,
    supportsVibration: 'vibrate' in navigator,
    supportsBatteryAPI: 'getBattery' in navigator,
    supportsNetworkInformation: 'connection' in navigator,
  });
  
  // Mobile State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
  });
  
  // Touch and Gesture State
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [activeGestures, setActiveGestures] = useState<TouchGesture[]>([]);
  const [swipeThreshold, setSwipeThreshold] = useState(100);
  const [longPressThreshold, setLongPressThreshold] = useState(500);
  
  // App State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  
  // Refs
  const appRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize PWA features
  useEffect(() => {
    initializePWA();
    registerTouchGestures();
    monitorDeviceInfo();
    
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const initializePWA = async () => {
    // Check if app is installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    setPwaCapabilities(prev => ({
      ...prev,
      isStandalone,
      isInstalled: isStandalone
    }));

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setPwaCapabilities(prev => ({ ...prev, canInstall: true }));
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      setPwaCapabilities(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      toast({
        title: "App Installed",
        description: "PMP Learning Management has been installed successfully!",
      });
    });

    // Monitor online/offline status
    window.addEventListener('online', () => {
      setPwaCapabilities(prev => ({ ...prev, isOnline: true }));
      setOfflineMode(false);
      toast({
        title: "Back Online",
        description: "Syncing your data...",
      });
    });

    window.addEventListener('offline', () => {
      setPwaCapabilities(prev => ({ ...prev, isOnline: false }));
      setOfflineMode(true);
      toast({
        title: "Offline Mode",
        description: "Your progress will be saved locally.",
        variant: "destructive",
      });
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    } else {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const registerTouchGestures = () => {
    if (!appRef.current || !pwaCapabilities.supportsTouchGestures) return;

    const element = appRef.current;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    const startTime = Date.now();
    
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: startTime,
    });

    // Set up long press detection
    touchTimeoutRef.current = setTimeout(() => {
      if (pwaCapabilities.supportsVibration) {
        navigator.vibrate(50); // Short vibration for long press feedback
      }
      
      // Trigger long press gesture
      const gesture: TouchGesture = {
        type: 'longPress',
        startX: touch.clientX,
        startY: touch.clientY,
        endX: touch.clientX,
        endY: touch.clientY,
        duration: longPressThreshold,
        distance: 0,
      };
      
      handleGesture(gesture);
    }, longPressThreshold);
  };

  const handleTouchMove = (e: TouchEvent) => {
    // Clear long press timeout on move
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return;

    // Clear long press timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    const touch = e.changedTouches[0];
    const endTime = Date.now();
    const duration = endTime - touchStart.time;

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Detect tap
    if (duration < 200 && distance < 10) {
      const gesture: TouchGesture = {
        type: 'tap',
        startX: touchStart.x,
        startY: touchStart.y,
        endX: touch.clientX,
        endY: touch.clientY,
        duration,
        distance,
      };
      handleGesture(gesture);
    }
    
    // Detect swipe
    else if (distance > swipeThreshold) {
      let direction: TouchGesture['direction'];
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const gesture: TouchGesture = {
        type: 'swipe',
        direction,
        startX: touchStart.x,
        startY: touchStart.y,
        endX: touch.clientX,
        endY: touch.clientY,
        duration,
        distance,
      };
      
      handleGesture(gesture);
    }

    setTouchStart(null);
  };

  const handleGesture = (gesture: TouchGesture) => {
    setActiveGestures(prev => [...prev.slice(-4), gesture]); // Keep last 5 gestures
    
    // Handle specific gestures
    switch (gesture.type) {
      case 'swipe':
        if (gesture.direction === 'right' && gesture.startX < 50) {
          // Swipe from left edge to open menu
          setIsMobileMenuOpen(true);
        } else if (gesture.direction === 'left' && isMobileMenuOpen) {
          // Swipe left to close menu
          setIsMobileMenuOpen(false);
        }
        break;
        
      case 'longPress':
        // Show context menu or action sheet
        if (pwaCapabilities.supportsVibration) {
          navigator.vibrate([100, 50, 100]); // Double vibration
        }
        break;
    }
  };

  const monitorDeviceInfo = () => {
    // Update device info on resize
    const handleResize = () => {
      setDeviceInfo(prev => ({
        ...prev,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: window.innerWidth > 1024,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      }));
    };

    // Update battery info
    const updateBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setDeviceInfo(prev => ({
            ...prev,
            battery: {
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime,
            }
          }));
        } catch (error) {
          console.log('Battery API not supported');
        }
      }
    };

    // Update network info
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setDeviceInfo(prev => ({
          ...prev,
          network: {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            saveData: connection.saveData,
          }
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    updateBatteryInfo();
    updateNetworkInfo();

    // Update battery and network info periodically
    const interval = setInterval(() => {
      updateBatteryInfo();
      updateNetworkInfo();
    }, 60000); // Every minute

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearInterval(interval);
    };
  };

  const handleInstallApp = async () => {
    if (!installPromptEvent) return;

    try {
      const result = await installPromptEvent.prompt();
      console.log('Install prompt result:', result);
      
      setInstallPromptEvent(null);
      setPwaCapabilities(prev => ({ ...prev, canInstall: false }));
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  const handleShareApp = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'PMP Learning Management',
          text: 'Check out this awesome PMP study app!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "App link copied to clipboard",
      });
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive study reminders and updates",
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const navigation = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'study', label: 'Study', icon: BookOpen, href: '/study' },
    { id: 'collaboration', label: 'Groups', icon: Users, href: '/collaboration' },
    { id: 'progress', label: 'Progress', icon: BarChart3, href: '/progress' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <div ref={appRef} className={`min-h-screen bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="space-y-6">
                {/* User Profile Section */}
                <div className="pb-4 border-b">
                  <h2 className="text-lg font-semibold">PMP Learning</h2>
                  <p className="text-sm text-gray-600">Mobile Study App</p>
                  
                  {/* PWA Status Indicators */}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={pwaCapabilities.isOnline ? "default" : "destructive"} className="flex items-center gap-1">
                      {pwaCapabilities.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      {pwaCapabilities.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                    
                    {pwaCapabilities.isInstalled && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        Installed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        // Navigate to item.href
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                {/* PWA Actions */}
                <div className="space-y-3 pt-4 border-t">
                  {pwaCapabilities.canInstall && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleInstallApp}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShareApp}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share App
                  </Button>
                </div>

                {/* Quick Settings */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Dark Mode</span>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Notifications</span>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={toggleNotifications}
                    />
                  </div>
                </div>

                {/* Device Info */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Device Info</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Screen:</span>
                      <span>{deviceInfo.screenWidth} × {deviceInfo.screenHeight}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Orientation:</span>
                      <span className="capitalize">{deviceInfo.orientation}</span>
                    </div>
                    
                    {deviceInfo.battery && (
                      <div className="flex items-center justify-between">
                        <span>Battery:</span>
                        <div className="flex items-center gap-1">
                          <Battery className="w-3 h-3" />
                          <span>{deviceInfo.battery.level}%</span>
                        </div>
                      </div>
                    )}
                    
                    {deviceInfo.network && (
                      <div className="flex items-center justify-between">
                        <span>Network:</span>
                        <span className="uppercase">{deviceInfo.network.effectiveType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">PMP Learning</h1>
            
            {!pwaCapabilities.isOnline && (
              <Badge variant="destructive" className="text-xs">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {pwaCapabilities.canInstall && (
              <Button variant="ghost" size="sm" onClick={handleInstallApp}>
                <Download className="w-4 h-4" />
              </Button>
            )}
            
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${deviceInfo.isMobile ? 'pb-16' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {deviceInfo.isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex items-center justify-around py-2">
            {navigation.slice(0, 4).map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-1 py-2"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>
      )}

      {/* PWA Update Available Toast */}
      {/* This would be triggered by service worker */}

      {/* Offline Indicator */}
      {offlineMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
          <div className="flex items-center justify-center gap-2 text-sm">
            <WifiOff className="w-4 h-4" />
            You're offline - changes will sync when connection is restored
          </div>
        </div>
      )}

      {/* Install Prompt Banner */}
      {pwaCapabilities.canInstall && !pwaCapabilities.isInstalled && (
        <div className="fixed bottom-16 left-4 right-4 bg-blue-600 text-white rounded-lg p-4 shadow-lg z-40 md:bottom-4 md:right-4 md:left-auto md:w-80">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Install PMP Learning App</h3>
              <p className="text-xs opacity-90 mb-3">
                Get quick access and offline functionality by installing our app
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleInstallApp}>
                  Install
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white"
                  onClick={() => setPwaCapabilities(prev => ({ ...prev, canInstall: false }))}
                >
                  Later
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white p-1"
              onClick={() => setPwaCapabilities(prev => ({ ...prev, canInstall: false }))}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
          <h4 className="font-semibold mb-2">Debug Info</h4>
          <div className="space-y-1">
            <div>PWA: {pwaCapabilities.isInstalled ? 'Installed' : 'Not Installed'}</div>
            <div>Online: {pwaCapabilities.isOnline ? 'Yes' : 'No'}</div>
            <div>Touch: {pwaCapabilities.supportsTouchGestures ? 'Yes' : 'No'}</div>
            <div>Gestures: {activeGestures.length}</div>
            <div>Viewport: {deviceInfo.screenWidth}×{deviceInfo.screenHeight}</div>
            <div>Device: {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedApp;