import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD9hDVj2Ld1gH_S3CMU1I8HHRRLHPmN5-Y",
    authDomain: "booking-project-c0008.firebaseapp.com",
    projectId: "booking-project-c0008",
    storageBucket: "booking-project-c0008.firebasestorage.app",
    messagingSenderId: "144186783175",
    appId: "1:144186783175:web:9668d5183e11bb723055e2"
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
