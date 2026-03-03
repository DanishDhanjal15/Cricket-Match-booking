# Cricket Stadium Booking System

A comprehensive web application for booking cricket match tickets with QR code generation, Razorpay payment integration, and admin dashboard for ticket verification.....

## Features

### User Features
- 🏏 Browse upcoming cricket matches
- 🎫 Interactive seat selection
- 💳 Secure payment via Razorpay
- 📱 QR code tickets on dashboard
- 📧 Email notifications with tickets
- 👤 User authentication & profile

### Admin Features
- 📷 QR code scanner for ticket verification
- 👥 View user details after scanning
- 🏟️ Match management system
- 📊 Booking statistics

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Firebase account
- Razorpay account (for payment integration)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Firebase credentials
   - Add your Razorpay API keys
   - Add your EmailJS credentials (optional)

3. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Update security rules

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Payment**: Razorpay
- **QR Codes**: qrcode.react, html5-qrcode
- **Email**: EmailJS
- **Routing**: React Router

## Project Structure

```
src/
├── components/
│   ├── Auth/          # Login, Signup
│   ├── Booking/       # Seat selection, booking flow
│   ├── Ticket/        # Ticket display with QR
│   ├── Admin/         # QR scanner, match management
│   └── UI/            # Navbar, Footer, Loading
├── pages/
│   ├── Home.jsx       # Match listings
│   ├── MatchDetails.jsx
│   ├── UserDashboard.jsx
│   └── AdminDashboard.jsx
├── services/
│   ├── firebase.js    # Firebase config
│   ├── firestore.js   # Database operations
│   ├── razorpay.js    # Payment integration
│   ├── qrcode.js      # QR generation
│   └── email.js       # Email service
├── context/
│   └── AuthContext.jsx
└── styles/
    └── index.css
```

## License

MIT
