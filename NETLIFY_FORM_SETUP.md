# 📧 Netlify Form Notifications Setup Guide

## ✅ Form Code is Ready!

I've updated your contact form to work with Netlify Forms. Now you just need to configure email notifications in your Netlify dashboard.

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Deploy Your Site to Netlify

1. **Push to GitHub** (already done!)
   ```bash
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select your `shackpck` repository
   - Configure build settings:
     - **Base directory:** `coins`
     - **Build command:** `npm run build`
     - **Publish directory:** `out`
   - Click "Deploy site"

3. **Wait for deployment** (usually 2-5 minutes)

---

### Step 2: Verify Form Detection

After your site deploys:

1. Go to your Netlify site dashboard
2. Click **"Forms"** in the left sidebar
3. You should see a form named **"contact"**
4. If you don't see it, wait a few minutes and refresh - Netlify needs to crawl your deployed site

**Note:** The form will only appear after your site is deployed and Netlify has detected the form HTML.

---

### Step 3: Set Up Email Notifications

Once the form appears in Netlify:

1. **In Netlify Dashboard:**
   - Go to **Site Settings** (top navigation)
   - Click **"Forms"** in the left sidebar
   - Scroll down to **"Form notifications"**
   - Click **"Add notification"**

2. **Choose Email Notification:**
   - Select **"Email notification"**
   - Enter your email address (where you want to receive notifications)
   - Choose the form: **"contact"**
   - Configure the email template (optional)
   - Click **"Save"**

3. **Test It:**
   - Visit your live website
   - Go to the Contact page
   - Fill out and submit the form
   - Check your email inbox!

---

## 📧 Email Notification Options

### Option 1: Simple Email Notification (FREE)
- Get an email every time someone submits the form
- Includes all form fields in the email
- Free on all Netlify plans

### Option 2: Slack Notification
- Send form submissions to a Slack channel
- Good for team collaboration
- Setup: Forms → Add notification → Slack

### Option 3: Webhook
- Send form data to a custom endpoint
- For advanced integrations
- Setup: Forms → Add notification → Webhook

---

## 🎯 What the Email Will Look Like

When someone submits your contact form, you'll receive an email like:

```
New form submission from: contact

Name: John Smith
Email: john@example.com
Subject: Order Inquiry
Message: I have a question about the Shackpack Deluxe...
```

---

## 🔍 View All Submissions

You can always view all form submissions in Netlify:

1. Go to your Netlify dashboard
2. Click **"Forms"** in the sidebar
3. Click on the **"contact"** form
4. See all submissions with timestamps
5. Export as CSV if needed

---

## 🛡️ Spam Protection

Netlify includes built-in spam filtering, but you can add more protection:

1. **In Netlify Dashboard:**
   - Go to Site Settings → Forms
   - Enable **"Spam filtering"** (free)
   - Optionally add **"Akismet"** integration (requires Akismet API key)

2. **Add reCAPTCHA (optional):**
   - Go to Site Settings → Forms
   - Click "Add reCAPTCHA"
   - Enter your reCAPTCHA keys
   - I can help you add reCAPTCHA to the form if needed

---

## ⚙️ Advanced Settings

### Multiple Email Recipients

To send to multiple email addresses:
1. Forms → Add notification → Email
2. Add multiple emails separated by commas:
   ```
   you@email.com, assistant@email.com, sales@email.com
   ```

### Custom Email Subject Line

You can customize the subject line of notification emails:
1. When setting up email notification
2. Use field names in double curly braces:
   ```
   New Contact: {{subject}} from {{name}}
   ```
   Result: "New Contact: Order Inquiry from John Smith"

### Autoresponder (Pro Feature)

Send automatic reply to form submitters:
1. Requires Netlify Pro plan
2. Forms → Add notification → Outbound webhook
3. Configure autoresponder email template

---

## 🐛 Troubleshooting

### Form not showing in Netlify?
- Make sure your site is deployed successfully
- Wait 5-10 minutes after deployment
- Check that the form has `name="contact"` and `netlify="true"` attributes
- The form MUST be in the deployed HTML (the hidden form handles this)

### Not receiving emails?
- Check your spam folder
- Verify email address in notification settings
- Test form submission again
- Check "Forms" section to see if submissions are being recorded

### Form submission fails?
- Check browser console for errors
- Make sure you're testing on the live Netlify URL (not localhost)
- Verify form name matches: `form-name: 'contact'`

---

## 📊 Form Analytics

Netlify automatically tracks:
- Total submissions
- Submissions over time
- Most common form fields
- Spam blocked

View in: Dashboard → Forms → contact → View submissions

---

## 💡 Quick Setup Checklist

- [ ] Site deployed to Netlify
- [ ] Form appears in Netlify Forms section
- [ ] Email notification configured with your email
- [ ] Test submission sent
- [ ] Email received successfully
- [ ] Spam protection enabled

---

## 🎉 You're All Set!

Once you complete these steps:
1. Visitors fill out your contact form
2. You receive an instant email notification
3. You can respond to them directly
4. All submissions are stored in Netlify for reference

**Need help?** Let me know and I can guide you through any step!

---

## 📞 Your Netlify Deploy Settings

For reference, here's what to use when setting up:

**Repository:** https://github.com/zfrey55/shackpck
**Base directory:** `coins`
**Build command:** `npm run build`
**Publish directory:** `out`
**Node version:** 20.x (or latest LTS)

---

## 🔗 Useful Links

- [Netlify Forms Documentation](https://docs.netlify.com/forms/setup/)
- [Netlify Form Notifications](https://docs.netlify.com/forms/notifications/)
- [Netlify Dashboard](https://app.netlify.com)

