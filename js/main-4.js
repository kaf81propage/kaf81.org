// Google Analytics 4 (GA4) Bot Detection and Tracking
// Detects and tracks AI bots, crawlers, and automated visitors

(function() {
  'use strict';

  // Bot detection configuration
  const BOT_CONFIG = {
    trackBots: true,
    debugMode: false, // Set to false in production
    sendBotEvents: true
  };

  /**
   * Bot patterns - Common AI bots, crawlers, and automated tools
   * Includes: AI assistants, search engine crawlers, social media bots, etc.
   */
  const BOT_PATTERNS = {
    // AI Assistants and LLM Bots
    aiBots: [
      /chatgpt/i,
      /claude/i,
      /anthropic/i,
      /openai/i,
      /gpt/i,
      /perplexity/i,
      /copilot/i,
      /bard/i,
      /gemini/i,
      /bing.*ai/i,
      /you\.com/i,
      /character\.ai/i,
      /poe/i,
      /llama/i,
      /mistral/i,
      /ai.*assistant/i,
      /language.*model/i
    ],
    
    // Search Engine Crawlers
    searchEngines: [
      /googlebot/i,
      /bingbot/i,
      /slurp/i, // Yahoo
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /sogou/i,
      /exabot/i,
      /facebot/i, // Facebook
      /ia_archiver/i, // Internet Archive
      /archive\.org/i
    ],
    
    // Social Media Bots
    socialBots: [
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i,
      /telegrambot/i,
      /discordbot/i,
      /slackbot/i,
      /pinterest/i,
      /redditbot/i
    ],
    
    // SEO and Analytics Tools
    seoTools: [
      /ahrefsbot/i,
      /semrushbot/i,
      /moz\.com/i,
      /majestic/i,
      /dotbot/i,
      /blexbot/i,
      /petalbot/i,
      /applebot/i,
      /bingpreview/i,
      /msnbot/i
    ],
    
    // Monitoring and Testing Tools
    monitoringTools: [
      /uptimerobot/i,
      /pingdom/i,
      /newrelic/i,
      /datadog/i,
      /sentry/i,
      /lighthouse/i,
      /pagespeed/i,
      /gtmetrix/i,
      /webpagetest/i
    ],
    
    // Generic Bot Patterns
    genericBots: [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /fetcher/i,
      /indexer/i,
      /headless/i,
      /phantom/i,
      /selenium/i,
      /puppeteer/i,
      /playwright/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /go-http-client/i,
      /java\/\d/i,
      /httpclient/i
    ]
  };

  /**
   * Get user agent string
   * @returns {string} - User agent string or empty string
   */
  function getUserAgent() {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent;
    }
    return '';
  }

  /**
   * Detect if visitor is a bot
   * @returns {Object} - Bot detection result with category and type
   */
  function detectBot() {
    const userAgent = getUserAgent();
    
    if (!userAgent) {
      return { isBot: false, category: null, type: null, userAgent: '' };
    }

    // Check AI bots
    for (let i = 0; i < BOT_PATTERNS.aiBots.length; i++) {
      if (BOT_PATTERNS.aiBots[i].test(userAgent)) {
        return {
          isBot: true,
          category: 'ai_bot',
          type: 'AI Assistant',
          userAgent: userAgent
        };
      }
    }

    // Check search engines
    for (let i = 0; i < BOT_PATTERNS.searchEngines.length; i++) {
      if (BOT_PATTERNS.searchEngines[i].test(userAgent)) {
        return {
          isBot: true,
          category: 'search_engine',
          type: 'Search Engine Crawler',
          userAgent: userAgent
        };
      }
    }

    // Check social media bots
    for (let i = 0; i < BOT_PATTERNS.socialBots.length; i++) {
      if (BOT_PATTERNS.socialBots[i].test(userAgent)) {
        return {
          isBot: true,
          category: 'social_bot',
          type: 'Social Media Bot',
          userAgent: userAgent
        };
      }
    }

    // Check SEO tools
    for (let i = 0; i < BOT_PATTERNS.seoTools.length; i++) {
      if (BOT_PATTERNS.seoTools[i].test(userAgent)) {
        return {
          isBot: true,
          category: 'seo_tool',
          type: 'SEO Tool',
          userAgent: userAgent
        };
      }
    }

    // Check monitoring tools
    for (let i = 0; i < BOT_PATTERNS.monitoringTools.length; i++) {
      if (BOT_PATTERNS.monitoringTools[i].test(userAgent)) {
        return {
          isBot: true,
          category: 'monitoring_tool',
          type: 'Monitoring Tool',
          userAgent: userAgent
        };
      }
    }

    // Check generic bots (last, as it's most generic)
    for (let i = 0; i < BOT_PATTERNS.genericBots.length; i++) {
      if (BOT_PATTERNS.genericBots[i].test(userAgent)) {
        return {
          isBot: true,
          category: 'generic_bot',
          type: 'Generic Bot',
          userAgent: userAgent
        };
      }
    }

    return { isBot: false, category: null, type: null, userAgent: userAgent };
  }

  /**
   * Check if gtag is available
   * @returns {boolean} - True if gtag is loaded
   */
  function isGtagAvailable() {
    return typeof window.gtag === 'function';
  }

  /**
   * Send bot visit event to GA4
   * @param {Object} botInfo - Bot detection information
   * @param {string} pagePath - Current page path
   */
  function trackBotVisit(botInfo, pagePath) {
    if (!BOT_CONFIG.trackBots || !BOT_CONFIG.sendBotEvents) {
      return;
    }

    if (!isGtagAvailable()) {
      if (BOT_CONFIG.debugMode) {
        console.log('[GA4 Bot Tracking] gtag not available, bot visit not tracked');
      }
      return;
    }

    try {
      // Send bot visit event
      window.gtag('event', 'bot_visit', {
        bot_category: botInfo.category,
        bot_type: botInfo.type,
        page_path: pagePath || window.location.pathname,
        page_title: document.title || '',
        page_location: window.location.href,
        user_agent: botInfo.userAgent.substring(0, 100), // Limit length
        is_bot: true,
        debug_mode: BOT_CONFIG.debugMode
      });

      // Also send a page_view event with bot flag
      window.gtag('event', 'page_view', {
        page_path: pagePath || window.location.pathname,
        page_title: document.title || '',
        page_location: window.location.href,
        visitor_type: 'bot',
        bot_category: botInfo.category,
        bot_type: botInfo.type
      });

      if (BOT_CONFIG.debugMode) {
        console.log('[GA4 Bot Tracking] Bot visit tracked:', {
          category: botInfo.category,
          type: botInfo.type,
          page: pagePath || window.location.pathname
        });
      }
    } catch (error) {
      console.error('[GA4 Bot Tracking] Error tracking bot visit:', error);
    }
  }

  /**
   * Track human visitor (for comparison)
   * @param {string} pagePath - Current page path
   */
  function trackHumanVisit(pagePath) {
    if (!isGtagAvailable()) {
      return;
    }

    try {
      // Send human visitor event (optional, for comparison)
      window.gtag('event', 'page_view', {
        page_path: pagePath || window.location.pathname,
        page_title: document.title || '',
        page_location: window.location.href,
        visitor_type: 'human'
      });

      if (BOT_CONFIG.debugMode) {
        console.log('[GA4 Bot Tracking] Human visitor tracked');
      }
    } catch (error) {
      console.error('[GA4 Bot Tracking] Error tracking human visit:', error);
    }
  }

  /**
   * Initialize bot detection and tracking
   */
  function initBotTracking() {
    if (!BOT_CONFIG.trackBots) {
      return;
    }

    const botInfo = detectBot();
    const pagePath = window.location.pathname;

    if (botInfo.isBot) {
      trackBotVisit(botInfo, pagePath);
    } else {
      // Track human visitors (optional, can be disabled)
      // Uncomment the line below if you want to track human vs bot separately
      // trackHumanVisit(pagePath);
    }
  }

  /**
   * Public API
   */
  window.GA4BotTracking = {
    /**
     * Detect if current visitor is a bot
     * @returns {Object} - Bot detection result
     */
    detect: function() {
      return detectBot();
    },

    /**
     * Manually track a bot visit
     * @param {Object} botInfo - Bot information
     * @param {string} pagePath - Page path
     */
    track: function(botInfo, pagePath) {
      trackBotVisit(botInfo, pagePath);
    },

    /**
     * Update bot tracking configuration
     * @param {Object} config - Configuration object
     */
    updateConfig: function(config) {
      Object.assign(BOT_CONFIG, config);
    },

    /**
     * Get current configuration
     * @returns {Object} - Current configuration
     */
    getConfig: function() {
      return { ...BOT_CONFIG };
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBotTracking);
  } else {
    // DOM already loaded
    initBotTracking();
  }
})();
