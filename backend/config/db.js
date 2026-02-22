import mongoose from 'mongoose';

// Cache the connection across serverless function invocations
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Return in-progress connection promise to prevent duplicate connections
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolweb';
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    }).then((conn) => {
      console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    }).catch((error) => {
      cached.promise = null; // Allow retry on next call
      console.error(`❌ MongoDB connection error: ${error.message}`);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Don't call process.exit in serverless — let the request fail gracefully
    throw error;
  }

  return cached.conn;
};

export default connectDB;
