import { motion, Variants } from 'framer-motion';

interface LandingPageProps {
  onExploreMap: () => void;
  onSignIn: () => void;
  onAnimationComplete: () => void;
}

const LandingPage = ({
  onExploreMap,
  onSignIn,
  onAnimationComplete,
}: LandingPageProps) => {
  // Strict geometric motion types for Framer Motion + TypeScript
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const lineVariants: Variants = {
    hidden: { width: 0 },
    visible: {
      width: '100%',
      transition: { duration: 1.4, ease: [0.85, 0, 0.15, 1] as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onAnimationComplete}
      className="w-full bg-[#FFFFFF] text-[#000000] relative select-none font-sans"
    >
      {/* Bauhaus Accent Top Border */}
      <div className="absolute top-0 left-0 w-full h-[3px] flex opacity-20 z-50">
        <div className="bg-black w-1/3 h-full"></div>
        <div className="bg-[#FF0000] w-1/3 h-full"></div>
        <div className="bg-[#FFCC00] w-1/3 h-full"></div>
      </div>

      <main className="container mx-auto px-6 pt-32 pb-32 max-w-7xl flex flex-col justify-between">
        {/* 1. HERO SECTION */}
        <div className="w-full flex flex-col items-start mb-24">
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#FF0000]" />
              <span className="text-xs font-black uppercase tracking-[0.35em] text-black">
                Full-Stack Geospatial Engineering Project
              </span>
            </div>
            <span className="text-[10px] font-mono border border-black px-2 py-0.5 bg-black text-white font-bold tracking-widest uppercase">
              TU Chemnitz Grade: 1.0 (Highest Honors)
            </span>
          </motion.div>

          <div className="w-full overflow-hidden mb-6">
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-[0.12em] leading-[0.95] text-left"
            >
              Cultural Heritage <br />
              Digital Ledger
            </motion.h1>
          </div>

          <motion.div
            variants={lineVariants}
            className="h-[1px] bg-black w-full my-8"
          />

          <motion.div
            variants={itemVariants}
            className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start lg:items-end"
          >
            <p className="lg:col-span-2 text-sm text-black font-normal leading-7 border-l-2 border-[#FF0000] pl-6 max-w-2xl">
              An interactive, production-grade map portal engineered to ingest,
              optimize, and index large-scale geospatial data. Powered by
              automated OpenStreetMap cron pipelines, multi-threaded caching
              layers, and a highly optimized database aggregation architecture.
            </p>

            {/* Real-time Data Counter */}
            <div className="lg:col-span-1 flex flex-col items-start font-mono border border-black p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">
                TOTAL INDEXED DATASETS
              </span>
              <span className="text-4xl font-black tracking-tight text-black">
                17,535+{' '}
                <span className="text-sm font-normal text-gray-400">SITES</span>
              </span>
              <span className="text-[9px] text-[#FF0000] font-bold mt-2 tracking-tighter">
                / ARCHITECTURE STATUS: PRODUCTION READY
              </span>
            </div>
          </motion.div>
        </div>

        {/* 2. PERFORMANCE METRICS GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="w-full flex flex-col items-start mb-24"
        >
          <div className="text-[11px] font-mono text-gray-400 uppercase tracking-[0.25em] mb-4">
            // PERFORMANCE AUDIT (LIGHTHOUSE MOBILE & BACKEND LATENCY)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full border-t border-l border-black">
            <div className="p-6 border-r border-b border-black font-mono">
              <div className="text-[10px] text-gray-400 uppercase">
                Total Blocking Time (TBT)
              </div>
              <div className="text-2xl font-black my-2 text-[#FF0000]">
                550ms → 80ms
              </div>
              <p className="text-[11px] font-sans text-gray-500 leading-relaxed">
                Slashed main-thread blocking by 85% via Rollup code-splitting,
                eliminating UI stuttering on mobile devices during initial
                hydration.
              </p>
            </div>

            <div className="p-6 border-r border-b border-black font-mono">
              <div className="text-[10px] text-gray-400 uppercase">
                Speed Index (Visual Finish)
              </div>
              <div className="text-2xl font-black my-2">6.1s → 3.0s</div>
              <p className="text-[11px] font-sans text-gray-500 leading-relaxed">
                Cut perceived visual loading duration by 50% using strategic
                React lazy-loading boundaries and heavy bundle decoupling.
              </p>
            </div>

            <div className="p-6 border-r border-b border-black font-mono">
              <div className="text-[10px] text-gray-400 uppercase">
                Backend API Latency
              </div>
              <div className="text-2xl font-black my-2 text-[#FF0000]">
                2.03s → 989ms
              </div>
              <p className="text-[11px] font-sans text-gray-500 leading-relaxed">
                Reduced runtime database response latency by 51.2% through
                indexed spatial queries and unified MongoDB aggregation
                pipelines.
              </p>
            </div>

            <div className="p-6 border-r border-b border-black font-mono">
              <div className="text-[10px] text-gray-400 uppercase">
                Initial Chunks Payload
              </div>
              <div className="text-2xl font-black my-2">~40% Reduction</div>
              <p className="text-[11px] font-sans text-gray-500 leading-relaxed">
                Flattened network trees and isolated heavy mapping engines into
                secondary chunks with early preconnect handshakes.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3. TECHNICAL CHALLENGES DEEP-DIVE */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="w-full flex flex-col items-start mb-24"
        >
          <div className="text-[11px] font-mono text-black font-bold uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
            <span>[ SYSTEM ARCHITECTURE & FULL-STACK ENGINEERING SOLVED ]</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {/* Tech 01 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[360px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINE // 01. GEOSPATIAL INDEXING
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  Web Worker & Supercluster
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Offloaded heavy real-time spatial clustering computations to a
                  background
                  <strong> Web Worker</strong> thread. By moving computational
                  intensity away from the main thread, the app runs continuous
                  multi-level R-Tree tree indexes and delivers smooth 60fps
                  viewport interactions.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ O(n) scan to O(log n) R-Tree lookup ]
              </div>
            </motion.div>

            {/* Tech 02 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[360px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINE // 02. MEMORY ACCELERATION
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  Flyweight Pattern Icon Factory
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Resolved severe CPU bottlenecks caused by massive execution of
                  React static serialization loops during 17k marker rendering.
                  Applied a<strong> Flyweight structural design pattern</strong>{' '}
                  to cache categorized icon instances, reducing initialization
                  iterations by 99.9%.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ 17,000 to 20 rendering cycles ]
              </div>
            </motion.div>

            {/* Tech 03 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[360px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINE // 03. PIPELINE DIET
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  Aggregation & Data Thinning
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Replaced expensive relational runtime joins with a lean data
                  projection design. Leveraged a{' '}
                  <strong>MongoDB Aggregation stage</strong> to package 17,000
                  documents into a single native array stream, stripping
                  non-essential listing fields to reduce initial payload weight
                  by over 70%.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ Denormalized Schema + lean projections ]
              </div>
            </motion.div>

            {/* Tech 04 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[360px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINE // 04. ADAPTIVE VIEWPORT
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  LOD & Background Prefetching
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Orchestrated a progressive Level of Detail (LOD) UI flow.
                  Macro boundaries render initially, while an asynchronous
                  root-level <strong>Prefetching Engine</strong> executes in the
                  background during home navigation, ensuring instant marker
                  visualization without loading spinners.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ 1200ms warm-up non-blocking flow ]
              </div>
            </motion.div>

            {/* Tech 05 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[360px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINE // 05. DATA INTEGRITY
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  RBAC & Replica Set Transactions
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Enforced secure Google OAuth 2.0 layers and state management
                  using strict route guards and secure httpOnly JWTs. Handled
                  cross-collection document alterations safely inside
                  <strong>
                    {' '}
                    MongoDB Replica Set atomic multi-document transactions
                  </strong>{' '}
                  to maintain absolute system consistency.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ Fully transactional audit network ]
              </div>
            </motion.div>

            {/* Tech 06 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[360px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINE // 06. SCALE & QUALITY
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  E2E Automation & Containerized DX
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Containerized a local multi-service ecosystem via{' '}
                  <strong>Docker Compose</strong> for reproducible
                  orchestration. Built comprehensive code assurance checks
                  utilizing
                  <strong> Vitest</strong> for deep component unit logic testing
                  and
                  <strong> Playwright</strong> for reliable multi-browser
                  cross-platform E2E test flows.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ Zero-config environment gate ]
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 4. CALL TO ACTION */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full flex flex-col sm:flex-row gap-6 items-center"
        >
          <button
            onClick={onExploreMap}
            className="w-full sm:w-auto px-10 py-5 border border-black bg-black text-white text-xs font-bold uppercase tracking-[0.25em] flex justify-between sm:justify-start items-center gap-12 transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <span>Explore Map</span>
            <span className="text-sm font-normal">→</span>
          </button>

          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-10 py-5 border border-black bg-white text-black text-xs font-bold uppercase tracking-[0.25em] flex justify-between sm:justify-start items-center gap-12 transition-all duration-300 hover:bg-black hover:text-white hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <span>Sign In</span>
            <span className="text-sm font-normal">→</span>
          </button>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default LandingPage;
