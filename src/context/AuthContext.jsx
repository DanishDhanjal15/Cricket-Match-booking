import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = async (email, password, userData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const isAdmin = email === import.meta.env.VITE_ADMIN_EMAIL;

            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                name: userData.name,
                phone: userData.phone,
                role: isAdmin ? 'admin' : 'user',
                createdAt: new Date()
            });

            return user;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const fetchUserProfile = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                setUserProfile({ id: userDoc.id, ...userDoc.data() });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        signup,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
