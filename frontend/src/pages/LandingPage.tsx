import { useNavigate } from 'react-router';
import { motion, Variants } from 'framer-motion';

interface LandingPageProps {
  onExploreMap: () => void;
  onSignIn: () => void;
}

const LandingPage = ({ onExploreMap, onSignIn }: LandingPageProps) => {
  const navigate = useNavigate();

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
    <div className="w-full bg-[#FFFFFF] text-[#000000] relative select-none font-sans">
      {/* Bauhaus Accent Top Border */}
      <div className="absolute top-0 left-0 w-full h-[3px] flex opacity-20 z-50">
        <div className="bg-black w-1/3 h-full"></div>
        <div className="bg-[#FF0000] w-1/3 h-full"></div>
        <div className="bg-[#FFCC00] w-1/3 h-full"></div>
      </div>

      <main className="container mx-auto px-6 pt-32 pb-32 max-w-7xl flex flex-col justify-between">
        {/* 1. HERO SECTION */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col items-start mb-24"
        >
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
              automated OpenStreetMap cron pipelines, efficient caching layers,
              and a robust role-based evaluation architecture.
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
        </motion.div>

        {/* 2. PERFORMANCE METRICS GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="w-full flex flex-col items-start mb-16"
        >
          <div className="text-[11px] font-mono text-gray-400 uppercase tracking-[0.25em] mb-4">
            // PERFORMANCE AUDIT (LIGHTHOUSE MOBILE)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 w-full border-t border-l border-black">
            <div className="p-6 border-r border-b border-black font-mono">
              <div className="text-[10px] text-gray-400 uppercase">
                Total Blocking Time (TBT)
              </div>
              <div className="text-3xl font-black my-2 text-[#FF0000]">
                550ms → 80ms
              </div>
              <p className="text-[11px] font-sans text-gray-500 leading-relaxed">
                Reduced main-thread blocking by 85%, eliminating user-interface
                jank and freezes on low-spec mobile devices during map
                initialization.
              </p>
            </div>

            <div className="p-6 border-r border-b border-black font-mono">
              <div className="text-[10px] text-gray-400 uppercase">
                Speed Index (Visual Finish)
              </div>
              <div className="text-3xl font-black my-2">6.1s → 3.0s</div>
              <p className="text-[11px] font-sans text-gray-500 leading-relaxed">
                Leveraged Vite & Rollup manual-chunks code-splitting combined
                with lazy/Suspense boundaries to cut perceived loading latency
                by 50%.
              </p>
            </div>

            <div className="p-6 border-r border-b border-black font-mono">
              <div className="text-[10px] text-gray-400 uppercase">
                Network Connection Time
              </div>
              <div className="text-3xl font-black my-2">LCP Savings ~300ms</div>
              <p className="text-[11px] font-sans text-gray-500 leading-relaxed">
                Established early connection handshakes with third-party tile
                grids and API servers by implementing strategic{' '}
                <span className="underline decoration-[#FF0000]">
                  preconnect
                </span>{' '}
                directives.
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
            <span>[ SYSTEM ARCHITECTURE & ENGINEERING SOLVED ]</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Tech 01 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[340px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINEERING // 01. GEOSPATIAL INDEXING
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  Web Worker & Supercluster (R-Tree)
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  To prevent main-thread freezing during high-density geospatial
                  point clustering, a <strong>Web Worker</strong> architecture
                  was introduced. By offloading computational weight, the
                  application executes hierarchical{' '}
                  <strong>R-Tree spatial indexing</strong> in a background
                  thread, streaming only viewport-bounded Bounding Box
                  coordinate matrices back to the UI to sustain continuous 60fps
                  pans and zooms.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ O(n) scan ➔ O(log n) R-Tree lookup ]
              </div>
            </motion.div>

            {/* Tech 02 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[340px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINEERING // 02. MEMORY ACCELERATION
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  Flyweight Pattern Icon Caching
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Diagnosed severe CPU overloads triggered by repeated calls to
                  React's static DOM serialization engine (
                  <span className="font-mono">renderToString</span>) during mass
                  marker mounts. Engineered a{' '}
                  <strong>Flyweight design pattern</strong> that isolates
                  category-specific custom markers into a singleton-style asset
                  pool, reducing redundant sub-engine executions from 17,000
                  instances to a constant pool of 20.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ 99.9% render reduction verified ]
              </div>
            </motion.div>

            {/* Tech 03 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[340px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINEERING // 03. ACQUISITION PIPELINE
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  LOD & Warm-up Delay Strategy
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Orchestrated a progressive{' '}
                  <strong>Level of Detail (LOD)</strong> data streaming pipeline
                  to neutralize initial payload network overhead. The
                  application prioritizes rendering aggregate district
                  statistical polygons first. It then initiates a calculated
                  1,200ms <strong>Warm-up Delay</strong>, asynchronously
                  fetching the complete raw marker infrastructure only after the
                  core interface completes its primary layout layout shift.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ Non-blocking data orchestration ]
              </div>
            </motion.div>

            {/* Tech 04 */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[340px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINEERING // 04. DATA INTEGRITY
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  RBAC Flow & Replica Set Transactions
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Enforced secure Google OAuth 2.0 integration and restricted{' '}
                  <span className="font-mono">httpOnly</span> cookie-based JWT
                  session state managed via strict route-level RBAC guards. When
                  user-submitted modifications are validated through the
                  administrative audit interface, data consistency across
                  independent collections is absolute, achieved via{' '}
                  <strong>
                    MongoDB Replica Set multi-document atomic transactions
                  </strong>
                  .
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ Fully transactional audit network ]
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[340px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINEERING // 05. QUALITY ASSURANCE
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  Multi-Layered Testing & E2E Automation
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  Going beyond simple UI implementation, I established a
                  multi-layered test suite to ensure long-term application
                  sustainability. Isolated unit testing of business logic was
                  executed using <strong>Vitest & RTL</strong>, while an E2E
                  guard was built with <strong>Playwright</strong> to
                  automatically validate critical user scenarios—such as
                  authentication flows, map interactions, and marker
                  filtering—across a multi-browser environment.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ Vitest Unit + Playwright E2E Integrity ]
              </div>
            </motion.div>

            {/* Tech 06: 도커 및 CI/CD (DX) */}
            <motion.div
              whileHover={{ y: -6, x: -6 }}
              className="p-8 border border-black bg-white flex flex-col justify-between h-[340px] transition-shadow duration-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group"
            >
              <div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  ENGINEERING // 06. DEVELOPER EXPERIENCE
                </div>
                <h4 className="text-lg font-black uppercase tracking-wider mb-3">
                  Deterministic DX & CI Pipeline
                </h4>
                <p className="text-xs text-gray-600 leading-6 font-sans">
                  To facilitate team collaboration and scalability, I packaged a
                  3-service local infrastructure stack based on{' '}
                  <strong>Docker Compose</strong>. This delivers a highly
                  idempotent development environment with automated environment
                  variables and data seeding. Furthermore, I elevated the DX
                  (Developer Experience) by enforcing a{' '}
                  <strong>GitHub Actions</strong> pipeline on every Pull
                  Request, ensuring that only code verified by linting,
                  formatting (Prettier), and testing is merged into the main
                  branch.
                </p>
              </div>
              <div className="font-mono text-[10px] text-[#FF0000] tracking-widest uppercase font-bold">
                [ Zero-config local boot + Automation Gate ]
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
            <span>Initialize Map Explorer Engine</span>
            <span className="text-sm font-normal">→</span>
          </button>

          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-10 py-5 border border-black bg-white text-black text-xs font-bold uppercase tracking-[0.25em] flex justify-between sm:justify-start items-center gap-12 transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <span>Sign In</span>
            <span className="text-sm font-normal">→</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
