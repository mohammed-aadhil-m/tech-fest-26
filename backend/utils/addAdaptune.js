require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Setting = require('../models/Setting');
const connectDB = require('../config/db');

const run = async () => {
  await connectDB();
  console.log('Adding Adaptune event and registrationDeadline setting...');

  // Add/update Adaptune event
  await Event.findOneAndUpdate(
    { slug: 'adaptune' },
    {
      slug: 'adaptune',
      name: 'Adaptune',
      shortName: 'Adaptune',
      icon: 'AT',
      category: 'non-technical',
      order: 6,
      description: 'Adaptune is a fun and interactive music-guessing game where participants identify songs using different clues such as humming, instrumental tunes, and emojis. Test your musical memory, speed, and creativity while competing with friends and teams.',
      fullDescription: 'Adaptune is a fun and interactive music-guessing game where participants identify songs using different clues such as humming, instrumental tunes, and emojis. Test your musical memory, speed, and creativity while competing with friends and teams.',
      rounds: [
        {
          roundNumber: 1,
          title: 'Humming Round',
          description: 'Participants must identify songs from hummed melodies.',
          rules: [
            'Listen carefully to the hummed tune.',
            'Submit the song name within the given time.',
            'No external help allowed.'
          ]
        },
        {
          roundNumber: 2,
          title: 'Instrumental Round',
          description: 'Participants must identify songs from instrumental tunes.',
          rules: [
            'Listen to the instrumental version of the song.',
            'Identify the song title and submit within time.',
            'No internet or outside assistance allowed.'
          ]
        },
        {
          roundNumber: 3,
          title: 'Emoji Round',
          description: 'Participants must guess songs from emoji clues.',
          rules: [
            'Decode the emoji sequence to identify the song.',
            'Submit your answer within the time limit.',
            'Highest correct answers wins.'
          ]
        }
      ],
      rules: [
        '3 Rounds: Humming, Instrumental, and Emoji-based song guessing.',
        'Time Limit: Answers must be submitted within the given time.',
        'No External Help: Mobile phones, internet, or outside assistance are not allowed.',
        'Scoring: Correct answers earn points; the team with the highest score wins.'
      ],
      tagline: 'Tune In. Guess Right. Win Big.',
      isTeamEvent: true,
      maxTeamSize: 4,
      minTeamSize: 2,
      registrationOpen: true,
      active: true
    },
    { upsert: true, new: true }
  );
  console.log('Adaptune event added/updated.');

  // Add registrationDeadline setting if not exists
  await Setting.findOneAndUpdate(
    { key: 'registrationDeadline' },
    { key: 'registrationDeadline', value: null, label: 'Registration Deadline (for countdown)' },
    { upsert: true, new: true }
  );
  console.log('registrationDeadline setting added.');

  console.log('Done!');
  process.exit(0);
};

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
