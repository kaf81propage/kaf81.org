# GA4 Bot Detection and Tracking Guide

## Overview

This module detects and tracks AI bots, crawlers, and automated visitors to your website. It helps you understand:
- Which AI assistants are accessing your site
- Search engine crawler activity
- Social media bot visits
- SEO tool crawls
- Monitoring tool checks

## How It Works

### Detection Method
- **User Agent Analysis**: Analyzes the browser's user agent string
- **Pattern Matching**: Matches against known bot patterns
- **Automatic Tracking**: Sends events to GA4 when bots are detected

### Bot Categories Tracked

1. **AI Bots** (`ai_bot`)
   - ChatGPT, Claude, Perplexity, Copilot, Bard, Gemini, etc.
   - AI assistants that browse the web

2. **Search Engines** (`search_engine`)
   - Googlebot, Bingbot, DuckDuckBot, etc.
   - Search engine crawlers

3. **Social Media Bots** (`social_bot`)
   - Facebook, Twitter, LinkedIn, WhatsApp, etc.
   - Social media link preview bots

4. **SEO Tools** (`seo_tool`)
   - Ahrefs, SEMrush, Moz, etc.
   - SEO analysis tools

5. **Monitoring Tools** (`monitoring_tool`)
   - UptimeRobot, Pingdom, Lighthouse, etc.
   - Website monitoring services

6. **Generic Bots** (`generic_bot`)
   - Any other automated tool or crawler

## Events Tracked

### 1. Bot Visit Event
**Event Name:** `bot_visit`

**Parameters:**
- `bot_category`: Category (ai_bot, search_engine, etc.)
- `bot_type`: Human-readable type (e.g., "AI Assistant")
- `page_path`: Current page path
- `page_title`: Page title
- `page_location`: Full URL
- `user_agent`: User agent string (truncated to 100 chars)
- `is_bot`: Always `true`

### 2. Enhanced Page View Event
**Event Name:** `page_view` (with bot flags)

**Additional Parameters:**
- `visitor_type`: "bot" or "human"
- `bot_category`: Bot category (if bot)
- `bot_type`: Bot type (if bot)

## Configuration

### Enable/Disable Bot Tracking

Edit `js/ga4-bot-tracking.js`:

```javascript
const BOT_CONFIG = {
  trackBots: true,        // Set to false to disable
  debugMode: false,       // Set to true for debugging
  sendBotEvents: true    // Set to false to detect but not track
};
```

### Debug Mode

When `debugMode: true`, you'll see console logs:
```
[GA4 Bot Tracking] Bot visit tracked: {
  category: "ai_bot",
  type: "AI Assistant",
  page: "/apply-online.html"
}
```

## Viewing Bot Data in GA4

### 1. Real-Time Reports
1. Go to GA4 → **Reports** → **Realtime**
2. Look for `bot_visit` events
3. Check `visitor_type` dimension

### 2. Events Report
1. Go to GA4 → **Reports** → **Engagement** → **Events**
2. Find `bot_visit` event
3. Click to see details

### 3. Custom Report
Create a custom report with:
- **Dimensions**: 
  - Event name
  - Bot category
  - Bot type
  - Page path
- **Metrics**:
  - Event count
  - Users (if applicable)

### 4. Exploration Report
1. Go to GA4 → **Explore** → **Blank**
2. Add dimensions:
   - `bot_category`
   - `bot_type`
   - `page_path`
3. Add metric: `Event count`
4. Filter: `Event name = bot_visit`

## Limitations

### What Can Be Tracked
✅ **Bots that execute JavaScript**
- Most modern AI bots (ChatGPT, Claude, etc.)
- Some crawlers with JS enabled
- Social media preview bots

### What Cannot Be Tracked
❌ **Bots that don't execute JavaScript**
- Traditional search engine crawlers (Googlebot, Bingbot)
- Most SEO tools
- Simple HTTP clients (curl, wget)

**Note:** These bots are still detected via user agent, but if they don't execute JavaScript, the tracking event won't fire. This is a limitation of client-side tracking.

## Testing Bot Detection

### Test with Browser Developer Tools

1. Open browser console (F12)
2. Navigate to Network tab
3. Right-click on any request → **Edit and Resend**
4. Modify the `User-Agent` header to simulate a bot:

**Example - Simulate ChatGPT:**
```
User-Agent: Mozilla/5.0 (compatible; ChatGPTBot/1.0; +https://openai.com/gptbot)
```

**Example - Simulate Googlebot:**
```
User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
```

### Test with curl

```bash
# Simulate AI bot
curl -A "ChatGPTBot/1.0" https://kaf81.org/

# Simulate search engine
curl -A "Googlebot/2.1" https://kaf81.org/
```

**Note:** These methods test server-side detection, but GA4 tracking requires JavaScript execution.

### Manual Testing in Console

```javascript
// Check if bot tracking is loaded
typeof window.GA4BotTracking === "object"

// Manually detect bot
window.GA4BotTracking.detect()

// Manually track a bot visit
window.GA4BotTracking.track({
  isBot: true,
  category: 'ai_bot',
  type: 'AI Assistant',
  userAgent: 'ChatGPTBot/1.0'
}, '/test-page.html')
```

## Common Bot User Agents

### AI Bots
- `ChatGPTBot/1.0`
- `ClaudeBot/1.0`
- `PerplexityBot/1.0`
- `anthropic-ai/1.0`
- `Google-Extended`

### Search Engines
- `Googlebot/2.1`
- `Bingbot/2.0`
- `DuckDuckBot/1.0`
- `Baiduspider/2.0`

### Social Media
- `facebookexternalhit/1.1`
- `Twitterbot/1.0`
- `LinkedInBot/1.0`
- `WhatsApp/2.0`

## Privacy Considerations

- **User Agent Data**: User agent strings are truncated to 100 characters
- **No PII**: No personal information is collected
- **Bot Identification Only**: Only identifies bot type, not individual bots
- **Compliant**: Follows GA4 privacy guidelines

## Troubleshooting

### Bot visits not appearing in GA4

1. **Check if bot executes JavaScript**
   - Most traditional crawlers don't execute JS
   - Only modern AI bots and some preview bots do

2. **Verify GA4 script is loaded**
   ```javascript
   typeof gtag === "function"
   ```

3. **Check debug mode**
   - Set `debugMode: true` in config
   - Check browser console for logs

4. **Verify bot detection**
   ```javascript
   window.GA4BotTracking.detect()
   ```

### Too many bot events

- Set `sendBotEvents: false` to detect but not track
- Filter bot events in GA4 reports
- Use GA4 filters to exclude bot traffic from main reports

### False positives

- Some browsers or extensions may be detected as bots
- Review detected bots in GA4
- Adjust patterns in `BOT_PATTERNS` if needed

## File Locations

- **Bot Tracking Code**: `js/ga4-bot-tracking.js`
- **Integration**: Added to all HTML pages in `<head>` section
- **Documentation**: This file

## API Reference

### `window.GA4BotTracking.detect()`
Detects if current visitor is a bot.

**Returns:**
```javascript
{
  isBot: true/false,
  category: 'ai_bot' | 'search_engine' | etc.,
  type: 'AI Assistant' | 'Search Engine Crawler' | etc.,
  userAgent: '...'
}
```

### `window.GA4BotTracking.track(botInfo, pagePath)`
Manually track a bot visit.

**Parameters:**
- `botInfo`: Object with `isBot`, `category`, `type`, `userAgent`
- `pagePath`: Page path (optional, defaults to current path)

### `window.GA4BotTracking.updateConfig(config)`
Update bot tracking configuration.

**Example:**
```javascript
window.GA4BotTracking.updateConfig({
  trackBots: true,
  debugMode: true
});
```

### `window.GA4BotTracking.getConfig()`
Get current configuration.

**Returns:** Current config object

---

**Last Updated:** January 2026  
**Version:** 1.0
