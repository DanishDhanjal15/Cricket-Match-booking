# Quick Start Guide

## 🚀 Your Application is Running!

The development server is currently running at: **http://localhost:5173/**

Open this URL in your browser to see your cricket stadium booking system!

## ⚡ Quick Setup (Before Testing)

### 1. Create `.env` File
Copy the `.env.example` file and rename it to `.env`:
```bash
cp .env.example .env
```

### 2. Add Firebase Credentials

1. Go to https://console.firebase.google.com/
2. Create a new project (or use existing)
3. Go to Project Settings → General → Your apps
4. Add a Web app and copy the config
5. Paste the values into your `.env` file

### 3. Enable Firebase Services

**Authentication:**
- Go to Authentication → Sign-in method
- Enable "Email/Password"

**Firestore:**
- Go to Firestore Database → Create database
- Start in production mode
- Deploy the security rules from `firestore.rules`

### 4. Add Sample Match Data

In Firestore console, create a collection called `matches` and add a document:

```javascript
{
  team1: "India",
  team1Flag: "🇮🇳",
  team2: "Australia", 
  team2Flag: "🇦🇺",
  matchType: "T20",
  venue: "Wankhede Stadium, Mumbai",
  date: new Date("2026-03-15T19:00:00"),  // Use Firestore Timestamp
  basePrice: 1500,
  availableSeats: 500,
  createdAt: new Date()  // Use Firestore Timestamp
}
```

### 5. Setup Razorpay (For Payments)

1. Sign up at https://razorpay.com/
2. Get your Test API keys from Dashboard
3. Add to `.env`:
   ```
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
   VITE_RAZORPAY_KEY_SECRET=xxxxx
   ```

## 🎯 Test the Application

### User Flow:
1. **Sign Up** → Create a new account
2. **Browse Matches** → See the match you added
3. **Select Match** → Click "Book Now"
4. **Choose Seats** → Click on seats to select
5. **Payment** → Use Razorpay test card:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
6. **View Ticket** → Go to "My Tickets" to see QR code

### Admin Flow:
1. **Create Admin** → In Firestore, edit your user document and add:
   ```javascript
   role: "admin"
   ```
2. **Login** → Login with your account
3. **Admin Dashboard** → Click "Admin" in navbar
4. **Scan QR** → Use your phone camera or another device to scan the QR code from your ticket

## 📱 Mobile Testing

The QR scanner works best on mobile devices with cameras. To test:
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access the app from your phone: `http://YOUR_IP:5173`
3. Login as admin and use the QR scanner

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Full Documentation

See [walkthrough.md](file:///C:/Users/Danish/.gemini/antigravity/brain/23a77e91-bf39-4f94-bc46-557518a6d214/walkthrough.md) for complete documentation.

## ⚠️ Important Notes

- The `.env` file is gitignored for security
- Use Razorpay test mode during development
- Firebase security rules are in `firestore.rules`
- Email notifications require EmailJS setup (optional)

## 🎉 You're All Set!

Your cricket stadium booking system is ready to use. Just configure Firebase and Razorpay, add some matches, and start booking!
