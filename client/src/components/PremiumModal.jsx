import { useState } from 'react';
import { X, Crown, Check, Sparkles, Lock } from 'lucide-react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import toast from 'react-hot-toast';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x...';
const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || '0x...';
const PREMIUM_CONFIG = import.meta.env.VITE_PREMIUM_CONFIG || '0x...';

export const PremiumModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { mutate: executeTransaction } = useSignAndExecuteTransaction();
    const account = useCurrentAccount();

    if (!isOpen) return null;

    const handlePurchase = async () => {
        if (!account) {
            toast.error('Please connect your wallet first');
            return;
        }

        setLoading(true);
        try {
            const tx = new Transaction();

            // Split 0.001 SUI from gas for payment
            const [coin] = tx.splitCoins(tx.gas, [1_000_000]);

            // Call buy_premium function
            tx.moveCall({
                target: `${PACKAGE_ID}::premium_pass::buy_premium`,
                arguments: [
                    tx.object(PREMIUM_CONFIG),
                    coin,
                ],
            });

            executeTransaction(
                {
                    transaction: tx,
                    options: {
                        showEffects: true,
                        showObjectChanges: true,
                    },
                },
                {
                    onSuccess: (result) => {
                        console.log('Premium pass purchased!', result);
                        toast.success('🎉 Chúc mừng! Bạn đã trở thành thành viên Premium!', {
                            duration: 4000,
                        });
                        if (onSuccess) onSuccess();

                        // Reload page after 2 seconds to update premium status
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    },
                    onError: (error) => {
                        console.error('Purchase failed:', error);
                        toast.error('Giao dịch thất bại. Vui lòng thử lại.');
                        setLoading(false);
                    },
                }
            );

        } catch (error) {
            console.error('Transaction error:', error);
            toast.error('Giao dịch thất bại');
            setLoading(false);
        }
    };

    const benefits = [
        { icon: <Sparkles className="w-5 h-5" />, text: 'Access all premium shapes & animations' },
        { icon: <Lock className="w-5 h-5" />, text: 'Encrypted asset storage on IPFS' },
        { icon: <Crown className="w-5 h-5" />, text: 'Advanced 3D effects & transitions' },
        { icon: <Check className="w-5 h-5" />, text: 'Lifetime access - pay once, use forever' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-8 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center">
                        <Crown className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
                        <h2 className="text-3xl font-black mb-2">Go Premium</h2>
                        <p className="text-white/90 font-medium">Unlock the full power of the editor</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Benefits */}
                    <ul className="space-y-4 mb-8">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white">
                                    {benefit.icon}
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium pt-2">
                                    {benefit.text}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Pricing */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 text-center mb-6">
                        <div className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                            0.001 SUI
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 font-semibold">
                            Lifetime Access
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            One-time payment, no subscription
                        </div>
                    </div>

                    {/* Purchase Button */}
                    <button
                        onClick={handlePurchase}
                        disabled={loading || !account}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-black text-lg shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Crown className="w-5 h-5" />
                                Purchase Premium Pass
                            </>
                        )}
                    </button>

                    {!account && (
                        <p className="text-center text-sm text-red-500 mt-3">
                            Please connect your wallet to purchase
                        </p>
                    )}

                    <p className="text-center text-xs text-gray-500 dark:text-gray-600 mt-4">
                        Secured by SUI blockchain • Non-refundable
                    </p>
                </div>
            </div>
        </div>
    );
};
