require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const EventRegistration = require('./models/EventRegistration');
const Payment = require('./models/Payment');
const Team = require('./models/Team');

const emailsToDelete = process.argv.slice(2);

if (emailsToDelete.length === 0) {
  console.log('❌ Please provide at least one email address. Example: node deleteUser.js test1@gmail.com test2@gmail.com');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    for (const email of emailsToDelete) {
      console.log(`\n🔍 Processing: ${email}...`);
      const user = await User.findOne({ email: email });

      if (!user) {
        console.log(`❌ User ${email} not found in the database. Skipping.`);
        continue;
      }

      console.log(`✅ Found user: ${user.fullName} (${user._id})`);

      // Delete associated data
      const regResult = await EventRegistration.deleteMany({ user: user._id });
      console.log(`🗑️ Deleted ${regResult.deletedCount} registrations.`);

      const payResult = await Payment.deleteMany({ user: user._id });
      console.log(`🗑️ Deleted ${payResult.deletedCount} payment records.`);

      // Remove user from any teams they are in
      await Team.updateMany(
        { members: user._id },
        { $pull: { members: user._id } }
      );
      console.log(`🗑️ Removed user from teams.`);

      // Delete the user
      await User.deleteOne({ _id: user._id });
      console.log(`✅ Successfully deleted user ${email} and all their data!`);
    }
    
    console.log('\n🎉 Finished processing all users!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
