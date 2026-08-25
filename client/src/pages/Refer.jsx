// Refer & Earn — a user shares their referral code/link; friends who register
// with it credit the referrer. (Rewards are tracked as a count for now; actual
// reward payout is an admin/business decision to layer on later.)

import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Refer() {
  const { user } = useAuth();
  const code = user?.referralCode || '';
  const count = user?.referralCount || 0;
  const link = `${window.location.origin}/register?ref=${code}`;

  const shareText = `Use MithilaVahan for cabs, tempos & buses in Darbhanga/Muzaffarpur. Sign up with my code ${code}: ${link}`;

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Refer & Earn</h1>
      <p className="text-gray-600 mb-6">
        Invite friends and family in Mithilanchal. When they join with your code, it counts
        towards your referrals.
      </p>

      <div className="bg-white border rounded-xl p-5 text-center mb-4">
        <div className="text-sm text-gray-500">Your referral code</div>
        <div className="text-3xl font-bold tracking-widest text-brand-600 my-2">{code}</div>
        <button onClick={() => copy(code, 'Code')} className="text-sm text-brand-600 font-medium">
          Copy code
        </button>
      </div>

      <div className="bg-white border rounded-xl p-5 mb-4">
        <div className="text-sm text-gray-500 mb-1">Your invite link</div>
        <div className="text-xs text-gray-600 break-all mb-3">{link}</div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-md text-sm"
          >
            Share on WhatsApp
          </a>
          <button onClick={() => copy(link, 'Link')} className="border px-4 py-2 rounded-md text-sm">
            Copy link
          </button>
        </div>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
        <div className="text-3xl font-bold text-brand-700">{count}</div>
        <div className="text-sm text-gray-600">friends joined with your code</div>
      </div>
    </div>
  );
}
