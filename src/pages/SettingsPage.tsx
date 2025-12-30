import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Smartphone,
  LogOut,
  ChevronRight,
  User,
  CreditCard,
  MapPin,
  HelpCircle,
  FileText,
  Lock,
  Mail,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Breadcrumb,
  Select,
} from '@/components/ui';
import { useAuthStore, useUIStore } from '@/stores';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  
  // Local state for settings
  const [settings, setSettings] = useState({
    notifications: {
      orders: true,
      messages: true,
      promotions: false,
      email: true,
      push: true,
    },
    privacy: {
      showOnline: true,
      showLastSeen: false,
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSetting = (category: string, key: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...(prev as Record<string, Record<string, boolean>>)[category],
        [key]: !(prev as Record<string, Record<string, boolean>>)[category][key],
      },
    }));
  };

  if (!isAuthenticated) {
    navigate('/login?redirect=/settings');
    return null;
  }

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          label: 'Edit Profile',
          description: 'Update your personal information',
          icon: User,
          type: 'link' as const,
          path: '/profile',
        },
        {
          id: 'security',
          label: 'Security',
          description: 'Password, 2FA, and login settings',
          icon: Shield,
          type: 'link' as const,
          path: '/settings/security',
          badge: user?.twoFactorEnabled ? '2FA Enabled' : undefined,
        },
        {
          id: 'addresses',
          label: 'Addresses',
          description: 'Manage your delivery addresses',
          icon: MapPin,
          type: 'link' as const,
          path: '/addresses',
        },
        {
          id: 'payments',
          label: 'Payment Methods',
          description: 'Manage your payment options',
          icon: CreditCard,
          type: 'link' as const,
          path: '/payments',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'theme',
          label: 'Theme',
          description: 'Choose light or dark mode',
          icon: theme === 'dark' ? Moon : Sun,
          type: 'select' as const,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ],
          currentValue: theme,
        },
        {
          id: 'language',
          label: 'Language',
          description: 'Choose your preferred language',
          icon: Globe,
          type: 'select' as const,
          options: [
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
          ],
          currentValue: 'en',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'orders',
          label: 'Order Updates',
          description: 'Get notified about order status changes',
          icon: Bell,
          type: 'toggle' as const,
          value: settings.notifications.orders,
        },
        {
          id: 'messages',
          label: 'Messages',
          description: 'New messages from sellers',
          icon: Mail,
          type: 'toggle' as const,
          value: settings.notifications.messages,
        },
        {
          id: 'promotions',
          label: 'Promotions',
          description: 'Deals, discounts, and offers',
          icon: Bell,
          type: 'toggle' as const,
          value: settings.notifications.promotions,
        },
        {
          id: 'push',
          label: 'Push Notifications',
          description: 'Receive notifications on your device',
          icon: Smartphone,
          type: 'toggle' as const,
          value: settings.notifications.push,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          id: 'showOnline',
          label: 'Show Online Status',
          description: 'Let sellers see when you are online',
          icon: Lock,
          type: 'toggle' as const,
          value: settings.privacy.showOnline,
        },
        {
          id: 'showLastSeen',
          label: 'Show Last Seen',
          description: 'Display when you were last active',
          icon: Lock,
          type: 'toggle' as const,
          value: settings.privacy.showLastSeen,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Help Center',
          description: 'FAQs and support articles',
          icon: HelpCircle,
          type: 'link' as const,
          path: '/help',
        },
        {
          id: 'terms',
          label: 'Terms of Service',
          icon: FileText,
          type: 'link' as const,
          path: '/terms',
        },
        {
          id: 'privacy',
          label: 'Privacy Policy',
          icon: FileText,
          type: 'link' as const,
          path: '/privacy',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Profile', href: '/profile' },
          { label: 'Settings' },
        ]}
        className="mb-6"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.label}</p>
                          {'badge' in item && item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {item.type === 'link' && item.path && (
                      <Link to={item.path}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    )}

                    {item.type === 'toggle' && (
                      <button
                        onClick={() => {
                          if (section.title === 'Notifications') {
                            toggleSetting('notifications', item.id);
                          } else if (section.title === 'Privacy') {
                            toggleSetting('privacy', item.id);
                          }
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          item.value ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            item.value ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    )}

                    {item.type === 'select' && item.options && (
                      <Select
                        value={item.currentValue}
                        onChange={(e) => {
                          if (item.id === 'theme') {
                            setTheme(e.target.value as 'light' | 'dark' | 'system');
                          }
                        }}
                        className="w-32"
                        options={item.options}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* App Info */}
        <div className="text-center py-6 text-sm text-muted-foreground">
          <p>Campuzon v1.0.0</p>
          <p className="mt-1">© 2024 Campuzon. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
