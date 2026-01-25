import React, { useState, useEffect, useCallback } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { X, Users, ShieldAlert, CheckCircle2, UserX } from 'lucide-react';
import { useRevokeAccess } from '../../hooks/useRevokeAccess';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

export const ManageAccessModal = ({ isOpen, onClose, slide }) => {
    const [buyers, setBuyers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [revokingAddress, setRevokingAddress] = useState(null);
    const client = useSuiClient();
    const { revokeAccess } = useRevokeAccess();

    const fetchBuyers = useCallback(async () => {
        if (!slide?.objectId) return;
        setIsLoading(true);

        try {
            console.log('[ACCESS] Fetching buyers for slide:', slide.objectId);
            const events = await client.queryEvents({
                query: {
                    MoveEventType: `${PACKAGE_ID}::slide_marketplace::LicensePurchased`,
                },
                order: 'descending',
            });

            if (events.data) {
                // Filter events for THIS slide and unique buyers
                const slideEvents = events.data.filter(e => e.parsedJson?.slide_id === slide.objectId);
                const uniqueBuyers = [];
                const seen = new Set();

                for (const e of slideEvents) {
                    const buyer = e.parsedJson.buyer;
                    if (!seen.has(buyer)) {
                        seen.add(buyer);
                        uniqueBuyers.push({
                            address: buyer,
                            version: e.parsedJson.version,
                            timestamp: e.timestampMs
                        });
                    }
                }
                setBuyers(uniqueBuyers);
            }
        } catch (err) {
            console.error('[ACCESS] Failed to fetch buyers:', err);
        } finally {
            setIsLoading(false);
        }
    }, [slide?.objectId, client]);

    useEffect(() => {
        if (isOpen) fetchBuyers();
    }, [isOpen, fetchBuyers]);

    const handleRevoke = async (address) => {
        if (!confirm(`Are you sure you want to revoke access for ${address}? They will no longer be able to use this slide.`)) return;

        setRevokingAddress(address);
        try {
            await revokeAccess(slide.objectId, address);
            alert('Access revoked successfully');
            // Optimistically update or just refetch
            fetchBuyers();
        } catch (err) {
            console.error('[ACCESS] Revoke failed:', err);
            alert('Failed to revoke access: ' + err.message);
        } finally {
            setRevokingAddress(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0d0d0d] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black dark:text-white tracking-tight">Manage Access</h2>
                            <p className="text-xs text-gray-500 font-medium truncate max-w-[300px]">{slide.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-500 font-medium tracking-wide">QUERYING BLOCKCHAIN EVENTS...</p>
                        </div>
                    ) : buyers.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                            </div>
                            <h3 className="text-lg font-bold dark:text-white mb-1">No Licenses Found</h3>
                            <p className="text-sm text-gray-500">No one has purchased a license for this slide yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Registered Buyers</span>
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{buyers.length} Users</span>
                            </div>
                            {buyers.map((buyer) => (
                                <div
                                    key={buyer.address}
                                    className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5 flex items-center justify-between group hover:border-red-500/20 transition-all"
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-12 h-12 bg-white dark:bg-black/30 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-600 border border-gray-100 dark:border-white/5">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-mono text-[11px] font-bold dark:text-gray-300 truncate w-[180px] sm:w-[280px]">
                                                {buyer.address}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tight">
                                                Bought v{buyer.version} • {new Date(parseInt(buyer.timestamp)).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRevoke(buyer.address)}
                                        disabled={revokingAddress === buyer.address}
                                        className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-red-500 transition-all flex items-center gap-2 group/btn active:scale-90"
                                    >
                                        {revokingAddress === buyer.address ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <UserX className="w-5 h-5" />
                                        )}
                                        <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Revoke</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-6 bg-red-50 dark:bg-red-950/20 border-t border-red-100 dark:border-red-900/20">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase text-red-700 dark:text-red-400 tracking-wider">Warning</p>
                            <p className="text-[10px] text-red-600/80 dark:text-red-400/60 leading-relaxed font-bold mt-0.5">
                                Revoking access will prevent this user from validating their license on-chain in the future. This action is permanent but can be undone by the user repurchasing a license.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
