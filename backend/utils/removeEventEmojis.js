require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const connectDB = require('../config/db');

const iconMap = {
  'paper-presentation': 'PP',
  'dev-deploy': 'DD',
  'bug-buster': 'BB',
  'treasure-hunt': 'TH',
  'connect-sketch': 'CS',
  'adaptune': 'AT',
  'coming-soon': '--',
};

const run = async () => {
  await connectDB();
  console.log('Updating event icons to remove emojis...');

  for (const [slug, icon] of Object.entries(iconMap)) {
    const result = await Event.findOneAndUpdate({ slug }, { icon }, { new: true });
    if (result) {
      console.log(`Updated ${slug} icon to "${icon}"`);
    }
  }

  console.log('Done!');
  process.exit(0);
};

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
