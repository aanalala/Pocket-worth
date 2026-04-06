import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, orderBy, limit, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useUserData() {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user && db) {
        // 1. User Profile Sync
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Default settings if they don't exist
            if (data.isDarkMode === undefined || data.currency === undefined) {
              setDoc(userDocRef, { isDarkMode: false, currency: "USD" }, { merge: true });
            }
            setUserData(data);
          }
        }, (err) => console.error("User sync error:", err));

        // 2. Transactions Sync (Recent 50)
        const transRef = collection(db, "users", user.uid, "transactions");
        const transQuery = query(transRef, orderBy("date", "desc"), limit(50));
        const unsubscribeTrans = onSnapshot(transQuery, (querySnap) => {
          const transList = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTransactions(transList);
        }, (err) => console.error("Trans sync error:", err));

        // 3. Goals Sync
        const goalsRef = collection(db, "users", user.uid, "goals");
        const unsubscribeGoals = onSnapshot(goalsRef, (querySnap) => {
          const goalsList = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setGoals(goalsList);
          setLoading(false);
        }, (err) => {
          console.error("Goals sync error:", err);
          setLoading(false);
        });

        return () => {
          unsubscribeUser();
          unsubscribeTrans();
          unsubscribeGoals();
        };
      } else {
        setUserData(null);
        setTransactions([]);
        setGoals([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { userData, transactions, goals, loading, error };
}
