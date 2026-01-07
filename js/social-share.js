// Embedded Config for reliability
const socialMediaConfig = {
  "appInfo": {
    "name": "Singapore Inflation Survivor",
    "website": "https://survivingsgdinflation.com",
    "hashtag": "#SingaporeInflationSurvivor",
    "defaultCampaign": "badge_achievement"
  },
  "socialPlatforms": {
    "whatsapp": {
      "baseUrl": "https://wa.me/?text=",
      "utmParams": "utm_source=whatsapp&utm_medium=social&utm_campaign=badge_share",
      "messageTemplate": "I just earned the {{badgeName}} badge in Singapore Inflation Survivor! {{url}}"
    },
    "facebook": {
      "baseUrl": "https://www.facebook.com/sharer/sharer.php?u=",
      "utmParams": "utm_source=facebook&utm_medium=social&utm_campaign=badge_share",
      "quote": "I survived Singapore inflation!",
      "hashtag": "#SingaporeInflationSurvivor"
    },
    "twitter": {
      "baseUrl": "https://twitter.com/intent/tweet?text=",
      "utmParams": "utm_source=twitter&utm_medium=social&utm_campaign=badge_share",
      "messageTemplate": "Just earned {{badgeName}} in Singapore Inflation Survivor! {{url}} #SingaporeInflationSurvivor"
    },
    "telegram": {
      "baseUrl": "https://t.me/share/url?url=",
      "utmParams": "utm_source=telegram&utm_medium=social&utm_campaign=badge_share",
      "messageTemplate": "Check out my achievement: {{badgeName}}"
    },
    "linkedin": {
      "baseUrl": "https://www.linkedin.com/sharing/share-offsite/?url=",
      "utmParams": "utm_source=linkedin&utm_medium=social&utm_campaign=badge_share"
    },
    "copyLink": {
      "utmParams": "utm_source=copy_link&utm_medium=direct&utm_campaign=badge_share",
      "messageTemplate": "I earned the {{badgeName}} badge in Singapore Inflation Survivor!"
    }
  },
  "badgeTemplates": {
    "default": { "id": "default", "shareMessage": "Check out my financial progress!", "urlPath": "/" }
  },
  "localization": {
    "en_SG": {
      "shareTitle": "I earned a badge!",
      "hashtags": "#SingaporeInflationSurvivor #PersonalFinanceSG"
    }
  }
};

class SocialShare {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.appInfo.website;
  }

  generateShareUrl(badgeId, platform) {
    const badge = this.config.badgeTemplates[badgeId] || this.config.badgeTemplates.default;
    const platformConfig = this.config.socialPlatforms[platform];
    
    // SAFETY CHECK: If platform config is missing, return a safe default
    if (!badge || !platformConfig) return encodeURIComponent(this.baseUrl);

    const urlPath = badge.urlPath || '/';
    let url = `${this.baseUrl}${urlPath}?${platformConfig.utmParams}`;
    return encodeURIComponent(url);
  }

  generateShareMessage(badgeName, platform) {
    const platformConfig = this.config.socialPlatforms[platform];
    const localization = this.config.localization.en_SG;
    
    // SAFETY CHECK: If platform config or template is missing, use fallback
    let message = `I earned the ${badgeName} badge! ${localization.hashtags}`;
    
    if (platformConfig && platformConfig.messageTemplate) {
        message = platformConfig.messageTemplate;
        message = message.replace('{{badgeName}}', badgeName);
        message = message.replace('{{url}}', this.baseUrl);
        message = message.replace('{{hashtags}}', localization.hashtags);
    }
    
    return message;
  }

  shareToPlatform(badgeName, platform) {
    const url = this.generateShareUrl('default', platform);
    const message = this.generateShareMessage(badgeName, platform);
    const platformConfig = this.config.socialPlatforms[platform];
    
    // SAFETY CHECK: If platform is missing, warn user
    if (!platformConfig) {
        showToast("⚠️ Platform not configured yet.");
        return;
    }
    
    let shareUrl;
    
    switch(platform) {
      case 'whatsapp':
        shareUrl = `${platformConfig.baseUrl}${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `${platformConfig.baseUrl}${url}&quote=${encodeURIComponent(platformConfig.quote)}&hashtag=${encodeURIComponent(platformConfig.hashtag)}`;
        break;
      case 'twitter':
        shareUrl = `${platformConfig.baseUrl}${encodeURIComponent(message)}`;
        break;
      case 'telegram':
        shareUrl = `${platformConfig.baseUrl}${url}&text=${encodeURIComponent(message)}`;
        break;
      case 'linkedin':
        shareUrl = `${platformConfig.baseUrl}${url}`;
        break;
      case 'copyLink':
        navigator.clipboard.writeText(`${message}\n\n${this.baseUrl}`);
        showToast("Link copied to clipboard!");
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}