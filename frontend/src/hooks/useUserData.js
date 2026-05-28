import { useState, useEffect } from "react";
import { doc, onSnapshot, collection, query, orderBy, limit, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useUserData() {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);


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
          } else {
            // New user (Guest or first login) - Initialize with 0 values
            const initialData = {
              uid: user.uid,
              email: user.email || "Guest",
              displayName: user.displayName || "Guest User",
              balance: 0,
              income: 0,
              expenses: 0,
              isDarkMode: false,
              currency: "USD",
              createdAt: new Date().toISOString()
            };
            setDoc(userDocRef, initialData);
            setUserData(initialData);
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
        }, (err) => console.error("Goals sync error:", err));

        // 4. Subscriptions Sync
        const subsRef = collection(db, "users", user.uid, "subscriptions");
        const unsubscribeSubs = onSnapshot(subsRef, (querySnap) => {
          const subsList = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSubscriptions(subsList);
        }, (err) => console.error("Subs sync error:", err));

        // 5. Bills Sync
        const billsRef = collection(db, "users", user.uid, "bills");
        const unsubscribeBills = onSnapshot(billsRef, (querySnap) => {
          const billsList = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBills(billsList);
        }, (err) => console.error("Bills sync error:", err));

        // 6. Budgets Sync
        const budgetsRef = collection(db, "users", user.uid, "budgets");
        const unsubscribeBudgets = onSnapshot(budgetsRef, (querySnap) => {
          const budgetsList = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBudgets(budgetsList);
          setLoading(false);
        }, (err) => {
          console.error("Budgets sync error:", err);
          setLoading(false);
        });

        return () => {
          unsubscribeUser();
          unsubscribeTrans();
          unsubscribeGoals();
          unsubscribeSubs();
          unsubscribeBills();
          unsubscribeBudgets();
        };
      } else {
        setUserData(null);
        setTransactions([]);
        setGoals([]);
        setSubscriptions([]);
        setBills([]);
        setBudgets([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { userData, transactions, goals, subscriptions, bills, budgets, loading };
}

