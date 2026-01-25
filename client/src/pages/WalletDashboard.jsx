import { useCurrentAccount, useSuiClientQuery, useSuiClient } from "@mysten/dapp-kit";
import { Copy, Wallet, ShieldCheck, Activity, BarChart3, Zap, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useMySlides } from "../hooks/useMySlides";
import { usePremiumStatus } from "../hooks/usePremiumStatus";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Wallet Dashboard - Visual interface for wallet stats & activity
 */
export const WalletDashboard = () => {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const { slides } = useMySlides();
    const { isPremium } = usePremiumStatus();

    // Fetch SUI Balance
    const { data: balanceData } = useSuiClientQuery("getBalance", {
        owner: account?.address || "",
    });

    const [suiPrice, setSuiPrice] = useState(1.85); // Mock price for demo (or fetch real)
    const balance = balanceData ? parseInt(balanceData.totalBalance) / 1_000_000_000 : 0;

    const copyAddress = () => {
        if (account?.address) {
            navigator.clipboard.writeText(account.address);
            toast.success("Address copied to clipboard");
        }
    };

    const truncateAddress = (addr) => {
        if (!addr) return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Activity Mock Data (In reality, would fetch events)
    const activities = [
        {
            id: 1,
            type: "purchase",
            title: "License Acquired",
            desc: "Web3 Fundamentals v2",
            amount: "-10 SUI",
            time: "2h ago",
            icon: <ArrowDownLeft className="w-4 h-4 text-cyan-500" />
        },
        {
            id: 2,
            type: "mint",
            title: "New Slide Minted",
            desc: "Sui Move Programming",
            amount: "-0.05 SUI",
            time: "5h ago",
            icon: <Zap className="w-4 h-4 text-green-500" />
        },
        {
            id: 3,
            type: "income",
            title: "Royalty Received",
            desc: "From Marketplace Sales",
            amount: "+45.2 SUI",
            time: "Yesterday",
            icon: <ArrowUpRight className="w-4 h-4 text-yellow-500" />
        },
        {
            id: 4,
            type: "connect",
            title: "Wallet Connected",
            desc: "Brave Browser Extension",
            amount: "",
            time: "2d ago",
            icon: <Clock className="w-4 h-4 text-gray-400" />
        }
    ];

    if (!account) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-black mb-4 dark:text-white">Wallet Not Connected</h2>
                <p className="text-gray-500 mb-8 max-w-md text-center">Please connect your SUI wallet to access the dashboard analytics and manage your assets.</p>
            </div>
        );
    }

    return (
        <div className="py-8 text-left">
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-cyan-600 dark:text-cyan-400">
                            Connected to Sui Testnet
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                        Wallet Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl font-medium leading-relaxed">
                        Manage your presentation slide licenses, monitor network status, and track recent blockchain interactions on the Sui network.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/settings" className="p-3 bg-gray-100 dark:bg-white/5 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        <SettingsIcon />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - Stats & Cards */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Main Wallet Card */}
                    <div className="bg-gradient-to-br from-gray-900 via-[#0d1620] to-black dark:from-[#0d0d0d] dark:to-black rounded-[40px] p-8 md:p-10 border border-gray-200 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/15 transition-all duration-1000"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 h-full">
                            <div className="flex flex-col justify-between h-full min-h-[220px]">
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 mb-3">Active Wallet</p>
                                    <div className="flex items-center gap-3 mb-8">
                                        <h2 className="text-3xl md:text-4xl font-mono text-white font-bold tracking-tight">
                                            {truncateAddress(account.address)}
                                        </h2>
                                        <button onClick={copyAddress} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="hidden md:flex gap-8">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Total Balance</p>
                                        <p className="text-2xl font-black text-white">{balance.toFixed(2)} SUI</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Digital Assets</p>
                                        <p className="text-2xl font-black text-white">{slides.length} Slides</p>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Element */}
                            <div className="flex-1 flex items-center justify-center md:justify-end">
                                <div className="w-full md:w-64 aspect-square bg-gradient-to-br from-cyan-500/20 to-blue-600/10 rounded-3xl border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm relative">
                                    <Wallet className="w-16 h-16 text-cyan-400 mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                                    <span className="px-4 py-1.5 bg-black/40 rounded-full text-[10px] font-bold text-cyan-400 uppercase tracking-widest border border-cyan-500/20">
                                        {isPremium ? "Premium Account" : "Verified Identity"}
                                    </span>

                                    {/* Floating Particles */}
                                    <div className="absolute top-4 left-4 w-2 h-2 bg-white/20 rounded-full animate-bounce"></div>
                                    <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-pulse"></div>
                                </div>
                            </div>

                            {/* Mobile Stats */}
                            <div className="flex md:hidden gap-6 border-t border-white/10 pt-6">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Balance</p>
                                    <p className="text-xl font-black text-white">{balance.toFixed(2)} SUI</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Assets</p>
                                    <p className="text-xl font-black text-white">{slides.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-[#0d0d0d] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all group">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Detected Role</p>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{slides.length > 0 ? "Creator" : "Viewer"}</h3>
                            <p className="text-xs text-gray-500">{slides.length > 0 ? "Can mint & list slide sets" : "Browse & collect slides"}</p>
                        </div>

                        <div className="bg-white dark:bg-[#0d0d0d] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all group">
                            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Network</p>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">SUI Testnet</h3>
                            <p className="text-xs text-gray-500">Latency: 12ms • Healthy</p>
                        </div>

                        <div className="bg-white dark:bg-[#0d0d0d] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all group">
                            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Status</p>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{isPremium ? "Premium" : "Standard"}</h3>
                            <p className="text-xs text-gray-500">Tier: {isPremium ? "Professional" : "Basic"}</p>
                        </div>
                    </div>

                    {/* Action Call */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link to="/editor" className="flex items-center justify-center gap-2 p-5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all active:scale-[0.98]">
                            Mint New Presentation
                        </Link>
                        <Link to="/market" className="flex items-center justify-center gap-2 p-5 bg-gray-800 dark:bg-white/5 hover:bg-gray-700 dark:hover:bg-white/10 text-white rounded-2xl font-black border border-transparent dark:border-white/10 transition-all active:scale-[0.98]">
                            Explore Marketplace
                        </Link>
                    </div>

                </div>

                {/* Right Column - Activity Feed */}
                <div className="bg-white dark:bg-[#0d0d0d] rounded-[32px] border border-gray-200 dark:border-white/5 p-6 h-fit sticky top-24">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent Activity</h3>
                        <button className="p-2 pb-0 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                            <Clock className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {activities.map((item) => (
                            <div key={item.id} className="group flex gap-4">
                                <div className="mt-1 w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{item.title}</h4>
                                    <p className="text-xs text-gray-500 font-medium mb-1.5">{item.desc}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-black text-gray-400">{item.time}</span>
                                        {item.title === 'Wallet Connected' && <span className="text-[10px] text-gray-500">• {truncateAddress(account.address)}</span>}
                                    </div>
                                </div>
                                {item.amount && (
                                    <div className="text-right">
                                        <span className={`text-xs font-black ${item.amount.startsWith('+') ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                                            {item.amount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <button className="w-full text-center text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
                            View All Transactions
                        </button>
                    </div>
                </div>

            </div>

            {/* Footer Stats */}
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Protocol TVL</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">$1.2M USD</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Daily Volume</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">14.8k SUI</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Active Creators</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">2,402</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Gas Price</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">750 MIST</p>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const SettingsIcon = () => (
    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default WalletDashboard;
