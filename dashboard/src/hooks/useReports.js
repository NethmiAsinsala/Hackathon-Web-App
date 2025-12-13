// useReports Hook - Real-time Firestore Listener
// ================================================
// Listens to the 'reports' collection and updates state in real-time

import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'

function useReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('🔌 Connecting to Firebase Firestore...')

    // Reference to the 'reports' collection
    const incidentsRef = collection(db, 'reports')
    
    // Query: order by timestamp descending (newest first)
    const q = query(incidentsRef, orderBy('timestamp', 'desc'))

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const incidentData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))

        console.log('📡 New Data Received:', incidentData.length, 'reports')
        console.log(incidentData)

        setReports(incidentData)
        setLoading(false)
      },
      (err) => {
        console.error('❌ Firebase Error:', err.message)
        setError(err.message)
        setLoading(false)
      }
    )

    // Cleanup: unsubscribe when component unmounts
    return () => {
      console.log('🔌 Disconnecting from Firebase...')
      unsubscribe()
    }
  }, [])

  return { reports, loading, error }
}

export default useReports
