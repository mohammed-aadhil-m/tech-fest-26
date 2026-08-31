require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Event = require("../models/Event");
const Setting = require("../models/Setting");

const connectDB = require("../config/db");

const events = [
  // --- TECHNICAL EVENTS ---
  {
    slug: "paper-presentation",
    name: "Paper Presentation",
    shortName: "Paper Presentation",
    icon: "📢",
    category: "technical",
    order: 1,
    description:
      "Present your innovative ideas, research, technical knowledge, and creative solutions. Each participant/team gets 10 minutes for presentation followed by judge Q&A.",
    fullDescription:
      "Participants are requested to submit their paper presentation slides and abstract before the deadline (04/09/2026). Each participant/team will be given 10 minutes to present their paper, followed by a Q&A session with the judges. Participants should clearly explain the problem statement, proposed solution, methodology, results, and conclusion.",
    rules: [
      "Each participant/team will be given 10 minutes to present their paper.",
      "The presentation will be followed by a Q&A session with the judges.",
      "Participants should clearly explain the problem statement, proposed solution, methodology, results, and conclusion.",
      "Presentation slides should be clear, concise, and relevant to the submitted paper.",
      "Participants may upload or update their presentation slides before the submission deadline (04/09/2026).",
      "The presentation should be delivered by the registered participant/team members.",
      "Ensure your paper is original and plagiarism-free.",
      "Any form of malpractice will lead to immediate disqualification."
    ],
    evaluationCriteria: [
      { title: "Presentation & Timing", description: "Clarity of delivery within the allotted 10 minutes." },
      { title: "Problem & Solution", description: "Depth of problem statement and proposed methodology." },
      { title: "Judge Q&A", description: "Confidence and accuracy during the interactive Q&A session." },
      { title: "Innovation & Relevance", description: "Originality and practical relevance of the research paper." }
    ],
    tagline: "Submit your ideas. Share your knowledge. Inspire others! 🚀",
    submissionEmail: "techfest.official2026@gmail.com",
    submissionDeadline: new Date("2026-09-04"),
    time: "10:30 AM - 12:30 PM",
    venue: "CSE Seminar Hall",
    isTeamEvent: true,
    maxTeamSize: 3,
    minTeamSize: 1,
    registrationOpen: true,
    active: true,
  },
  {
    slug: "dev-deploy",
    name: "Dev & Deploy",
    shortName: "Dev & Deploy",
    icon: "🚀",
    category: "technical",
    order: 2,
    fullDescription:
      "In this event, participants must develop a complete website using AI tools and successfully deploy it online. The challenge tests how effectively participants can use AI to transform their ideas into a creative, functional, and user-friendly website.",
    rules: [
      "Develop a website using AI assistance.",
      "Create a unique and creative website design.",
      "Ensure all features and functions work properly.",
      "Deploy the completed website and present the live project.",
      "The website must be accessible online at the time of presentation.",
      "Plagiarism or copying from existing templates without significant modification is not allowed.",
      "Participants must explain their development process clearly.",
    ],
    evaluationCriteria: [
      {
        title: "Creativity",
        description: "Innovation, uniqueness, and design of the website.",
      },
      {
        title: "Communication",
        description:
          "Ability to clearly explain the idea, development process, and features.",
      },
      {
        title: "Functionality",
        description: "All features should work properly without major errors.",
      },
      {
        title: "Deployment",
        description:
          "The website must be successfully deployed and accessible online.",
      },
    ],
    tagline: "Create. Develop. Deploy. Present. 🚀",
    isTeamEvent: false,
    maxTeamSize: 1,
    minTeamSize: 1,
    registrationOpen: true,
    active: true,
  },
  {
    slug: "bug-buster",
    name: "Bug Buster",
    shortName: "Bug Buster",
    icon: "🐞",
    category: "technical",
    order: 3,
    description:
      "Bug Buster is a two-round technical competition designed to test participants' technical knowledge, problem-solving ability, and debugging skills.",
    fullDescription:
      "Bug Buster is a two-round technical competition designed to test participants' technical knowledge, problem-solving ability, and debugging skills. The Top 3 participants/teams will be selected as winners based on overall performance.",
    rounds: [
      {
        roundNumber: 1,
        title: "Technical Quiz",
        description:
          "Participants will answer technical questions in a buzzer-based quiz.",
        rules: [
          "Each participant/team will have 3 lives (chances).",
          "The competition is buzzer-based.",
          "Participants can pass a question if they are unable to answer.",
          "Wrong answers will result in the loss of a life.",
          "Qualified participants will move on to Round 2.",
        ],
      },
      {
        roundNumber: 2,
        title: "Debug the Code",
        description:
          "Participants must identify and correct errors in programming code.",
        rules: [
          "Participants will be given a code file containing errors.",
          "They must identify the errors in the given program.",
          "They must correct and debug the code.",
          "After correcting the errors, participants must compile/run the program using the terminal.",
          "The final output must be produced successfully.",
          "Programming languages may include Java, C, and Python.",
          "Participants will be evaluated based on debugging and problem-solving performance.",
        ],
      },
    ],
    rules: [
      "Total time: 1 Hour.",
      "Programming languages: Java, C, Python.",
      "Top 3 participants/teams will be declared winners.",
      "Any form of malpractice leads to disqualification.",
      "Decision of judges is final.",
    ],
    tagline: "Find the Bug. Fix the Code. Break the Limits. 🚀",
    isTeamEvent: false,
    maxTeamSize: 1,
    minTeamSize: 1,
    registrationOpen: true,
    active: true,
  },
  // --- NON-TECHNICAL EVENTS ---
  {
    slug: "treasure-hunt",
    name: "Treasure Hunt 2.0",
    shortName: "Treasure Hunt 2.0",
    icon: "🔍",
    category: "non-technical",
    order: 4,
    description:
      "Treasure Hunt 2.0 is an exciting QR Code-based adventure event that tests participants' problem-solving, observation, and clue-solving skills.",
    fullDescription:
      "Each participant/team starts by scanning the first QR code. After scanning, they receive a question, puzzle, or challenge. Participants must solve the puzzle correctly to unlock the clue for the next QR code location. The team/participant that successfully completes all stages in the shortest time will be declared the winner.",
    rounds: [
      {
        roundNumber: 1,
        title: "QR Code Adventure",
        description: "Follow the QR code trail to find the final treasure.",
        rules: [
          "Scan the first QR code to begin.",
          "Solve the puzzle to unlock the next clue.",
          "Find the next QR code using the clue.",
          "Continue until you reach the final treasure destination.",
          "Fastest team to complete all stages wins.",
        ],
      },
    ],
    rules: [
      "Mobile phones are mandatory for participation.",
      "Each participant/team will receive different puzzles to prevent copying.",
      "Do not damage or remove the QR codes.",
      "Follow the clues and complete each challenge fairly.",
      "Participants must not disturb other teams or reveal clues to others.",
      "The team/participant that completes all stages in the shortest time will be declared the winner.",
    ],
    tagline: "Scan. Solve. Search. Repeat. Find the Treasure! 🚀",
    isTeamEvent: true,
    maxTeamSize: 2,
    registrationOpen: true,
    active: true,
  },
  {
    slug: "connect-sketch",
    name: "Connect & Sketch",
    shortName: "Connect & Sketch",
    icon: "🎨",
    category: "non-technical",
    order: 5,
    description:
      "Connect & Sketch is a creative team event that combines visual thinking, observation, communication, drawing and technical-word recognition.",
    fullDescription:
      "Connect & Sketch is a creative team event with two rounds. In Round 1 (Bioscope), teams observe a series of images, connect them logically, and identify the common concept/word. Qualifiers proceed to Round 2 (Draw & Guess), where one team member draws a technical concept while teammates guess the word.",
    rounds: [
      {
        roundNumber: 1,
        title: "Bioscope — Connect the Images",
        description:
          "Participants will be shown a series of images. They must observe, connect the images logically, and identify the correct word or concept.",
        rules: [
          "Observe each set of images carefully.",
          "Connect the images logically to find the common concept.",
          "Submit your answer within the time limit.",
          "Teams who successfully clear Round 1 qualify for Round 2.",
        ],
      },
      {
        roundNumber: 2,
        title: "Draw & Guess",
        description:
          "One person from the team will be given a word. That participant must draw the concept without speaking the word, while teammates must identify what is being drawn.",
        rules: [
          "One member draws; teammates guess.",
          "No speaking the word or using letters/numbers while drawing.",
          "Words are related to Technology, Computer Science, Programming, AI, and Digital concepts.",
          "Each team gets a fixed time to guess.",
          "Team with highest correct guesses wins.",
        ],
      },
    ],
    rules: [
      "Team-based event.",
      "Words will be related to technology and computer science.",
      "No speaking the word while drawing.",
      "Judges' decision is final.",
      "Any form of cheating leads to disqualification.",
    ],
    tagline: "Connect the Clues. Sketch the Idea. Guess the Word! 🎨",
    isTeamEvent: true,
    maxTeamSize: 2,
    registrationOpen: true,
    active: true,
  },
  {
    slug: "adaptune",
    name: "Adaptune",
    shortName: "Adaptune",
    icon: "A",
    category: "non-technical",
    order: 6,
    description:
      "Adaptune is a fun and interactive music-guessing game where participants identify songs using different clues such as humming, instrumental tunes, and emojis. Test your musical memory, speed, and creativity while competing with friends and teams.",
    fullDescription:
      "Adaptune is a fun and interactive music-guessing game where participants identify songs using different clues such as humming, instrumental tunes, and emojis. Test your musical memory, speed, and creativity while competing with friends and teams.",
    rounds: [
      {
        roundNumber: 1,
        title: "Humming Round",
        description: "Participants must identify songs from hummed melodies.",
        rules: [
          "Listen carefully to the hummed tune.",
          "Submit the song name within the given time.",
          "No external help allowed.",
        ],
      },
      {
        roundNumber: 2,
        title: "Instrumental Round",
        description:
          "Participants must identify songs from instrumental tunes.",
        rules: [
          "Listen to the instrumental version of the song.",
          "Identify the song title and submit within time.",
          "No internet or outside assistance allowed.",
        ],
      },
      {
        roundNumber: 3,
        title: "Emoji Round",
        description: "Participants must guess songs from emoji clues.",
        rules: [
          "Decode the emoji sequence to identify the song.",
          "Submit your answer within the time limit.",
          "Highest correct answers wins.",
        ],
      },
    ],
    rules: [
      "3 Rounds: Humming, Instrumental, and Emoji-based song guessing.",
      "Time Limit: Answers must be submitted within the given time.",
      "No External Help: Mobile phones, internet, or outside assistance are not allowed.",
      "Scoring: Correct answers earn points; the team with the highest score wins.",
    ],
    tagline: "Tune In. Guess Right. Win Big.",
    isTeamEvent: true,
    maxTeamSize: 2,
    registrationOpen: true,
    active: true,
  },
];

const defaultSettings = [
  { key: "eventDate", value: null, label: "Event Date & Time (for countdown)" },
  {
    key: "registrationDeadline",
    value: null,
    label: "Registration Deadline (for countdown)",
  },
  {
    key: "contactEmail",
    value: "techfest.official2026@gmail.com",
    label: "Contact Email",
  },
  { key: "contactPhone", value: "", label: "Contact Phone Number" },
  { key: "mapEmbedUrl", value: "", label: "Google Maps Embed URL" },
  { key: "instagramUrl", value: "", label: "Instagram URL" },
  { key: "facebookUrl", value: "", label: "Facebook URL" },
  { key: "youtubeUrl", value: "", label: "YouTube URL" },
  { key: "twitterUrl", value: "", label: "Twitter/X URL" },
  {
    key: "registrationOpen",
    value: true,
    label: "Global Registration Open/Close",
  },
];

const seed = async () => {
  await connectDB();
  console.log("Seeding database...");

  // Upsert admin user
  const hashedPassword = await bcrypt.hash("techfest2026", 12);
  await Admin.findOneAndUpdate(
    { username: "admin" },
    {
      username: "admin",
      email: "admin@techfest26.vvcoe.edu.in",
      passwordHash: hashedPassword,
      role: "superadmin",
    },
    { upsert: true, new: true },
  );
  console.log("✅ Admin verified");

  // Upsert events by slug to preserve ObjectIds across seeds
  for (const ev of events) {
    await Event.findOneAndUpdate({ slug: ev.slug }, ev, {
      upsert: true,
      new: true,
    });
  }
  console.log(`✅ ${events.length} events upserted`);

  // Upsert settings
  for (const setting of defaultSettings) {
    await Setting.findOneAndUpdate({ key: setting.key }, setting, {
      upsert: true,
      new: true,
    });
  }
  console.log("✅ Default settings created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("Admin credentials → username: admin | password: techfest2026");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
