import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle2, ChevronRight, Info, ShieldCheck, Wallet, Clock, Zap, ArrowUpRight, AlertCircle, Copy } from "lucide-react";

/**
 * CheckoutModal - Multi-step licensing purchase flow
 */
export const CheckoutModal = ({ isOpen, onClose, slide, onPurchaseSuccess }) => {
    const [step, setStep] = useState(1);
    const [selectedTier, setSelectedTier] = useState(1); // 1=Month, 2=Year, 3=Lifetime
    const [isLoading, setIsLoading] = useState(false);
    const [txDigest, setTxDigest] = useState("");
    const navigate = useNavigate();

    if (!isOpen) return null;

    // Real pricing logic from slide object - Ensure numbers to avoid string concatenation
    const monthlyPrice = Number(slide.monthlyPrice || slide.price || 0);
    const yearlyPrice = Number(slide.yearlyPrice || 0);
    const lifetimePrice = Number(slide.lifetimePrice || 0);

    const currentPrice = selectedTier === 1 ? monthlyPrice : selectedTier === 2 ? yearlyPrice : lifetimePrice;
    const platformFee = Math.floor(currentPrice * 0.02); // 2%
    const totalAmount = currentPrice + platformFee;

    const handleNextStep = () => setStep(prev => prev + 1);
    const handlePrevStep = () => setStep(prev => prev - 1);

    // Helper to calculate expiry date for the redirect state
    const getExpiryDate = (tier) => {
        if (tier === 3) return "Infinity / Lifetime";
        const date = new Date();
        if (tier === 1) date.setMonth(date.getMonth() + 1);
        if (tier === 2) date.setFullYear(date.getFullYear() + 1);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const confirmAndPay = async () => {
        setIsLoading(true);
        setStep(3);
        try {
            // Call the parent handlePurchase which uses the hook
            const result = await onPurchaseSuccess({
                slideId: slide.id,
                price: totalAmount,
                durationType: selectedTier
            });

            if (result?.digest) {
                setTxDigest(result.digest);
                // Redirect to full-page success instead of inline step 4
                navigate('/payment-success', {
                    state: {
                        slide,
                        txDigest: result.digest,
                        tier: selectedTier,
                        expiryDate: getExpiryDate(selectedTier)
                    }
                });
                onClose(); // Close modal
            }
        } catch (err) {
            console.error("Purchase error:", err);
            setStep(2); // Go back if error
        } finally {
            setIsLoading(false);
        }
    };

    const formatSui = (mist) => (mist / 1_000_000_000).toFixed(2);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={step !== 3 ? onClose : undefined} />

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl bg-[#0a0a0f] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] transition-all duration-500 transform">

                {/* Left Side: Steps & Form */}
                <div className="flex-1 p-8 md:p-12 flex flex-col">

                    {/* Progress Header */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <StepIndicator currentStep={step} stepNumber={1} label="Duration" icon={<Clock className="w-4 h-4" />} />
                        <div className="w-12 h-px bg-white/10" />
                        <StepIndicator currentStep={step} stepNumber={2} label="Review" icon={<Info className="w-4 h-4" />} />
                        <div className="w-12 h-px bg-white/10" />
                        <StepIndicator currentStep={step} stepNumber={3} label="Confirm" icon={<CheckCircle2 className="w-4 h-4" />} />
                        <div className="w-12 h-px bg-white/10" />
                        <StepIndicator currentStep={step} stepNumber={4} label="Sign" icon={<Zap className="w-4 h-4" />} />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                        {step === 1 && (
                            <DurationStep
                                selectedTier={selectedTier}
                                setSelectedTier={setSelectedTier}
                                monthlyPrice={monthlyPrice}
                                yearlyPrice={yearlyPrice}
                                lifetimePrice={lifetimePrice}
                                formatSui={formatSui}
                            />
                        )}
                        {step === 2 && (
                            <ReviewStep
                                slide={slide}
                                tier={selectedTier}
                                price={currentPrice}
                                formatSui={formatSui}
                            />
                        )}
                        {step === 3 && (
                            <ProcessingStep />
                        )}
                        {step === 4 && (
                            <SuccessStep
                                slide={slide}
                                txDigest={txDigest}
                                tier={selectedTier}
                                onClose={onClose}
                            />
                        )}
                    </div>

                    {/* Footer Actions */}
                    {step < 3 && (
                        <div className="mt-8 flex justify-between">
                            {step > 1 ? (
                                <button onClick={handlePrevStep} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                                    Back
                                </button>
                            ) : <div></div>}

                            {step === 1 ? (
                                <button onClick={handleNextStep} className="flex items-center gap-2 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/20 transition-all active:scale-95">
                                    Proceed to Review <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={confirmAndPay} className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                                    Confirm & Pay
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Order Summary (Sidebar) */}
                {step < 4 && (
                    <div className="w-full md:w-[380px] bg-white/5 border-l border-white/5 p-8 md:p-10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900/50 overflow-hidden border border-white/5">
                                    <img src={slide.thumbnail} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                    <h4 className="font-black text-white">{slide.title}</h4>
                                    <p className="text-xs text-gray-500">by @{slide.author || "Creator"}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Base Price ({selectedTier === 1 ? "1 Month" : selectedTier === 2 ? "1 Year" : "Lifetime"})</span>
                                    <span className="text-white font-bold">{formatSui(currentPrice)} SUI</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Platform Fee (2%)</span>
                                    <span className="text-white font-bold">{formatSui(platformFee)} SUI</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Network Gas (Est.)</span>
                                    <span className="text-cyan-400 font-bold">&lt; 0.01 SUI</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex justify-between items-end mb-8 pt-8 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Total Amount</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white">{formatSui(totalAmount)}</span>
                                        <span className="text-xl font-black text-blue-500">SUI</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">≈ ${(totalAmount / 1_000_000_000 * 2.3).toFixed(2)} USD</p>
                            </div>

                            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-3">
                                <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <p className="text-[11px] text-gray-400 leading-relaxed">
                                    Licenses are <span className="text-white font-bold">transferable</span>. You can resell remaining time on the secondary market.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// Sub-components for Steps

const StepIndicator = ({ currentStep, stepNumber, label, icon }) => {
    const isActive = currentStep === stepNumber;
    const isCompleted = currentStep > stepNumber;

    return (
        <div className={`flex flex-col items-center gap-2 transition-all ${isActive || isCompleted ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-cyan-500 border-cyan-500 text-white' :
                isActive ? 'border-cyan-500 text-cyan-500' : 'border-white/20 text-white'
                }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-cyan-500' : 'text-gray-500'}`}>{label}</span>
        </div>
    );
};

const DurationStep = ({ selectedTier, setSelectedTier, monthlyPrice, yearlyPrice, lifetimePrice, formatSui }) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl font-black text-white mb-8">Select License Duration</h2>
        <div className="space-y-4">
            <TierCard
                id={1}
                active={selectedTier === 1}
                onClick={() => setSelectedTier(1)}
                title="1 Month License"
                desc="Perfect for short-term projects"
                price={formatSui(monthlyPrice)}
                tag={null}
            />
            <TierCard
                id={2}
                active={selectedTier === 2}
                onClick={() => setSelectedTier(2)}
                title="1 Year License"
                desc="Maximum utility and savings"
                price={formatSui(yearlyPrice)}
                tag="BEST VALUE"
            />
            <TierCard
                id={3}
                active={selectedTier === 3}
                onClick={() => setSelectedTier(3)}
                title="Lifetime Access"
                desc="One-time payment, forever ownership"
                price={formatSui(lifetimePrice)}
                tag="INFINITY"
            />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6">
            <InfoItem icon={<Clock className="w-4 h-4" />} title="Revocation Policy" desc="Owner can only revoke after 30% usage time." />
            <InfoItem icon={<ShieldCheck className="w-4 h-4" />} title="Sui Secured" desc="Transaction hash verified on explorer." />
            <InfoItem icon={<ArrowUpRight className="w-4 h-4" />} title="Usage Rights" desc="Commercial & Personal use included." />
            <InfoItem icon={<BoxIcon className="w-4 h-4" />} title="NFT Minting" desc="Instant on-chain minting on Sui." />
        </div>
    </div>
);

const TierCard = ({ id, active, onClick, title, desc, price, tag }) => (
    <div
        onClick={onClick}
        className={`group cursor-pointer p-6 rounded-[24px] border-2 flex items-center justify-between transition-all ${active ? 'bg-cyan-500/10 border-cyan-500 shadow-lg shadow-cyan-500/10' : 'bg-white/2 border-white/5 hover:border-white/20'
            }`}
    >
        <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                <Clock className="w-6 h-6" />
            </div>
            <div>
                <div className="flex items-center gap-3">
                    <h4 className={`text-lg font-black ${active ? 'text-white' : 'text-gray-300'}`}>{title}</h4>
                    {tag && <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[9px] font-black rounded-md">{tag}</span>}
                </div>
                <p className="text-xs text-gray-500 font-medium">{desc}</p>
            </div>
        </div>
        <div className="text-right">
            <p className={`text-xl font-black ${active ? 'text-cyan-400' : 'text-white'}`}>{price} SUI</p>
            <p className="text-[10px] text-gray-500 font-bold">≈ ${(parseFloat(price) * 2.3).toFixed(2)} USD</p>
        </div>
    </div>
);

const InfoItem = ({ icon, title, desc }) => (
    <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 flex-shrink-0">
            {icon}
        </div>
        <div>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-300 mb-0.5">{title}</h5>
            <p className="text-[11px] text-gray-500 leading-tight">{desc}</p>
        </div>
    </div>
);

const ReviewStep = ({ slide, tier, price, formatSui }) => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <h2 className="text-3xl font-black text-white mb-4">Review License</h2>
        <p className="text-gray-400 mb-10 font-medium">Please review your asset selection and choose your licensing duration.</p>

        <div className="p-8 bg-white/2 border border-white/5 rounded-[32px] mb-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 aspect-video rounded-2xl overflow-hidden border border-white/10">
                    <img src={slide.thumbnail} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black rounded-md uppercase">NFT Asset</span>
                        <span className="text-[10px] font-bold text-gray-500">ID: #{slide.id.slice(2, 6)}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-1">{slide.title}</h3>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-bold text-gray-400">{slide.author || "Creator"}</span>
                    </div>
                    <button className="text-xs font-bold text-blue-500 hover:text-blue-400">View Full Preview →</button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">License Duration</p>
                <div className="flex items-center justify-between">
                    <span className="text-white font-black">{tier === 1 ? "1 Month" : tier === 2 ? "1 Year" : "Lifetime"}</span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                </div>
            </div>
            <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">License Type</p>
                <div className="flex items-center justify-between">
                    <span className="text-white font-black">Standard Commercial</span>
                    <Info className="w-4 h-4 text-gray-500" />
                </div>
            </div>
        </div>

        <label className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl cursor-pointer hover:bg-blue-500/10 transition-colors">
            <input type="checkbox" className="w-5 h-5 rounded-md accent-blue-500" defaultChecked />
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
                I agree to the <span className="text-blue-500">SlideSui Time-Based Licensing Terms</span>. I understand that access is revoked automatically once the term expires unless renewed.
            </p>
        </label>
    </div>
);

const ProcessingStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-10 animate-in fade-in duration-500">
        <div className="relative mb-10">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-cyan-700/20 flex items-center justify-center">
                    <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping" />
                </div>
            </div>
        </div>
        <h3 className="text-2xl font-black text-white mb-2 text-center">Processing Transaction on SUI Network...</h3>
        <p className="text-blue-400 text-sm font-bold flex items-center gap-2 mb-10">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
            Status: Awaiting Wallet Confirmation
        </p>

        <div className="w-full max-w-sm p-5 bg-white/2 border border-white/5 rounded-2xl space-y-3">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Network</span>
                <span className="text-white">SUI Mainnet</span>
            </div>
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-500">
                <span>Gas Est.</span>
                <span className="text-white">&lt; 0.001 SUI</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-cyan-500 animate-[progress_3s_ease-in-out_infinite]"></div>
            </div>
            <div className="flex items-center gap-2 justify-center pt-2">
                <ShieldCheck className="w-3 h-3 text-gray-500" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Secure Cryptographic Verification</span>
            </div>
        </div>
    </div>
);

const SuccessStep = ({ slide, txDigest, tier, onClose }) => {
    const truncate = (str) => `${str.slice(0, 10)}...${str.slice(-4)}`;

    const getExpiryDate = () => {
        if (tier === 3) return "Infinity / Lifetime";
        const date = new Date();
        if (tier === 1) date.setMonth(date.getMonth() + 1);
        if (tier === 2) date.setFullYear(date.getFullYear() + 1);

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const expiryDate = getExpiryDate();

    return (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4">License Successfully Acquired!</h2>
            <p className="text-gray-400 mb-12 max-w-md font-medium">Your presentation license is now minted and secured on the Sui blockchain.</p>

            <div className="w-full max-w-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden p-6 text-left shadow-2xl">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 group">
                    <img src={slide.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black rounded-lg border border-green-500/20">ACTIVE LICENSE</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Transaction Hash</p>
                            <p className="text-sm font-mono text-white flex items-center gap-2">
                                {truncate(txDigest || "0x000...000")}
                                <Copy className="w-3 h-3 text-gray-500 hover:text-white cursor-pointer" onClick={() => navigator.clipboard.writeText(txDigest)} />
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Expiration Date</p>
                            <p className="text-sm font-bold text-white">{expiryDate}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Status</p>
                            <p className="text-sm font-black text-green-500 uppercase tracking-widest">Confirmed</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex gap-4 w-full justify-center">
                <button onClick={onClose} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" /> Open in Editor
                </button>
                <button onClick={onClose} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black border border-white/10 transition-all active:scale-95 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Go to My Assets
                </button>
            </div>
        </div>
    );
};

// Simple BoxIcon
const BoxIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export default CheckoutModal;
