import { MongoClient } from 'mongodb';

// Check for either DATABASE_URL or MONGODB_URI
const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    'MongoDB connection string not found. Please set DATABASE_URL or MONGODB_URI in your environment variables.'
  )
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

if (process.env.NODE_ENV === 'development') {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  // Always assign a value to clientPromise
  clientPromise = globalWithMongo._mongoClientPromise || (new MongoClient(uri, options)).connect();
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 