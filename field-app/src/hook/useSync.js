import { useEffect, useRef } from 'react';
import { db } from '../db'; // Local Offline DB
import { firestoreDB, collection, addDoc, compressImage } from '../firebase'; // Cloud DB
import { sendToDiscord } from '../utils/sendAlerts';

export function useSync() {
  // Lock to prevent concurrent syncs
  const isSyncing = useRef(false);

  const syncReports = async () => {
    // Prevent multiple syncs running at once
    if (isSyncing.current) {
      console.log("⏳ Sync already in progress, skipping...");
      return;
    }

    // 1. If offline, do nothing
    if (!navigator.onLine) {
      console.log("📴 Offline. Waiting for signal...");
      return;
    }

    try {
      isSyncing.current = true;

      // 2. Find reports waiting to sync (synced = 0)
      const pendingReports = await db.reports.where('synced').equals(0).toArray();

      if (pendingReports.length > 0) {
        console.log(`🔌 Online! Found ${pendingReports.length} reports to sync.`);
        
        for (const report of pendingReports) {
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
        alert("♻️ All offline reports synced to cloud!");
      }
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      isSyncing.current = false;
    }
  };

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