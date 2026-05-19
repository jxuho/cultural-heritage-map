import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

import FavoriteSites from '../MyAccount/FavoriteSites';
import MyReviews from '../MyAccount/MyReviews';
import MyProposalsList from '../MyAccount/MyProposalsList';
import useAuthStore from '../../store/authStore';

// data hook
import { useMyFavorites } from '../../hooks/data/useFavoriteQueries';
import { useMyReviews } from '../../hooks/data/useReviewQueries';
import { useMyProposals } from '../../hooks/data/useProposalQueries';
import { useNavigate } from 'react-router';

const BerlinAccentLine = () => (
  <div className="flex h-0.5 w-full opacity-15 select-none pointer-events-none mb-6">
    <div className="bg-black w-1/3" />
    <div className="bg-[#D02128] w-1/3" />
    <div className="bg-[#F9D233] w-1/3" />
  </div>
);

const UserView = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('favorites');

  const { data: favorites = [] } = useMyFavorites(currentUser?._id);
  const { data: reviews = [] } = useMyReviews();
  const { data: proposals = [] } = useMyProposals();

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center p-12 min-h-100">
        <Card className="w-full max-w-md border border-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] text-center bg-white">
          <CardContent className="p-8 rounded-none">
            <h2 className="text-xl font-black uppercase tracking-[0.15em] mb-4">
              Access Denied
            </h2>
            <p className="text-xs text-zinc-500 italic font-light mb-6">
              Authentication is required to initialize the record terminal.
            </p>
            <button className="w-full border border-black rounded-none bg-black text-white py-3 px-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-900 transition-colors">
              Sign In <ArrowRight className="h-3 w-3" />
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 max-w-6xl font-sans bg-white text-black">
      <BerlinAccentLine />

      {/* Wrap the whole thing in the shadcn Tabs component, matching the top card to act as a Trigger. */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full rounded-none space-y-12"
      >
        {/* User activity summary metrics grid (acts as tab button) */}
        <div className="grid gap-4 md:grid-cols-3">
          <UserStatCard
            title="Saved Collections"
            value={favorites.length}
            caption="Bookmarked assets"
            isActive={activeTab === 'favorites'}
            onClick={() => setActiveTab('favorites')}
          />
          <UserStatCard
            title="My Public Reviews"
            value={reviews.length}
            caption="Logged testimonies"
            isActive={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
          />
          <UserStatCard
            title="Submitted Proposals"
            value={proposals.length}
            caption="Archival expansion inputs"
            isActive={activeTab === 'proposals'}
            onClick={() => setActiveTab('proposals')}
          />
        </div>

        {/* Main content tab interface */}
        <Card className="border-none shadow-none bg-transparent rounded-none">
          <div className="mt-6">
            <TabsContent
              value="favorites"
              className="focus-visible:outline-none rounded-none"
            >
              {favorites.length === 0 ? (
                <EmptyStateView
                  tabName="Favorites"
                  message="No cultural sites cataloged in your private archive."
                />
              ) : (
                <FavoriteSites />
              )}
            </TabsContent>

            <TabsContent
              value="reviews"
              className="focus-visible:outline-none rounded-none"
            >
              {reviews.length === 0 ? (
                <EmptyStateView
                  tabName="Reviews"
                  message="Your commentary ledger is currently empty."
                />
              ) : (
                <MyReviews />
              )}
            </TabsContent>

            <TabsContent
              value="proposals"
              className="focus-visible:outline-none rounded-none"
            >
              {proposals.length === 0 ? (
                <EmptyStateView
                  tabName="Proposals"
                  message="No registry expansions have been initiated by your account."
                />
              ) : (
                <MyProposalsList />
              )}
            </TabsContent>
          </div>
        </Card>
      </Tabs>
    </div>
  );
};

// Modified metric card to act as a button (added active style)
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
    <CardContent className="p-5 rounded-none flex justify-between items-center bg-transparent border-none shadow-none">
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

const EmptyStateView = ({
  tabName,
  message,
}: {
  tabName: string;
  message: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="text-center py-16 border border-dashed border-zinc-400 rounded-none bg-zinc-50/50">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1">
        INDEX_EMPTY / {tabName.toUpperCase()}
      </p>
      <p className="text-sm font-light italic text-zinc-600 mb-6">{message}</p>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 border border-black bg-white hover:bg-black hover:text-white px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.2em] transition-colors rounded-none"
      >
        Explore Berlin Map <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};

export default UserView;