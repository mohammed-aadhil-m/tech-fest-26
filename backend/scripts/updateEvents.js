const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Event = require('../models/Event');

async function updateEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/techfest26');
    console.log('Connected to MongoDB');

    // 1. Paper Presentation
    const paperPres = await Event.findOne({ slug: 'paper-presentation' });
    if (paperPres) {
      paperPres.isTeamEvent = true;
      paperPres.minTeamSize = 1;
      paperPres.maxTeamSize = 3;
      paperPres.time = paperPres.time || '10:30 AM - 12:30 PM';
      paperPres.venue = paperPres.venue || 'CSE Seminar Hall';
      // Add text to the description
      const addedDesc = " Note: A maximum of 7 participants will present their paper, followed by a 3-minute judge evaluation.";
      if (!paperPres.description.includes("7 participants")) {
        paperPres.description += addedDesc;
      }
      if (paperPres.fullDescription && !paperPres.fullDescription.includes("7 participants")) {
        paperPres.fullDescription += addedDesc;
      }
      await paperPres.save();
      console.log('Updated paper-presentation');
    }

    // 2. Bug Buster (Individual)
    await Event.updateOne(
      { slug: 'bug-buster' },
      { isTeamEvent: false, minTeamSize: 1, maxTeamSize: 1, time: '10:30 AM - 12:30 PM', venue: 'Lab 2, CSE Block' }
    );
    console.log('Updated bug-buster');

    // 3. Dev & Deploy (Individual)
    await Event.updateOne(
      { slug: 'dev-deploy' },
      { isTeamEvent: false, minTeamSize: 1, maxTeamSize: 1, time: '10:30 AM - 12:30 PM', venue: 'Lab 1, CSE Block' }
    );
    console.log('Updated dev-deploy');

    // 4. Remaining Events (Team of 2)
    const eventVenues = {
      'treasure-hunt': { time: '01:30 PM - 03:30 PM', venue: 'Campus Grounds' },
      'connect-sketch': { time: '01:30 PM - 03:30 PM', venue: 'Drawing Hall 1' },
      'adaptune': { time: '01:30 PM - 03:30 PM', venue: 'Auditorium' }
    };
    for (const [slug, info] of Object.entries(eventVenues)) {
      await Event.updateOne(
        { slug },
        { isTeamEvent: true, minTeamSize: 1, maxTeamSize: 2, time: info.time, venue: info.venue }
      );
      console.log(`Updated ${slug}`);
    }

    console.log('Successfully updated event configurations.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating events:', error);
    process.exit(1);
  }
}

updateEvents();
