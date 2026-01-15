import React, { useEffect, useState } from 'react';
import { X, Info, AlertTriangle, CheckCircle, Megaphone } from 'lucide-react';
import { queries } from '../../services/sanity';

export const AnnouncementBanner = () => {
  const [settings, setSettings] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await queries.getSiteSettings();
        setSettings(data);
        
        // Check if user has dismissed this specific announcement
        if (data?.announcementBanner?.message) {
          const dismissedKey = `announcement-dismissed-${btoa(data.announcementBanner.message).slice(0, 20)}`;
          const wasDismissed = localStorage.getItem(dismissedKey);
          setIsDismissed(wasDismissed === 'true');
        }
      } catch (error) {
        console.error('Failed to load announcement banner:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleDismiss = () => {
    if (settings?.announcementBanner?.message) {
      const dismissedKey = `announcement-dismissed-${btoa(settings.announcementBanner.message).slice(0, 20)}`;
      localStorage.setItem(dismissedKey, 'true');
      setIsDismissed(true);
    }
  };

  // Don't render if loading, no settings, banner disabled, or dismissed
  if (loading || !settings?.announcementBanner?.enabled || isDismissed) {
    return null;
  }

  const { message, link, variant = 'info' } = settings.announcementBanner;

  // Variant configurations
  const variantConfig = {
    info: {
      bg: 'bg-gradient-to-r from-blue-900/90 to-indigo-900/90',
      border: 'border-blue-500/50',
      text: 'text-blue-100',
      icon: Info,
      iconColor: 'text-blue-300'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-900/90 to-orange-900/90',
      border: 'border-yellow-500/50',
      text: 'text-yellow-100',
      icon: AlertTriangle,
      iconColor: 'text-yellow-300'
    },
    success: {
      bg: 'bg-gradient-to-r from-green-900/90 to-emerald-900/90',
      border: 'border-green-500/50',
      text: 'text-green-100',
      icon: CheckCircle,
      iconColor: 'text-green-300'
    }
  };

  const config = variantConfig[variant] || variantConfig.info;
  const Icon = config.icon;

  const BannerContent = () => (
    <div className="flex items-center justify-center gap-3 flex-1 min-w-0 px-4">
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <p className={`${config.text} font-semibold text-sm md:text-base text-center`}>
        {message}
      </p>
    </div>
  );

  return (
    <div className={`sticky top-16 z-40 ${config.bg} backdrop-blur-md border-b ${config.border} shadow-lg animate-slideDown`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4">
          {link ? (
            <a
              href={link}
              target={link.startsWith('http') ? '_blank' : '_self'}
              rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-center gap-3 flex-1 min-w-0 px-4 hover:opacity-80 transition-opacity"
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
              <p className={`${config.text} font-semibold text-sm md:text-base text-center underline decoration-dotted underline-offset-4`}>
                {message}
              </p>
            </a>
          ) : (
            <BannerContent />
          )}
          
          <button
            onClick={handleDismiss}
            className={`${config.text} hover:opacity-70 transition-opacity flex-shrink-0 p-1 rounded-full hover:bg-white/10`}
            aria-label="Dismiss announcement"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};