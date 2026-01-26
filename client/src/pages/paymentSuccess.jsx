import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowUpRight, Wallet, Copy, ShieldCheck, ArrowLeft } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

export const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Expect state: { slide, txDigest, tier, expiryDate }
    const { slide, txDigest, tier, expiryDate } = location.state || {};

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        if (!slide || !txDigest) {
            // Redirect if accessed directly without state
            navigate('/market');
        }
    }, [slide, txDigest, navigate]);

    if (!slide) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">

                {/* Header/Logo Area */}
                <div className="absolute top-[-100px] left-0 right-0 flex justify-center mb-12">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/market')}>
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="font-black text-xs">S</span>
                        </div>
                        <span className="font-black text-xl tracking-tighter">SlideSui</span>
                    </div>
                </div>

                {/* Success Icon */}
                <div
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-in zoom-in-50 duration-700"
                >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </div>

                <h1 className="text-5xl font-black text-white mb-4 tracking-tight animate-in slide-in-from-bottom-4 duration-700 delay-100">
                    License Successfully Acquired!
                </h1>
                <p className="text-xl text-gray-400 mb-12 max-w-xl font-medium animate-in slide-in-from-bottom-4 duration-700 delay-200">
                    Your presentation license is now minted and secured on the Sui blockchain.
                </p>

                {/* Card */}
                <div
                    className="w-full max-w-sm bg-[#13131a] border border-white/10 rounded-[32px] overflow-hidden p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-300"
                >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 group">
                        {slide.thumbnail ? (
                            <img src={slide.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <span className="text-gray-500">No Preview</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-lg border border-green-500/20 backdrop-blur-md">
                                ACTIVE LICENSE
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 px-2 pb-2">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1 text-left">Transaction Hash</p>
                            <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between group/hash cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigator.clipboard.writeText(txDigest)}>
                                <span className="text-sm font-mono text-white truncate max-w-[200px]">
                                    {txDigest}
                                </span>
                                <Copy className="w-4 h-4 text-gray-500 group-hover/hash:text-white transition-colors" />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Expiration Date</p>
                                <p className="text-sm font-bold text-white">{expiryDate}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Status</p>
                                <p className="text-sm font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                                    Confirmed <ShieldCheck className="w-3 h-3" />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full justify-center animate-in slide-in-from-bottom-8 duration-700 delay-500">
                    <button
                        onClick={() => navigate(`/editor/${slide.id}`)}
                        className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 min-w-[200px]"
                    >
                        <ArrowUpRight className="w-5 h-5" /> Open in Editor
                    </button>
                    <button
                        onClick={() => navigate('/my-slide')}
                        className="px-8 py-4 bg-[#1e1e24] hover:bg-[#25252c] text-white rounded-2xl font-black border border-white/10 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 min-w-[200px]"
                    >
                        <Wallet className="w-5 h-5" /> Go to My Assets
                    </button>
                </div>

                <div className="mt-8 text-gray-500 text-xs font-medium animate-in fade-in duration-700 delay-700 flex items-center gap-4">
                    <button onClick={() => navigate('/market')} className="text-white hover:text-cyan-400 font-bold transition-all flex items-center gap-1.5">
                        <ArrowLeft className="w-3 h-3" /> Back to Marketplace
                    </button>
                    <span className="w-1 h-1 bg-gray-800 rounded-full" />
                    <button className="hover:text-white transition-all underline decoration-gray-700 underline-offset-4">Contact Support</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
