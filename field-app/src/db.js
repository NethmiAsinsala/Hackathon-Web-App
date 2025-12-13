import Dexie from 'dexie';

// URL: Use "export const" so we can import it as { db } later
export const db = new Dexie('AegisLocalDB');

db.version(1).stores({
  reports: '++id, type, severity, latitude, longitude, timestamp, synced'
});