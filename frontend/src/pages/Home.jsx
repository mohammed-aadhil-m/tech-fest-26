import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Code2, Trophy, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

// Static hero background (Color #FFFDF2)
function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 bg-[#FFFDF2]">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-bg opacity-10" />
    </div>
  );
}

// Single countdown box
function CountdownBox({ value, label }) {
  return (
    <div className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border border-gray-300 rounded-2xl bg-white/60 backdrop-blur-md shadow-sm relative">
      <span className="text-2xl sm:text-3xl font-display font-bold text-gray-900 leading-none">{String(value).padStart(2, '0')}</span>
      <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

// Countdown component
function Countdown({ targetDate, label }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!targetDate) return;
    const target = new Date(targetDate);
    const tick = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setExpired(true);
        return;
      }
      setExpired(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-[#C40001] animate-pulse" />
        <p className="text-[10px] font-mono font-bold text-[#C40001] uppercase tracking-widest">{label}</p>
      </div>
      {!targetDate ? (
        <p className="text-sm text-gray-500 font-medium py-2">Date to be announced</p>
      ) : expired ? (
        <p className="text-sm font-bold text-[#C40001] py-2">
          {label.includes('Starts') ? 'Event Started!' : 'Registration Closed!'}
        </p>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <CountdownBox key={unit} value={value} label={unit} />
          ))}
        </div>
      )}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stats = [
  { icon: <Zap size={22} />, label: 'Technical Events', value: '3' },
  { icon: <Trophy size={22} />, label: 'Non-Technical Events', value: '3' },
  { icon: <Users size={22} />, label: 'Departments', value: 'CSE' },
  { icon: <Code2 size={22} />, label: 'Year', value: '2026' },
];

const HERO_WORDS = ["CREATE", "DECODE", "INNOVATE", "COMPETE"];

export default function Home() {
  const [settings, setSettings] = useState({});
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRes = await api.get('/settings');
        setSettings(settingsRes.data.data || {});
      } catch {
        // fail silently on home
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % HERO_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cream selection:bg-primary-100 selection:text-primary-900 overflow-hidden" style={{ perspective: '1000px' }}>

      {/* ── HERO ───────────────────────────────────────── */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden">
        <HeroBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Column: Text & Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-left"
            >
              {/* Header Info */}
              <motion.div variants={itemVariants} className="mb-4">
                <p className="text-[10px] sm:text-xs font-mono font-semibold text-gray-500 tracking-[0.2em] uppercase mb-3">
                  DEPT. OF CSE · V V COLLEGE OF ENGINEERING
                </p>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-gray-900 leading-[0.9]">
                  TECH FEST <span className="text-[#C40001] block mt-1">'26</span>
                </h1>
                <div className="h-12 sm:h-16 mt-4 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={wordIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl sm:text-5xl font-display font-bold"
                      style={{ color: '#C40001' }}
                    >
                      {HERO_WORDS[wordIndex]}
                    </motion.h2>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Tagline / Description */}
              <motion.div variants={itemVariants} className="mb-8 max-w-lg">
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  A one-day technical symposium where ideas, data and code collide — five events, one campus, upcoming this 2026.
                </p>
                <p className="text-[10px] font-mono font-semibold text-gray-400 tracking-[0.15em] uppercase mt-4">
                  5 EVENTS / 10 ROUNDS / 1 DAY / VVCOE
                </p>
              </motion.div>

              {/* Countdown Timer */}
              <motion.div variants={itemVariants} className="mb-10">
                <Countdown targetDate={settings.eventDate} label="COUNTING DOWN — TECH FEST 2026" />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
                <Link to="/register" className="btn-primary text-sm sm:text-base px-8 py-3 w-full sm:w-auto justify-center shadow-red-md rounded-full">
                  Register
                </Link>
                <Link to="/events" className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-gray-700 hover:text-[#C40001] transition-colors border border-gray-300 hover:border-[#C40001] px-8 py-3 w-full sm:w-auto rounded-full bg-white/50 backdrop-blur-sm">
                  Explore events <ChevronRight size={18} />
                </Link>
              </motion.div>

            </motion.div>

            {/* Right Column: Graphic / Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex justify-center items-center relative"
            >
              {/* Empty as requested */}
            </motion.div>

          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <div className="w-0.5 h-8 bg-gradient-to-b from-[#C40001] to-transparent rounded-full" />
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Scroll</p>
        </motion.div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────── */}
      <section id="about" className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <span className="badge badge-technical mb-4">About TECH FEST '26</span>
              <h2 className="section-title mb-5">
                Where Innovation <span className="text-gradient-red">Meets Excellence</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                TECH FEST '26 is a technical symposium organized by the Department of Computer Science and Engineering, V V College of Engineering.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                The symposium provides students with an opportunity to showcase their technical knowledge, creativity, problem-solving ability, teamwork and innovative thinking through a variety of technical and non-technical events.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/events" className="btn-primary text-sm">
                  View Events <ChevronRight size={15} />
                </Link>
                <Link to="/rules" className="btn-secondary text-sm">
                  Event Rules
                </Link>
              </div>
            </div>

            {/* Stats Grid on the right side */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 text-center shadow-card hover:shadow-lg transition-all"
                >
                  <div className="text-primary-700 flex justify-center mb-2">{s.icon}</div>
                  <p className="text-3xl font-display font-bold text-gray-900 mb-1">{s.value}</p>
                  <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </div>
      </section>
      {/* ── SCHEDULE ───────────────────────────────────────── */}
      <section id="schedule" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="badge badge-technical mb-4">Event Timeline</span>
            <h2 className="section-title mb-3">
              Symposium <span className="text-gradient-red">Schedule</span>
            </h2>
            <p className="section-subtitle text-gray-500">
              Plan your day at TECH FEST '26
            </p>
          </motion.div>

          <div className="relative border-l-2 border-primary-200 ml-4 md:ml-8">
            {[
              { time: '09:00 AM', title: 'Registration & Welcome', desc: 'Check-in and collect your event passes.' },
              { time: '09:30 AM', title: 'Inauguration', desc: 'Opening ceremony and keynote address.' },
              { time: '10:30 AM', title: 'Technical Events Start', desc: 'Paper Presentation, Dev & Deploy, Bug Buster.' },
              { time: '12:30 PM', title: 'Lunch Break', desc: 'Food and refreshments provided.' },
              { time: '01:30 PM', title: 'Non-Technical Events', desc: 'Treasure Hunt 2.0, Connect & Sketch, Adaptune.' },
              { time: '03:30 PM', title: 'Valedictory & Prize Distribution', desc: 'Closing ceremony and winner announcements.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="mb-8 relative pl-8"
              >
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#C40001] border-4 border-white shadow" />
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="text-[#C40001] font-bold text-sm mb-1 block">{item.time}</span>
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RULES ───────────────────────────────────── */}
      <section id="rules" className="py-20" style={{ backgroundColor: '#FFFDF2' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="badge badge-technical mb-4">TECH FEST '26</span>
            <h2 className="section-title mb-3">
              Rules &amp; <span className="text-gradient-red">Guidelines</span>
            </h2>
            <p className="section-subtitle">
              All participants must read and follow these rules. The organizers' decision is final.
            </p>
          </motion.div>

          {/* General Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="card p-6 mb-6"
            style={{ borderLeft: '4px solid #C40001' }}
          >
            <h3 className="text-xl font-display font-bold mb-5" style={{ color: '#222222' }}>General Rules</h3>
            <ul className="space-y-3">
              {[
                'Participants must register before the event.',
                'Participants must follow event timings and report on time.',
                'Participants must follow instructions given by coordinators and judges.',
                'Any form of malpractice or misconduct may lead to immediate disqualification.',
                'Participants must maintain discipline inside the campus.',
                'The organizers\' decision will be final in all matters.',
                'Participants must carry their event pass/registration confirmation on the day of the event.',
                'Mobile phones must be used only as permitted by the specific event rules.',
                'Use of unfair means, plagiarism, or copied work will lead to disqualification.',
              ].map((rule, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: '#555555' }}
                >
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#C40001' }} />
                  {rule}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Event Rules */}
          <h3 className="text-2xl font-display font-bold mb-5" style={{ color: '#222222' }}>Event-Specific Rules</h3>
          <div className="space-y-4 mb-8">
            {[
              { name: 'Paper Presentation', rules: ['Submit paper before deadline: 04/09/2026 to suyamburaj@gmail.com.', 'Paper must be original and plagiarism-free.', 'Follow the prescribed paper format.', 'Selected participants will be notified via email.', 'Present live on event day within allotted time.'] },
              { name: 'Dev & Deploy', rules: ['Develop a website using AI assistance.', 'The website must be fully functional and deployed online.', 'Present the live project on the event day.', 'Explain the development process clearly.', 'Plagiarism or copying without significant modification is not allowed.'] },
              { name: 'Bug Buster', rules: ['Total time: 1 Hour.', 'Round 1 — Technical Quiz: buzzer-based, 3 lives, passing allowed.', 'Round 2 — Debug the Code: fix errors in Java, C, Python files.', 'Compile/run the corrected code successfully.', 'Decision of judges is final.'] },
              { name: 'Treasure Hunt 2.0', rules: ['Mobile phones are mandatory.', 'Each team receives different puzzles to prevent copying.', 'Do not damage or remove QR codes.', 'The team completing all stages in shortest time wins.'] },
              { name: 'Connect & Sketch', rules: ['Round 1 (Bioscope): Connect images logically to identify the correct word.', 'Round 2 (Draw & Guess): One member draws; teammates guess without speaking.', 'Words relate to technology and computer science.', 'Any cheating leads to disqualification.'] },
              { name: 'Adaptune', rules: ['3 Rounds: Humming, Instrumental, and Emoji-based song guessing.', 'Answers must be submitted within given time.', 'No mobile phones or external help allowed.', 'Team with highest score wins.'] },
            ].map((event, i) => (
              <motion.div
                key={event.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card p-6"
                style={{ borderLeft: '4px solid #C40001' }}
              >
                <h4 className="text-base font-display font-bold mb-4" style={{ color: '#222222' }}>{event.name}</h4>
                <ul className="space-y-3">
                  {event.rules.map((rule, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm" style={{ color: '#555555' }}>
                      <CheckCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#C40001' }} />
                      {rule}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Important Note */}
          <div className="rounded-2xl p-5 flex items-start gap-3" style={{ backgroundColor: '#fff0f0', border: '1px solid #ffc1c1' }}>
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#C40001' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#C40001' }}>Important Note</p>
              <p className="text-sm mt-1" style={{ color: '#8a0000' }}>
                The organizers reserve the right to modify or update any rules. Any changes will be communicated before the event. The decision of the judges and organizers is final and binding.
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
