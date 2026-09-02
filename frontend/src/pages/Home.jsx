import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Code2, Trophy, Users, CheckCircle, AlertTriangle, Calendar, Clock, MapPin } from 'lucide-react';
import api from '../services/api';

import ThreeBackground from '../components/ThreeBackground';

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
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,42,42,0.8)] animate-pulse" />
        <p className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-[0.2em]">{label}</p>
      </div>
      {!targetDate ? (
        <p className="text-sm text-gray-500 font-medium py-2">Date to be announced</p>
      ) : expired ? (
        <p className="text-sm font-bold text-red-500 py-2 glow-text">
          {label.includes('Starts') ? 'Event Started!' : 'Registration Closed!'}
        </p>
      ) : (
        <div className="flex items-center gap-3 sm:gap-4">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="countdown-box">
              <span className="countdown-number">{String(value).padStart(2, '0')}</span>
              <span className="countdown-label">{unit}</span>
            </div>
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const stats = [
  { icon: <Zap size={24} />, label: 'Technical', value: '3 Events' },
  { icon: <Trophy size={24} />, label: 'Non-Technical', value: '3 Events' },
  { icon: <Users size={24} />, label: 'Department', value: 'CSE' },
  { icon: <Code2 size={24} />, label: 'Edition', value: '2026' },
];

const DEFAULT_SCHEDULE = [
  { time: '09:00 AM', title: 'Registration & Check-in', desc: 'Arrive at campus, check-in, and collect your event pass.', venue: 'Registration Desk, Main Block' },
  { time: '09:30 AM', title: 'Inauguration Ceremony', desc: 'Opening ceremony and welcome address by dignitaries.', venue: 'Auditorium' },
  { time: '10:30 AM', title: 'Technical Events Begin', desc: 'Paper Presentation, Dev & Deploy, Bug Buster.', venue: 'Respective Labs & Seminar Halls' },
  { time: '12:30 PM', title: 'Lunch Break', desc: 'Enjoy delicious lunch and refreshments provided on campus.', venue: 'Cafeteria' },
  { time: '01:30 PM', title: 'Non-Technical Events Begin', desc: 'Treasure Hunt 2.0, Connect & Sketch, Adaptune.', venue: 'Respective Venues' },
  { time: '03:30 PM', title: 'Valedictory & Prize Distribution', desc: 'Closing ceremony, certificate distribution, and winner announcements.', venue: 'Auditorium' },
];

const HERO_WORDS = ["CREATE", "DECODE", "INNOVATE", "COMPETE"];

export default function Home() {
  const [settings, setSettings] = useState({});
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, scheduleRes] = await Promise.allSettled([
          api.get('/settings'),
          api.get('/schedule')
        ]);
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.data) {
          setSettings(settingsRes.value.data.data);
        }
        if (scheduleRes.status === 'fulfilled' && scheduleRes.value.data?.data && scheduleRes.value.data.data.length > 0) {
          setSchedule(scheduleRes.value.data.data.map(item => ({
            time: item.time,
            title: item.title,
            desc: item.description || item.desc || '',
            venue: item.venue || ''
          })));
        }
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
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white overflow-hidden">

      {/* ── HERO ───────────────────────────────────────── */}
      <section id="home" className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
        <ThreeBackground />

          <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center"
            >
              <motion.div variants={itemVariants} className="mb-8 w-full">
                <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
                  {/* Left: VVCOE Logo */}
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30"></div>
                    <img src="/college-logo.jpg" alt="VVCOE Logo" className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/20 z-10 shadow-[0_0_30px_rgba(255,42,42,0.3)]" />
                  </div>
                  
                  {/* Center: College Details */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-lg sm:text-3xl md:text-4xl font-display font-black text-white tracking-widest uppercase mb-1 sm:mb-2 text-shadow-sm text-center leading-tight">
                      VV College of Engineering
                    </h2>
                    <p className="text-[9px] sm:text-[11px] md:text-sm text-gray-400 font-medium max-w-xl leading-relaxed text-center">
                      (Approved By AICTE, New Delhi and affiliated To Anna University Chennai)<br className="hidden sm:block" />
                      V V Nagar, Arasoor, Thisayanvilai, Sathankulam Taluk, Tuticorin District - 628 656
                    </p>
                  </div>

                  {/* Right: CSI Logo */}
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20"></div>
                    <img src="/csi-logo.png" alt="CSI Logo" className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full object-contain border border-white/10 z-10 shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-white" />
                  </div>
                </div>

                {/* CSI & Dept */}
                <div className="mt-6 flex flex-col items-center">
                  <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.02)] max-w-2xl w-full">
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 glow-red"></div>
                    <p className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-300 uppercase tracking-widest leading-relaxed text-center">
                      CSI STUDENTS CHAPTER & DEPARTMENT OF<br/>
                      <span className="text-red-400 block mt-1">COMPUTER SCIENCE AND ENGINEERING</span>
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mt-2 sm:mt-3 font-mono text-center">Proudly Presents</p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center">
                <h1 className="text-6xl sm:text-8xl md:text-9xl font-display font-black tracking-tighter text-white leading-[0.9] text-center drop-shadow-2xl">
                  TECH FEST <span className="text-red-500 glow-text block mt-2">'26</span>
                </h1>
                
                <div className="mt-4 sm:mt-6">
                  <p className="text-sm sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 uppercase text-center flex flex-wrap justify-center items-center gap-x-4 sm:gap-x-6">
                    <span className="tracking-[0.2em] sm:tracking-[0.25em]">N A T I O N A L</span>
                    <span className="tracking-[0.2em] sm:tracking-[0.25em]">L E V E L</span>
                    <span className="tracking-[0.2em] sm:tracking-[0.25em]">S Y M P O S I U M</span>
                  </p>
                </div>
                
                <div className="h-12 sm:h-16 mt-6 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={wordIndex}
                      initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -20, opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 0.4 }}
                      className="text-3xl sm:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300 text-center"
                    >
                      {HERO_WORDS[wordIndex]}
                    </motion.h2>
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-10 max-w-2xl text-center">
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-5 py-2.5 rounded-lg border border-white/10 backdrop-blur-sm">
                    <Calendar size={16} className="text-red-400" />
                    <span className="font-medium tracking-wide">09 SEP 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-5 py-2.5 rounded-lg border border-white/10 backdrop-blur-sm">
                    <MapPin size={16} className="text-red-400" />
                    <span className="font-medium tracking-wide">VVCOE Campus</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-12 flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
                <Countdown targetDate={settings.registrationDeadline || "2026-09-08T23:59:59+05:30"} label="REGISTRATION CLOSES IN" />
                <Countdown targetDate={settings.eventDate || "2026-09-09T09:30:00+05:30"} label="EVENT STARTS IN" />
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link to="/register" className="btn-primary w-full sm:w-auto justify-center text-lg px-8 py-4 shadow-[0_0_20px_rgba(255,42,42,0.3)]">
                  Registration
                </Link>
                <Link to="/events" className="btn-secondary w-full sm:w-auto justify-center px-8 py-4">
                  Explore Events <ChevronRight size={18} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────── */}
      <section id="about" className="py-24 relative">
        <div className="absolute inset-0 circuit-bg pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <span className="badge badge-technical mb-6">About the Fest</span>
              <h2 className="section-title">
                Where Innovation <br/><span className="text-gradient-red">Meets Excellence</span>
              </h2>
              <div className="w-12 h-1 bg-red-500 mb-8 rounded-full glow-red"></div>
              
              <div className="space-y-6 text-gray-400 text-lg font-light leading-relaxed">
                <p>
                  TECH FEST '26 is the premier technical symposium organized by the Department of Computer Science and Engineering at V V College of Engineering.
                </p>
                <p>
                  We provide a platform for visionary students to showcase their technical prowess, creativity, problem-solving abilities, and innovative thinking through an intense lineup of events.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-10">
                <Link
                  to="/#schedule"
                  onClick={() => {
                    const el = document.getElementById('schedule');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary text-sm py-3 px-6"
                >
                  View Schedule <ChevronRight size={16} />
                </Link>
                <Link
                  to="/#rules"
                  onClick={() => {
                    const el = document.getElementById('rules');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-outline text-sm py-3 px-6 border-white/10 hover:border-white/30"
                >
                  Read Guidelines
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                  className="card-hover flex flex-col items-center justify-center text-center py-10"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 glow-red">
                    {s.icon}
                  </div>
                  <p className="text-2xl sm:text-3xl font-display font-black text-white mb-1">{s.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-wider">{s.label}</p>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </div>
      </section>

      {/* ── SCHEDULE ───────────────────────────────────────── */}
      <section id="schedule" className="py-24 relative bg-[#0a0a0c]">
        {/* Subtle top/bottom borders */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="badge badge-technical mb-4">Event Timeline</span>
            <h2 className="section-title">
              Event <span className="text-gradient-red">Schedule</span>
            </h2>
            <p className="section-subtitle">
              Plan your day at TECH FEST '26
            </p>
          </motion.div>

          <div className="relative border-l border-red-500/30 ml-4 md:ml-8 space-y-12 pb-8">
            {schedule.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative pl-8 sm:pl-12"
              >
                {/* Timeline node */}
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(255,42,42,0.8)]" />
                <div className="absolute -left-[9px] top-[0px] w-[11px] h-[11px] rounded-full border border-red-500/50 animate-ping" />
                
                <div className="card-hover">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-red-500" />
                      <span className="text-red-400 font-mono font-bold text-sm tracking-wide">{item.time}</span>
                    </div>
                    {item.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md">
                        <MapPin size={11} className="text-red-400" />
                        <span>{item.venue}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RULES ───────────────────────────────────── */}
      <section id="rules" className="py-24 relative">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-20"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="badge badge-technical mb-4">Guidelines</span>
            <h2 className="section-title">
              Rules &amp; <span className="text-gradient-red">Guidelines</span>
            </h2>
            <p className="section-subtitle">
              Strict compliance is required. The organizers' decision is final.
            </p>
          </motion.div>

          {/* General Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="card mb-8 border-l-2 border-l-red-500 bg-black/60 mx-auto max-w-4xl p-6"
          >
            <h3 className="text-lg sm:text-xl font-display font-bold mb-4 text-white flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              General Rules & Guidelines
            </h3>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                'Participants must register before the event.',
                'Follow event timings and report on time.',
                'Follow instructions given by coordinators and judges.',
                'Malpractice leads to immediate disqualification.',
                'Maintain discipline inside the campus.',
                'The organizers\' decision will be final.',
                'Mobile phones permitted only as per specific rules.',
                'Plagiarism or copied work will lead to disqualification.',
              ].map((rule, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs sm:text-[13px] text-gray-400 bg-white/5 p-2.5 rounded-lg border border-white/5"
                >
                  <CheckCircle size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
                  {rule}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
