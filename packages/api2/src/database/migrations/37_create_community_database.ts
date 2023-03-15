/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MongoClient } from 'mongodb';
import { CommunityModel } from '../schemas/communities/37_community.schema';
import { randomBytes } from 'crypto';

const dbUrl = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME!}:${process
  .env.MONGO_INITDB_ROOT_PASSWORD!}@${process.env.MONGO_HOST!}:${process.env
  .MONGO_PORT!}?authSource=admin&appname=PraiseApiMigrations`;

const up = async (): Promise<void> => {
  const communities = await CommunityModel.find({});
  if (communities.length > 0) {
    // If there are already communities, skip this migration as it is only for
    // setting up the first community on a standalone Praise instance
    console.log('Community already setup, skipping');
    return;
  }

  const hostname =
    process.env.NODE_ENV === 'testing' ? 'test-community' : process.env.HOST;

  // Create community based on env variables
  const admins = process.env.ADMINS || '';
  const communityData = {
    hostname,
    name: hostname,
    creator: admins.split(',')[0],
    owners: admins.split(','),
    discordGuildId: process.env.DISCORD_GUILD_ID,
    isPublic: true,
    discordLinkNonce: randomBytes(10).toString('hex'),
    discordLinkState: 'ACTIVE',
  };
  await CommunityModel.create(communityData);

  try {
    const client = new MongoClient(dbUrl);
    const dbFrom = client.db(process.env.MONGO_DB!);
    const communityDbName = hostname;
    const dbTo = client.db(communityDbName);

    const collections = await dbFrom.listCollections().toArray();
    for (const collection of collections) {
      const collectionName = collection.name;
      if (collectionName === 'communities') {
        // Skip communities collection
        continue;
      }

      // Copy collection data
      const collectionData = await dbFrom
        .collection(collectionName)
        .find()
        .toArray();
      const newCollection = dbTo.collection(collectionName);
      if (collectionData.length === 0) {
        // Skip empty collections
        await dbFrom.collection(collectionName).drop();
        continue;
      }
      if (collectionName === 'migrations') {
        // Skip migrations collection
        continue;
      }
      await newCollection.insertMany(collectionData);

      // Copy indexes
      const indexes = await dbFrom.collection(collectionName).indexes();
      for (const index of indexes) {
        await newCollection.createIndex(index.key, index);
      }

      // Drop old collection
      await dbFrom.collection(collectionName).drop();
    }

    // Grant readwrite permissions to new database
    const dbAdmin = client.db().admin();
    await dbAdmin.command({
      grantRolesToUser: process.env.MONGO_USERNAME,
      roles: [{ role: 'readWrite', db: communityDbName }],
    });

    await client.close();
  } catch (error) {
    console.error(error);
  }
};

export { up };
