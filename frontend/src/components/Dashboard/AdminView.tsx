import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Star,
  ArrowRight,
  Activity,
  BarChart3,
  Users,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router';

// Component import (existing admin + user view component)
import Proposals from '../MyAccount/Proposals';
import UsersManagementPage from '../MyAccount/UsersManagementPage';
import FavoriteSites from '../MyAccount/FavoriteSites';
import MyReviews from '../MyAccount/MyReviews';

// Data Hook & Store
import { useAllCulturalSites } from '../../hooks/data/useCulturalSitesQueries';
import { useProposals } from '../../hooks/data/useProposalQueries';
import { useAllUsers } from '../../hooks/data/useUserQueries';
import { useAdminAllReviews } from '../../hooks/data/useReviewQueries';
import useAuthStore from '../../store/authStore';

// Add data hooks related to personal (user) activities (excluding Proposals)
import { useMyFavorites } from '../../hooks/data/useFavoriteQueries';
import { useMyReviews } from '../../hooks/data/useReviewQueries';

// Subtle German Flag Accent Line Component (Opacity 15%)
const BerlinAccentLine = () => (
  <div className="flex h-0.5 w-full opacity-15 select-none pointer-events-none mb-6">
    <div className="bg-black w-1/3" />
    <div className="bg-[#D02128] w-1/3" />
    <div className="bg-[#F9D233] w-1/3" />
  </div>
);

// High-contrast white custom tooltip style properties for brutalist black dashboards only
const customTooltipProps = {
  contentStyle: {
    backgroundColor: '#000000',
    borderRadius: '0px',
    border: '2px solid #000000',
    padding: '10px 14px',
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.15)',
  },
  itemStyle: {
    color: '#FFFFFF',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  labelStyle: {
    color: '#FFFFFF',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '11px',
    fontWeight: '900',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: '4px',
    opacity: 0.75,
  },
};

const AdminView = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('management');
  const [activeAdminTab, setActiveAdminTab] = useState('stats');
  const [activePersonalTab, setActivePersonalTab] = useState('favorites');

  // ---[1. Global & Admin data loading] ---
  const { data: sites = [] } = useAllCulturalSites();
  const { data: proposals = [] } = useProposals();
  const { data: users = [] } = useAllUsers();

  const { data: adminReviewsData } = useAdminAllReviews(1, 100);
  const reviews = adminReviewsData?.reviews || [];
  const totalReviewsCount = adminReviewsData?.totalResults || 0;

  // ---[2. Individual (administrator) data loading] ---
  const currentUser = useAuthStore((state) => state.user);
  const { data: myFavorites = [] } = useMyFavorites(currentUser?._id);
  const { data: myReviews = [] } = useMyReviews();

  // Calculate the number of pending proposals
  const pendingProposalsCount = useMemo(() => {
    return proposals.filter((p) => p.status === 'pending').length;
  }, [proposals]);

  // ---[3. Admin statistical data processing] ---
  const reviewTimelineData = useMemo(() => {
    const timeline: Record<string, number> = {};
    reviews.forEach((review: any) => {
      if (!review.createdAt) return;
      const dateStr = new Date(review.createdAt).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
      });
      timeline[dateStr] = (timeline[dateStr] || 0) + 1;
    });
    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .reverse();
  }, [reviews]);

  const districtData = useMemo(() => {
    const stats: Record<string, number> = {};
    sites.forEach((site) => {
      const dist = site.address?.district || 'UNKNOWN';
      const upperDist = dist.toUpperCase();
      stats[upperDist] = (stats[upperDist] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sites]);

  const categoryData = useMemo(() => {
    const stats: Record<string, number> = {};
    sites.forEach((site) => {
      const cat = site.category || 'UNCATEGORIZED';
      const upperCat = cat.toUpperCase();
      stats[upperCat] = (stats[upperCat] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [sites]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 max-w-7xl font-sans bg-white text-black">
      <BerlinAccentLine />

      {/* Top header & mode switch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-zinc-400 block mb-2">
            Control Tower / System Administration
          </span>
          <h1 className="text-4xl font-black uppercase tracking-widest">
            System Dashboard
          </h1>
          <p className="text-sm font-light italic text-zinc-500 mt-1">
            {viewMode === 'management'
              ? 'Institutional overview and systemic asset records.'
              : 'Managing public registry suggestions and personal collection indexes.'}
          </p>
        </div>

        <Tabs
          value={viewMode}
          onValueChange={setViewMode}
          className="w-fit rounded-none"
        >
          <TabsList className="bg-zinc-100 p-1 border border-black rounded-none">
            <TabsTrigger
              value="management"
              className="rounded-none uppercase text-xs tracking-[0.15em] font-bold data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              Management
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className="rounded-none uppercase text-xs tracking-[0.15em] font-bold data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              My Activity
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* MANAGEMENT VIEW MODE                                                      */}
      {/* ========================================================================= */}
      {viewMode === 'management' && (
        <Tabs
          value={activeAdminTab}
          onValueChange={setActiveAdminTab}
          className="space-y-8 rounded-none"
        >
          {/* Tier 1: Top-level interactive core metrics grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 p-0.5">
            <StatCard
              title="Stats Insight"
              value={sites.length}
              subtitle="Registered historical locations"
              icon={<BarChart3 className="w-4 h-4 text-zinc-400" />}
              isActive={activeAdminTab === 'stats'}
              onClick={() => setActiveAdminTab('stats')}
            />
            <StatCard
              title="Users Management"
              value={users.length}
              subtitle="Active verified accounts"
              icon={<Users className="w-4 h-4 text-zinc-400" />}
              isActive={activeAdminTab === 'users'}
              onClick={() => setActiveAdminTab('users')}
            />
            <StatCard
              title="Pending Proposals"
              value={pendingProposalsCount}
              subtitle="Awaiting archival clearance"
              icon={<FileText className="w-4 h-4 text-zinc-400" />}
              badge={
                pendingProposalsCount > 0 ? pendingProposalsCount : undefined
              }
              isActive={activeAdminTab === 'proposals'}
              onClick={() => setActiveAdminTab('proposals')}
            />
            <StatCard
              title="Total Reviews Feed"
              value={totalReviewsCount}
              subtitle="Public citizen entries"
              icon={<Activity className="w-4 h-4 text-zinc-400" />}
              isActive={activeAdminTab === 'stats'}
              onClick={() => setActiveAdminTab('stats')}
            />
          </div>

          {/* 2nd floor: Workspace panel area corresponding to the selected tab card */}
          <div className="pt-4">
            {/* Statistics Visualization Tab (SaaS Asymmetric Dashboard Layout) */}
            <TabsContent
              value="stats"
              className="space-y-8 outline-none rounded-none mt-0"
            >
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Left 2nd column: Core visualization data and chart zone (Main Reports) */}
                <div className="lg:col-span-2 space-y-8 min-w-0">
                  {/* main line chart card */}
                  <Card className="border border-black rounded-none bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] w-full overflow-hidden">
                    <CardHeader className="border-b border-black rounded-none bg-zinc-50/50 py-4">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.25em] flex items-center gap-2">
                        <span className="w-2 h-2 bg-black rounded-none" />
                        Review Logged Velocity (Volume Over Time)
                      </CardTitle>
                    </CardHeader>
                    {/* Inject explicit size and min-w-0 to avoid losing width */}
                    <CardContent className="h-75 pt-6 relative w-full min-w-0">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                      >
                        <LineChart
                          data={reviewTimelineData}
                          margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid
                            stroke="#e4e4e7"
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            stroke="#000"
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#000"
                            fontSize={10}
                            fontFamily="monospace"
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={customTooltipProps.contentStyle}
                            itemStyle={customTooltipProps.itemStyle}
                            labelStyle={customTooltipProps.labelStyle}
                            formatter={(value) => [
                              `${value} Entries`,
                              'LOGGED',
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#000000"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#000' }}
                            activeDot={{ r: 6 }}
                            name="Reviews"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Bottom sub chart grid */}
                  <div className="grid gap-6 md:grid-cols-2 min-w-0">
                    {/* Category Distribution Chart */}
                    <Card className="border border-black rounded-none bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] w-full overflow-hidden">
                      <CardHeader className="border-b border-black rounded-none bg-zinc-50/50 py-4">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.25em]">
                          Archive Categories Volume
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-65 pt-6 relative w-full min-w-0">
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                          minWidth={0}
                        >
                          <BarChart data={categoryData} margin={{ bottom: 10 }}>
                            <CartesianGrid
                              stroke="#e4e4e7"
                              strokeDasharray="0"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="name"
                              stroke="#000"
                              tick={false}
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#000"
                              fontSize={10}
                              fontFamily="monospace"
                            />
                            <Tooltip
                              cursor={{ fill: '#f4f4f5' }}
                              contentStyle={customTooltipProps.contentStyle}
                              itemStyle={customTooltipProps.itemStyle}
                              labelStyle={customTooltipProps.labelStyle}
                              formatter={(value) => [
                                `${value} sites`,
                                'Volume',
                              ]}
                            />
                            <Bar
                              dataKey="value"
                              fill="#666666"
                              radius={0}
                              barSize={16}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Top data distribution chart by region */}
                    <Card className="border border-black rounded-none bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] w-full overflow-hidden">
                      <CardHeader className="border-b border-black rounded-none bg-zinc-50/50 py-4">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.25em]">
                          Distribution by Bezirk (Top)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-65 pt-6 relative w-full min-w-0">
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                          minWidth={0}
                        >
                          <BarChart
                            data={districtData.slice(0, 6)}
                            layout="vertical"
                            margin={{ left: 10, right: 10 }}
                          >
                            <CartesianGrid
                              stroke="#e4e4e7"
                              strokeDasharray="0"
                              horizontal={false}
                            />
                            <XAxis
                              type="number"
                              stroke="#000"
                              fontSize={10}
                              fontFamily="monospace"
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              stroke="#000"
                              fontSize={9}
                              width={130}
                              tickLine={false}
                              textAnchor="end"
                            />
                            <Tooltip
                              cursor={{ fill: '#f4f4f5' }}
                              contentStyle={customTooltipProps.contentStyle}
                              itemStyle={customTooltipProps.itemStyle}
                              labelStyle={customTooltipProps.labelStyle}
                              formatter={(value) => [`${value} sites`, 'Count']}
                            />
                            <Bar
                              dataKey="value"
                              fill="#000000"
                              radius={0}
                              barSize={10}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* 1st right column: Real-time system feed sidebar */}
                <div className="lg:col-span-1 min-w-0">
                  <Card className="border border-black rounded-none bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] h-full flex flex-col overflow-hidden w-full">
                    <CardHeader className="border-b border-black rounded-none bg-zinc-50 py-4 shrink-0">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.25em] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-600 animate-pulse" />
                        Live Archival Feed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 rounded-none divide-y divide-zinc-200 flex-1 overflow-y-auto max-h-165 min-h-0">
                      {reviews.length > 0 ? (
                        reviews.slice(0, 8).map((review: any, idx: number) => (
                          <div
                            key={review._id || idx}
                            className="p-4 flex flex-col gap-2 hover:bg-zinc-50/80 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold uppercase tracking-wider line-clamp-1">
                                {review.culturalSite?.name ||
                                  'CULTURAL SITE ASSET'}
                              </p>
                              <div className="flex items-center text-[10px] font-mono bg-black text-white px-1.5 py-0.5 whitespace-nowrap">
                                <Star className="w-2.5 h-2.5 fill-white mr-0.5" />
                                {review.rating}.0
                              </div>
                            </div>
                            <p className="text-xs text-zinc-600 font-light line-clamp-2 italic">
                              "{review.comment || 'No comment text provided.'}"
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mt-1">
                              <span>
                                BY: {review.user?.username || 'ANONYMOUS'}
                              </span>
                              <span>
                                {review.createdAt
                                  ? new Date(
                                      review.createdAt,
                                    ).toLocaleDateString('de-DE')
                                  : 'LOGGED'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-zinc-400 text-xs uppercase tracking-wider font-mono">
                          No recent system activities logged.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="proposals"
              className="outline-none rounded-none mt-0"
            >
              <Proposals />
            </TabsContent>
            <TabsContent
              value="users"
              className="outline-none rounded-none mt-0"
            >
              <UsersManagementPage />
            </TabsContent>
          </div>
        </Tabs>
      )}

      {/* ========================================================================= */}
      {/* PERSONAL VIEW MODE (INTEGRATED USER VIEW)                                */}
      {/* ========================================================================= */}
      {viewMode === 'personal' && (
        <>
          {!currentUser ? (
            <div className="flex items-center justify-center p-12 min-h-75">
              <Card className="w-full max-w-md border border-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] text-center bg-white">
                <CardContent className="p-8 rounded-none">
                  <h2 className="text-xl font-black uppercase tracking-[0.15em] mb-4">
                    Access Denied
                  </h2>
                  <p className="text-xs text-zinc-500 italic font-light mb-6">
                    Authentication is required to initialize the personal record
                    terminal.
                  </p>
                  <button className="w-full border border-black rounded-none bg-black text-white py-3 px-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-900 transition-colors">
                    Sign In <ArrowRight className="h-3 w-3" />
                  </button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-12">
              <Tabs
                value={activePersonalTab}
                onValueChange={setActivePersonalTab}
                className="w-full rounded-none space-y-8"
              >
                <div className="grid gap-4 md:grid-cols-2 p-0.5">
                  <UserStatCard
                    title="Saved Collections"
                    value={myFavorites.length}
                    caption="Bookmarked assets"
                    isActive={activePersonalTab === 'favorites'}
                    onClick={() => setActivePersonalTab('favorites')}
                  />
                  <UserStatCard
                    title="My Public Reviews"
                    value={myReviews.length}
                    caption="Logged testimonies"
                    isActive={activePersonalTab === 'reviews'}
                    onClick={() => setActivePersonalTab('reviews')}
                  />
                </div>

                <Card className="border-none shadow-none bg-transparent rounded-none">
                  <div className="mt-0">
                    <TabsContent
                      value="favorites"
                      className="focus-visible:outline-none rounded-none"
                    >
                      {myFavorites.length === 0 ? (
                        <EmptyStateView
                          tabName="Favorites"
                          message="No cultural sites cataloged in your private archive."
                          onNavigate={() => navigate('/')}
                        />
                      ) : (
                        <FavoriteSites />
                      )}
                    </TabsContent>

                    <TabsContent
                      value="reviews"
                      className="focus-visible:outline-none rounded-none"
                    >
                      {myReviews.length === 0 ? (
                        <EmptyStateView
                          tabName="Reviews"
                          message="Your commentary ledger is currently empty."
                          onNavigate={() => navigate('/')}
                        />
                      ) : (
                        <MyReviews />
                      )}
                    </TabsContent>
                  </div>
                </Card>
              </Tabs>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Interactive admin StatCard component based on fixed layout structure
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  isActive,
  onClick,
}: {
  title: string;
  value: any;
  subtitle: string;
  icon?: React.ReactNode;
  badge?: number;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left transition-all duration-200 border border-black rounded-none bg-white font-sans ${
      isActive
        ? 'ring-1 ring-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5'
        : 'shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]'
    }`}
  >
    <CardContent className="p-5 rounded-none flex flex-col h-full justify-between bg-transparent">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            {title}
          </div>
          {icon && <div className="shrink-0">{icon}</div>}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-3xl font-black tracking-tight font-mono text-black">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {badge !== undefined && (
            <span className="bg-red-500 text-white border border-black text-[9px] font-mono font-bold px-1.5 py-0.5 animate-pulse">
              {badge} NEW
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="h-px w-6 bg-black my-2 opacity-50" />
        <p className="text-[11px] italic font-light text-zinc-400 line-clamp-1">
          {subtitle}
        </p>
      </div>
    </CardContent>
  </button>
);

// Interactive user metrics card based on fixed layout without shifting
const UserStatCard = ({
  title,
  value,
  caption,
  isActive,
  onClick,
}: {
  title: string;
  value: number;
  caption: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left transition-all duration-200 border border-black rounded-none bg-white font-sans ${
      isActive
        ? 'ring-1 ring-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5'
        : 'shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]'
    }`}
  >
    <CardContent className="p-5 rounded-none flex justify-between items-center bg-transparent">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-black">
          {title}
        </div>
        <p className="text-xs italic font-light text-zinc-400 mt-0.5">
          {caption}
        </p>
      </div>
      <div className="text-3xl font-black font-mono text-black">{value}</div>
    </CardContent>
  </button>
);

// EmptyStateView for private activities only
const EmptyStateView = ({
  tabName,
  message,
  onNavigate,
}: {
  tabName: string;
  message: string;
  onNavigate: () => void;
}) => (
  <div className="text-center py-16 border border-dashed border-zinc-400 rounded-none bg-zinc-50/50">
    <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1">
      INDEX_EMPTY / {tabName.toUpperCase()}
    </p>
    <p className="text-sm font-light italic text-zinc-600 mb-6">{message}</p>
    <button
      onClick={onNavigate}
      className="inline-flex items-center gap-2 border border-black bg-white hover:bg-black hover:text-white px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.2em] transition-colors rounded-none"
    >
      Explore Berlin Map <ArrowRight className="h-3 w-3" />
    </button>
  </div>
);

export default AdminView;
