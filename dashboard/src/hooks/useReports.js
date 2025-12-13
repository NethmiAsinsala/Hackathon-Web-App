// useReports Hook - Real-time Firestore Listener
// ================================================
// Listens to the 'reports' collection and updates state in real-time

import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'

function useReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newReport, setNewReport] = useState(null) // Track newest report for alerts
  
  const previousIdsRef = useRef(new Set())
  const isFirstLoadRef = useRef(true)

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

        console.log('📡 Data update received:', incidentData.length, 'reports')

        // Detect NEW reports only (not modifications, not first load)
        if (!isFirstLoadRef.current) {
          // Check for actual document additions using docChanges
          const addedDocs = snapshot.docChanges().filter(change => change.type === 'added')
          
          if (addedDocs.length > 0) {
            // Get the first added document (newest)
            const newDoc = addedDocs[0].doc
            const latestNew = { id: newDoc.id, ...newDoc.data() }
            
            console.log('🆕 NEW report added:', latestNew.type, latestNew.severity)
            setNewReport(latestNew)
            
            // Clear newReport after 5 seconds
            setTimeout(() => setNewReport(null), 5000)
          }
        } else {
          // First load - don't trigger alerts
          console.log('📋 Initial load complete')
          isFirstLoadRef.current = false
        }

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

  // Function to update report status in Firestore
  const updateReportStatus = useCallback(async (reportId, newStatus) => {
    try {
      console.log(`📝 Updating report ${reportId} to status: ${newStatus}`)
      const reportRef = doc(db, 'reports', reportId)
      await updateDoc(reportRef, { 
        status: newStatus,
        updatedAt: new Date()
      })
      console.log('✅ Status updated successfully')
      return true
    } catch (err) {
      console.error('❌ Failed to update status:', err.message)
      return false
    }
  }, [])

  return { reports, loading, error, newReport, updateReportStatus }
}

export default useReports
