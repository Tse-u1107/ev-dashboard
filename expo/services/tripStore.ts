import * as SQLite from "expo-sqlite";

export interface Trip {
  id: number;
  features: Record<string, unknown>;
  predicted_km: number;
  actual_km: number;
  epsilon: number;
  created_at: number;
}

type TripRow = {
  id: number;
  features: string;
  predicted_km: number;
  actual_km: number;
  epsilon: number;
  created_at: number;
};

let db: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync("ev_trips.db");
  }
  return db;
}

export function initDb(): void {
  const database = getDb();
  database.execSync(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY,
      features TEXT,
      predicted_km REAL,
      actual_km REAL,
      epsilon REAL,
      created_at INTEGER
    );
  `);
}

export function saveTrip(features: object, predicted: number, actual: number): void {
  initDb();

  const epsilon = actual - predicted;
  const createdAt = Date.now();
  const featuresJson = JSON.stringify(features ?? {});

  const database = getDb();
  database.runSync(
    `INSERT INTO trips (features, predicted_km, actual_km, epsilon, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [featuresJson, predicted, actual, epsilon, createdAt]
  );

  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    return;
  }

  void fetch(`${baseUrl}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      features,
      actual_km: actual,
      predicted_km: predicted,
    }),
  }).catch(() => {
    // Fire-and-forget feedback: intentionally swallow network errors.
  });
}

export function savePlannedTrip(features: object, predictedRangeKm: number, plannedDistanceKm: number): void {
  initDb();

  const epsilon = plannedDistanceKm - predictedRangeKm;
  const createdAt = Date.now();
  const featuresJson = JSON.stringify(features ?? {});

  const database = getDb();
  database.runSync(
    `INSERT INTO trips (features, predicted_km, actual_km, epsilon, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [featuresJson, predictedRangeKm, plannedDistanceKm, epsilon, createdAt]
  );
}

export function getRecentTrips(limit = 20): Trip[] {
  initDb();
  const database = getDb();
  const rows = database.getAllSync<TripRow>(
    `SELECT id, features, predicted_km, actual_km, epsilon, created_at
     FROM trips
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit]
  );

  return rows.map((row) => {
    let parsedFeatures: Record<string, unknown> = {};
    try {
      parsedFeatures = JSON.parse(row.features) as Record<string, unknown>;
    } catch {
      parsedFeatures = {};
    }

    return {
      id: row.id,
      features: parsedFeatures,
      predicted_km: row.predicted_km,
      actual_km: row.actual_km,
      epsilon: row.epsilon,
      created_at: row.created_at,
    };
  });
}
