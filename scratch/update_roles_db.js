const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: 'c:/EngineeringTadka/ETMSN/.env' });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management';

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  
  const RoleSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sidebarAccess: [{ type: String }],
    deleteAccess: { type: Boolean, default: false }
  }, { collection: 'roles' });
  
  const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
  
  // Update Super Admin
  const superAdmin = await Role.findOne({ name: 'Super Admin' });
  if (superAdmin) {
    if (!superAdmin.sidebarAccess.includes('create-order')) {
      superAdmin.sidebarAccess.push('create-order');
      await superAdmin.save();
      console.log("Updated Super Admin role with create-order access");
    } else {
      console.log("Super Admin role already has create-order access");
    }
  } else {
    console.log("Super Admin role not found");
  }
  
  // Update Admin
  const admin = await Role.findOne({ name: 'Admin' });
  if (admin) {
    if (!admin.sidebarAccess.includes('create-order')) {
      admin.sidebarAccess.push('create-order');
      await admin.save();
      console.log("Updated Admin role with create-order access");
    } else {
      console.log("Admin role already has create-order access");
    }
  } else {
    console.log("Admin role not found");
  }
  
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

run().catch(console.error);
