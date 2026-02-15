import { db } from '../config/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';

export const getAllMatches = async () => {
    try {
        const matchesRef = collection(db, 'matches');
        const q = query(matchesRef, orderBy('date', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching matches:', error);
        throw error;
    }
};

export const getMatchById = async (matchId) => {
    try {
        const matchDoc = await getDoc(doc(db, 'matches', matchId));
        if (matchDoc.exists()) {
            return { id: matchDoc.id, ...matchDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching match:', error);
        throw error;
    }
};

export const createBooking = async (bookingData) => {
    try {
        const bookingsRef = collection(db, 'bookings');
        const docRef = await addDoc(bookingsRef, {
            ...bookingData,
            createdAt: Timestamp.now(),
            status: 'pending'
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

export const updateBookingStatus = async (bookingId, status, paymentDetails = {}) => {
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, {
            status,
            ...paymentDetails,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
};

export const getAllBookings = async () => {
    try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('status', '==', 'confirmed')
        );
        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by createdAt desc in memory
        return bookings.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        throw error;
    }
};

export const getUserProfile = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export const getUserBookings = async (userId) => {
    try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by createdAt desc in memory
        return bookings.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
    }
};

export const getBookingById = async (bookingId) => {
    try {
        const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
        if (bookingDoc.exists()) {
            return { id: bookingDoc.id, ...bookingDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
    }
};

export const recordScannedTicket = async (bookingId, scannedBy) => {
    try {
        const scannedTicketsRef = collection(db, 'scannedTickets');
        await addDoc(scannedTicketsRef, {
            bookingId,
            scannedBy,
            scannedAt: Timestamp.now()
        });
    } catch (error) {
        console.error('Error recording scanned ticket:', error);
        throw error;
    }
};

export const checkIfTicketScanned = async (bookingId) => {
    try {
        const scannedTicketsRef = collection(db, 'scannedTickets');
        const q = query(scannedTicketsRef, where('bookingId', '==', bookingId));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking scanned ticket:', error);
        throw error;
    }
};
