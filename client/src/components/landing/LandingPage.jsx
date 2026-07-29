import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage({ onGetStarted }) {
  const [activeTab, setActiveTab] = useState('doctor');

  const roleDetails = {
    doctor: {
      title: 'Doctor Workstation',
      badge: 'Clinicians & Specialists',
      desc: 'Centralize EHR access, review consultation queues, document clinical notes, and manage prescription pipelines from a high-efficiency dashboard.',
      img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Real-time access to patient medical histories',
        'Structured clinical note taking & diagnosis tracking',
        'Direct prescription generation & queue dispatch',
      ],
    },
    reception: {
      title: 'Front-Desk & Intake Desk',
      badge: 'Reception & Administration',
      desc: 'Streamline patient check-ins, record walk-in appointments, manage waiting room flow, and ensure zero scheduling conflicts.',
      img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Rapid patient onboarding & profile creation',
        'Live waiting room status monitoring',
        'Instant practitioner availability lookup',
      ],
    },
    manager: {
      title: 'Practice & Operational Oversight',
      badge: 'Clinic Directors & Managers',
      desc: 'Monitor clinic utilization rates, track daily consultation volumes, analyze wait times, and manage staff schedules with built-in analytics.',
      img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80',
      highlights: [
        'Real-time practice capacity and throughput metrics',
        'Departmental performance reports',
        'Staff scheduling and shift allocation tools',
      ],
    },
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950 overflow-hidden">

      {/* 1. TOP NAVBAR */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 90, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg cursor-pointer"
            >
              ┼
            </motion.div>
            <span className="font-bold text-xl text-slate-100 tracking-tight">CareConnect</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-teal-400 transition-colors">About</a>
            <a href="#solutions" className="hover:text-teal-400 transition-colors">Solutions</a>
            <a href="#demo" className="hover:text-teal-400 transition-colors">Demo</a>
          </nav>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/10"
            >
              Sign In / Access Portal
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* 2. HERO SECTION WITH AMBIENT GLOW & ANIMATED CONTENT */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Animated Glow Backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>Next-Gen Practice Management System</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
              Modern Care.{' '}
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Synchronized Workflows.
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              CareConnect connects doctors, receptionists, and practice managers in one high-performance interface. Reduce patient wait times and standardize clinical operations.
            </motion.p>

            <motion.div variants={fadeInUp} className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 20px 25px -5px rgba(20, 184, 166, 0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-xl shadow-teal-500/20"
              >
                Launch Portal Demo
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#solutions"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-sm rounded-xl transition-all text-center"
              >
                Explore Modules
              </motion.a>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div variants={fadeInUp} className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">&lt; 90s</p>
                <p className="text-[11px] text-slate-400 mt-1">Avg Intake Time</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">100%</p>
                <p className="text-[11px] text-slate-400 mt-1">Sync Accuracy</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">3 Roles</p>
                <p className="text-[11px] text-slate-400 mt-1">Unified System</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image Block with Floating Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
                alt="CareConnect Clinical System in action"
                className="w-full h-[380px] sm:h-[440px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Animated Floating Overlay Card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute bottom-4 left-4 right-4 p-4 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md shadow-2xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100">Live Consultation Interface</p>
                    <p className="text-[11px] text-slate-400">Integrated patient history, vitals, and prescription tools.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="about" className="py-20 bg-slate-900/50 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 order-2 lg:order-1"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80"
                alt="Medical staff collaborating"
                className="w-full h-[360px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-teal-500/10 mix-blend-overlay" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 order-1 lg:order-2 space-y-5"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Designed For Real Clinical Needs</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">
              Eliminate delays between front desk intake and clinical consultation.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              In busy medical settings, miscommunication or delayed patient status updates lead to longer waiting rooms and administrative drag. CareConnect provides instant synchronization across all staff workstations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <motion.div whileHover={{ y: -4 }} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <h4 className="text-sm font-bold text-slate-200 mb-1">Centralized Intake</h4>
                <p className="text-xs text-slate-400">Reception registers patients once; details instantly populate for attending doctors.</p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <h4 className="text-sm font-bold text-slate-200 mb-1">Live Queue Sync</h4>
                <p className="text-xs text-slate-400">Doctors see patient waiting status, intake time, and reason for visit in real-time.</p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. INTERACTIVE TAB PREVIEW WITH ANIMATED CONTENT SWITCHING */}
      <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Role-Specific Workspaces</span>
          <h2 className="text-3xl font-bold text-slate-100 mt-2">Custom Interfaces for Every Team Member</h2>
          <p className="text-sm text-slate-400 mt-2">Switch tabs below to see how CareConnect tailors the platform to each role.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            {Object.keys(roleDetails).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative px-5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === key ? 'text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === key && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-teal-500 rounded-lg"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{roleDetails[key].badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Animated Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                {roleDetails[activeTab].badge}
              </span>
              <h3 className="text-2xl font-bold text-slate-100">{roleDetails[activeTab].title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{roleDetails[activeTab].desc}</p>

              <ul className="space-y-2.5 pt-2">
                {roleDetails[activeTab].highlights.map((point, idx) => (
                  <li key={idx} className="flex items-center space-x-3 text-xs sm:text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGetStarted}
                  className="px-5 py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold rounded-xl transition-all"
                >
                  Test {roleDetails[activeTab].title} Demo →
                </motion.button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-xl h-[300px]">
                <img
                  src={roleDetails[activeTab].img}
                  alt={roleDetails[activeTab].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 5. CALL TO ACTION SECTION */}
      <section id="demo" className="py-20 bg-slate-900/80 border-t border-b border-slate-800 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">Ready to test the system?</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Access the live workspace demo. Pre-loaded credential sets for Doctor, Receptionist, and Clinic Manager roles are ready on the sign-in page.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-xl shadow-teal-500/20"
          >
            Go to Portal Sign In
          </motion.button>
        </motion.div>
      </section>

      {/* 6. COMPREHENSIVE FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                ┼
              </div>
              <span className="font-bold text-lg text-slate-100">CareConnect</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Clinical practice management software unifying intake, patient queues, and physician workflows into one cohesive workspace.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Modules</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#solutions" className="hover:text-teal-400 transition-colors">Doctor Workspace</a></li>
              <li><a href="#solutions" className="hover:text-teal-400 transition-colors">Front-Desk Intake</a></li>
              <li><a href="#solutions" className="hover:text-teal-400 transition-colors">Manager Analytics</a></li>
              <li><a href="#demo" className="hover:text-teal-400 transition-colors">Live Demo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#about" className="hover:text-teal-400 transition-colors">About Us</a></li>
              <li><a href="#about" className="hover:text-teal-400 transition-colors">Careers</a></li>
              <li><a href="#about" className="hover:text-teal-400 transition-colors">Contact</a></li>
              <li><a href="#about" className="hover:text-teal-400 transition-colors">Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Compliance</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#about" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#about" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
              <li><a href="#about" className="hover:text-teal-400 transition-colors">HIPAA Standards</a></li>
              <li><a href="#about" className="hover:text-teal-400 transition-colors">Security Overview</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareConnect Workspace System. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Twitter</span>
            <span className="hover:text-slate-400 cursor-pointer">LinkedIn</span>
            <span className="hover:text-slate-400 cursor-pointer">GitHub</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
