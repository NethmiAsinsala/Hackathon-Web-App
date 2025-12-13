import { useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db'; // Local Offline DB
import { firestoreDB, collection, addDoc, compressImage } from '../firebase'; // Cloud DB
import { sendToDiscord } from '../utils/sendAlerts';

export function useSync() {
  // Lock to prevent concurrent syncs
  const isSyncing = useRef(false);

  // 🔴 Live query to detect unsynced reports immediately
  // This will trigger a re-render and effect whenever a new report is added
  const pendingReports = useLiveQuery(
    () => db.reports.where('synced').equals(0).toArray()
  );

  const syncReports = async () => {
    // Prevent multiple syncs running at once
    if (isSyncing.current) {
      return;
    }

    // 1. If offline, do nothing
    if (!navigator.onLine) {
      return;
    }

    try {
      isSyncing.current = true;

      // 2. Find reports waiting to sync (synced = 0)
      // We fetch again here to ensure we have the latest snapshot in the async function
      const reportsToSync = await db.reports.where('synced').equals(0).toArray();

      if (reportsToSync.length > 0) {
        console.log(`🔌 Online! Found ${reportsToSync.length} reports to sync.`);
        
        for (const report of reportsToSync) {
          const { id, synced, photoData, ...reportData } = report;

          // Compress photo if exists (to fit in Firestore ~800KB limit)
          let compressedPhoto = null;
          if (photoData) {
            try {
              console.log("📸 Compressing photo for Firestore...");
              compressedPhoto = await compressImage(photoData, 600, 0.5);
              console.log("📸 Photo compressed successfully");
            } catch (photoError) {
              console.warn("Photo compression failed:", photoError);
            }
          }

          // Upload to Firestore with compressed photo directly
          const firestoreData = {
            ...reportData,
            photoData: compressedPhoto // Store compressed base64 directly in Firestore
          };
          
          await addDoc(collection(firestoreDB, 'reports'), firestoreData);

          // 2. Trigger the Alert (The Notification)
          // ⚡️ This runs immediately after upload success
          await sendToDiscord({ ...firestoreData, photoData: compressedPhoto }); 

          // 3. Mark as Complete locally
          await db.reports.update(id, { synced: 1 });
        }
        console.log("♻️ All offline reports synced to cloud!");
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      isSyncing.current = false;
    }
  };

  // Trigger sync immediately when pending reports are detected
  useEffect(() => {
    if (pendingReports?.length > 0) {
      syncReports();
    }
  }, [pendingReports]);

  useEffect(() => {
    // Check immediately on load
    syncReports();

    // Listen for "Online" signal
    window.addEventListener('online', syncReports);

    // Backup: Check every 15 seconds
    const interval = setInterval(syncReports, 15000);

    return () => {
      window.removeEventListener('online', syncReports);
      clearInterval(interval);
    };
  }, []);
}