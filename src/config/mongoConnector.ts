import mongoose from 'mongoose';
const toJson = require('@meanie/mongoose-to-json');

mongoose.plugin(toJson);

// Connect DB
export const connectMongoDB = async () => {
  const mongoEnv = {
    userauth: process.env.MONGO_USERAUTH || 'admin',
    username: process.env.MONGO_USERNAME || '',
    password: process.env.MONGO_PASSWORD || '',
    database: process.env.MONGO_DATABASE || '',
    domain: process.env.MONGO_DOMAIN || '',
    port: process.env.MONGO_PORT || '',
  };

  let mongoConnectUrl = `mongodb://${mongoEnv.username}:${mongoEnv.password}@${mongoEnv.domain}:${mongoEnv.port}/${mongoEnv.database}?`;
  if (mongoEnv.userauth === 'admin') {
    mongoConnectUrl += 'authSource=admin';
  }
  console.log('connect db: ' + mongoConnectUrl);

  try {
    // console.log(process.env.MONGODB_URL)
    await mongoose.connect(mongoConnectUrl).then(() => {
      console.log('Mongoose connected successfully!');
    });
  } catch (error: any) {
    // console.log('DB error');
    console.log(error.message);
    process.exit(1);
  }
};
