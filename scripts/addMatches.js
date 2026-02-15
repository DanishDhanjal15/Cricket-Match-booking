import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Your Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample matches data
const matches = [
    {
        team1: "India",
        team1Flag: "🇮🇳",
        team2: "Australia",
        team2Flag: "🇦🇺",
        matchType: "T20",
        venue: "Wankhede Stadium, Mumbai",
        date: Timestamp.fromDate(new Date("2026-02-20T19:00:00")),
        basePrice: 1500,
        availableSeats: 500,
        createdAt: Timestamp.now()
    },
    {
        team1: "India",
        team1Flag: "🇮🇳",
        team2: "England",
        team2Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        matchType: "ODI",
        venue: "Eden Gardens, Kolkata",
        date: Timestamp.fromDate(new Date("2026-02-25T14:00:00")),
        basePrice: 2000,
        availableSeats: 600,
        createdAt: Timestamp.now()
    },
    {
        team1: "India",
        team1Flag: "🇮🇳",
        team2: "South Africa",
        team2Flag: "🇿🇦",
        matchType: "T20",
        venue: "M. Chinnaswamy Stadium, Bangalore",
        date: Timestamp.fromDate(new Date("2026-03-01T19:30:00")),
        basePrice: 1800,
        availableSeats: 450,
        createdAt: Timestamp.now()
    }
];

// Add matches to Firestore
async function addMatches() {
    try {
        console.log('Adding matches to Firestore...');

        for (const match of matches) {
            const docRef = await addDoc(collection(db, 'matches'), match);
            console.log(`✅ Match added: ${match.team1} vs ${match.team2} (ID: ${docRef.id})`);
        }

        console.log('\n🎉 All matches added successfully!');
        console.log('Refresh your browser at http://localhost:5173/ to see them!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding matches:', error);
        process.exit(1);
    }
}

addMatches();
