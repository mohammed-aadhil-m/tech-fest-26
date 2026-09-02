const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Event = require('../models/Event');
const Setting = require('../models/Setting');

async function updateEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/techfest26');
    console.log('Connected to MongoDB');

    // Update Setting contactEmail
    await Setting.findOneAndUpdate(
      { key: 'contactEmail' },
      { value: 'techfest.official2026@gmail.com', label: 'Contact Email', updatedAt: Date.now() },
      { upsert: true }
    );

    // 1. Paper Presentation
    const paperPres = await Event.findOne({ slug: 'paper-presentation' });
    if (paperPres) {
      paperPres.isTeamEvent = true;
      paperPres.minTeamSize = 1;
      paperPres.maxTeamSize = 3;
      paperPres.time = '10:30 AM - 12:30 PM';
      paperPres.venue = 'CSE Seminar Hall';
      paperPres.submissionEmail = 'techfest.official2026@gmail.com';
      paperPres.rules = [
        "Each participant/team will be given 10 minutes to present their paper.",
        "The presentation will be followed by a Q&A session with the judges.",
        "Participants should clearly explain the problem statement, proposed solution, methodology, results, and conclusion.",
        "Presentation slides should be clear, concise, and relevant to the submitted paper.",
        "Participants may upload or update their presentation slides before the submission deadline (06/09/2026).",
        "The presentation should be delivered by the registered participant/team members.",
        "Ensure your paper is original and plagiarism-free.",
        "Any form of malpractice will lead to immediate disqualification."
      ];
      paperPres.description = "Present your innovative ideas, research, technical knowledge, and creative solutions. Each participant/team gets 10 minutes for presentation followed by judge Q&A.";
      paperPres.fullDescription = "Participants are requested to submit their paper presentation slides and abstract before the deadline (06/09/2026). Each participant/team will be given 10 minutes to present their paper, followed by a Q&A session with the judges. Participants should clearly explain the problem statement, proposed solution, methodology, results, and conclusion.";
      paperPres.evaluationCriteria = [
        { title: "Presentation & Timing", description: "Clarity of delivery within the allotted 10 minutes." },
        { title: "Problem & Solution", description: "Depth of problem statement and proposed methodology." },
        { title: "Judge Q&A", description: "Confidence and accuracy during the interactive Q&A session." },
        { title: "Innovation & Relevance", description: "Originality and practical relevance of the research paper." }
      ];
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
        { isTeamEvent: true, minTeamSize: 2, maxTeamSize: 2, time: info.time, venue: info.venue }
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
