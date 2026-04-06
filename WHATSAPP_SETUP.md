# WhatsApp Integration for Cosmic AI

## 📱 How to Connect WhatsApp to Your API

### Prerequisites
1. **WhatsApp Business Account**: You need a verified WhatsApp Business account
2. **Meta Developer Account**: Create account at developers.facebook.com
3. **Phone Number**: A dedicated phone number for WhatsApp Business

### Step 1: Setup WhatsApp Business API

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Add "WhatsApp" product to your app
4. Configure WhatsApp settings:
   - Webhook URL: `https://your-domain.com/api/whatsapp`
   - Verify Token: Set a secure token
   - Access Token: Generate and copy

### Step 2: Update Environment Variables

Add these to your `.env` file:

```bash
# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN='your_whatsapp_access_token_here'
WHATSAPP_WEBHOOK_VERIFY_TOKEN='your_webhook_verify_token_here'
WHATSAPP_PHONE_NUMBER_ID='your_phone_number_id_here'
```

### Step 3: Deploy and Configure

1. Deploy your app to Vercel/Netlify/etc.
2. Update webhook URL in Meta Dashboard to your deployed URL
3. Test webhook verification

### Step 4: Start Chatting

Users can now:
1. **Save your number** in their contacts
2. **Send messages** like:
   - "What's my zodiac sign?"
   - "Tell me about my career"
   - "What should I focus on this month?"
3. **Receive instant AI-powered astrology responses**

## 🔄 Message Flow

```
User WhatsApp → Meta API → Your Webhook → Astrology API → Response → User WhatsApp
```

## 📝 Example Commands

- `"career advice"` - Get career guidance
- `"love compatibility"` - Relationship insights  
- `"daily prediction"` - Today's forecast
- `"lucky color"` - Your lucky color
- Any natural question about astrology

## 🔧 Testing Locally

Use ngrok for local testing:

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# Expose port 3000
ngrok http 3000

# Use the ngrok URL in your webhook configuration
```

## 📞 WhatsApp Message Format

Incoming webhook payload:
```json
{
  "From": "whatsapp:+1234567890",
  "Body": "What career is good for me?",
  "FromUserName": "John"
}
```

Response format:
```json
{
  "messaging_product": "whatsapp",
  "to": "whatsapp:+1234567890", 
  "type": "text",
  "text": "Based on your birth chart..."
}
```

## 🚀 Production Considerations

1. **Rate Limiting**: Implement message rate limits
2. **User Data**: Store user preferences/birth data
3. **Error Handling**: Graceful fallbacks
4. **Security**: Validate webhook signatures
5. **Scalability**: Consider message queues

## 📊 Monitoring

Monitor:
- Webhook delivery rates
- API response times  
- Error rates
- User engagement metrics

## 💰 Costs

- WhatsApp Business API: ~$0.005 per message
- Your hosting: Vercel/Netlify fees
- Astrology API: Per-call pricing

## 🔐 Security

1. Always verify webhook requests
2. Use HTTPS for webhooks
3. Secure your access tokens
4. Implement rate limiting
5. Log all interactions for debugging
