import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

// Runs once before all test files: spins up a temporary, in-memory
// MongoDB replica set (a single-node one) so tests never touch the real
// Atlas database. A replica set — not a plain standalone server — is
// required here because several controllers use mongoose transactions
// (session.withTransaction), and transactions only work on a replica
// set or mongos, never on a standalone MongoDB instance.
beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clears all data between individual tests, so one test's data never
// leaks into and affects another test's assertions
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Tears down the in-memory server after all tests finish
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
