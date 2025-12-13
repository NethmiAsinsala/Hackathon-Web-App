import Dexie from 'dexie';

// URL: Use "export const" so we can import it as { db } later
export const db = new Dexie('AegisLocalDB');

// Version 2: Added new fields for SOS, photo, people affected, resources
db.version(2).stores({
  reports: '++id, type, severity, latitude, longitude, timestamp, synced, isSOS, photoData, peopleAffected, resourcesNeeded'
});

// Keep backward compatibility with version 1
db.version(1).stores({
  reports: '++id, type, severity, latitude, longitude, timestamp, synced'
});