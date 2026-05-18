import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDeleteMyAccount } from '../../hooks/data/useUserQueries';
import BackButton from '../BackButton';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const {
    mutate: deleteAccount,
    isPending: isDeleting,
    isSuccess: isDeleted,
    isError: isDeleteError,
    error: deleteError,
  } = useDeleteMyAccount();

  useEffect(() => {
    if (isDeleted) {
      console.log('Account deleted, redirecting to login...');
      navigate('/login');
    }
  }, [isDeleted, navigate]);

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Are you absolutely sure you want to delete your account? This action is irreversible and all your data will be permanently lost.',
      )
    ) {
      deleteAccount();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl mt-16 flex justify-center items-center">
      <div className="relative w-full bg-white border border-black p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
        
        <div className="absolute top-0 left-0 w-full h-[3px] flex opacity-15">
          <div className="bg-black w-1/3 h-full"></div>
          <div className="bg-[#FF0000] w-1/3 h-full"></div>
          <div className="bg-[#FFCC00] w-1/3 h-full"></div>
        </div>

        <div className="flex justify-start mb-10 text-sm uppercase tracking-[0.25em] font-medium">
          <BackButton />
        </div>

        <h2 className="text-2xl font-black text-[#FF0000] uppercase tracking-[0.25em] mb-4 text-left">
          Termination of Account
        </h2>
        
        <p className="text-xs italic text-[#FF0000] font-light tracking-wide mb-8 block opacity-80">
          / Critical Action: Permanent removal from the Berlin Modern Digital Portal.
        </p>

        <p className="text-sm text-black leading-7 mb-10 font-normal border-l-2 border-[#FF0000] pl-4">
          Please be aware that deleting your account is a permanent action. All
          your associated data, including your reviews, favorite sites, and
          personal information, will be irreversibly removed from our system.
          This action cannot be undone.
        </p>

        {isDeleteError && (
          <div
            className="border border-[#FF0000] bg-white text-[#FF0000] text-xs p-4 mb-8 tracking-wide flex flex-col gap-1"
            role="alert"
          >
            <strong className="font-bold uppercase tracking-wider">[System Error]</strong>
            <span className="font-mono text-black">
              {deleteError?.message || 'Failed to delete account. Please try again.'}
            </span>
          </div>
        )}

        <button
          onClick={handleDeleteAccount}
          className="w-full px-6 py-4 border border-[#FF0000] bg-[#FF0000] text-white text-xs font-bold uppercase tracking-[0.25em] flex justify-between items-center transition-all duration-300 hover:bg-white hover:text-[#FF0000] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          disabled={isDeleting}
        >
          <span>{isDeleting ? 'Processing Termination...' : 'Confirm Termination'}</span>
          <span className="text-sm font-normal ml-2">→</span>
        </button>

        <p className="text-[11px] font-mono text-gray-400 mt-8 text-left tracking-tight border-t border-gray-100 pt-4">
          FOR INQUIRIES, PLEASE CONTACT THE ARCHIVE SERVICE PORTAL.
        </p>
      </div>
    </div>
  );
};

export default DeleteAccount;