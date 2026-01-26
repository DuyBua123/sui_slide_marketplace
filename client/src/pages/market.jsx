import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMarketplaceSlides, useBuySlide } from "../hooks/useMarketplace";
import { useBuyLicense } from "../hooks/useBuyLicense";
import { CardSkeleton } from "../components/CardSkeleton";
import AOS from "aos";
import "aos/dist/aos.css";

export const Market = () => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { slides, isLoading, error, refetch } = useMarketplaceSlides();
  const { buySlide, isLoading: isBuyingSlide } = useBuySlide();
  const { buyLicense, isLoading: isBuyingLicense } = useBuyLicense();

  const isBuying = isBuyingSlide || isBuyingLicense;
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(100);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out",
    });
  }, []);

  // Listen for marketplace refresh trigger from other pages (e.g., when slides are deleted)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "marketplace_refresh") {
        console.log("Marketplace refresh triggered");
        refetch();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refetch]);

  // Convert MIST to SUI (1 SUI = 1,000,000,000 MIST)
  const formatSui = (mist) => {
    return (mist / 1000000000).toFixed(4);
  };

  const getPrice = (slide) => {
    const priceInMist = slide.price || 0;
    return formatSui(priceInMist);
  };

  // Check if user owns slide or license
  const getAccessStatus = (slide) => {
    if (!account?.address || !slide) return "none";

    // Normalize addresses for robust comparison
    const userAddr = account.address.replace('0x', '').toLowerCase();
    const ownerAddr = slide.owner?.replace('0x', '').toLowerCase();

    // Check ownership
    if (ownerAddr === userAddr) return "owner";

    // Check licenses in localStorage (legacy/mock)
    const licenses = JSON.parse(localStorage.getItem("licenses") || "[]");
    if (licenses.some((l) => {
      const lSlideId = l.slideId?.replace('0x', '').toLowerCase();
      const sId = slide.id?.replace('0x', '').toLowerCase();
      return lSlideId === sId && l.buyer === account.address;
    })) {
      return "licensed";
    }
    return "none";
  };

  // Filter slides
  const filteredSlides = slides.filter((slide) => {
    if (!slide) return false;
    const slideTitle = slide.title || "Untitled Slide";
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch = slideTitle.toLowerCase().includes(searchQuery.toLowerCase());

    // Lọc theo trạng thái (Premium/Free/All)
    const priceInSui = parseFloat(getPrice(slide));
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "free"
          ? priceInSui === 0
          : filter === "premium"
            ? priceInSui > 0
            : true;

    // Lọc theo giá bán (Slider)
    const matchesPrice = priceInSui <= maxPrice;

    // Chỉ hiện slide chưa sở hữu/mua (accessStatus === "none")
    const accessStatus = getAccessStatus(slide);
    const isNotOwned = accessStatus === "none";

    return matchesSearch && matchesFilter && matchesPrice && isNotOwned;
  });

  // Buy license (for SlideObject) or buy slide (for Listing)
  const handlePurchase = async (slide, purchaseType) => {
    if (!account) {
      navigate("/sign-in");
      return;
    }

    try {
      if (purchaseType === "ownership") {
        // Buy full ownership
        const salePrice = slide?.salePrice ?? slide?.sale_price ?? slide?.price ?? 0; // fall back to any available price
        await buySlide({
          slideId: slide?.id,
          price: salePrice,
        });

        await refetch();
        alert(`Successfully purchased full ownership of "${slide.title}"!`);
      } else {
        // Buy license
        await buyLicense({
          slideId: slide.id,
          price: slide.price,
        });

        await refetch();
        alert(`License successfully purchased for "${slide.title}"!`);
      }
    } catch (err) {
      console.error("Purchase error:", err);
      alert(`Failed to purchase: ${err.message}`);
    }
  };

  const initiatePurchase = (slide, purchaseType) => {
    if (!slide) return;
    setPendingPurchase({ slide, purchaseType });
    setHasAcceptedTerms(false);
    setIsTermsModalOpen(true);
  };

  const closeTermsModal = () => {
    if (isBuying) return;
    setIsTermsModalOpen(false);
    setPendingPurchase(null);
  };

  const confirmPurchaseWithTerms = async () => {
    if (!pendingPurchase || !hasAcceptedTerms) return;
    await handlePurchase(pendingPurchase.slide, pendingPurchase.purchaseType);
    setIsTermsModalOpen(false);
    setPendingPurchase(null);
  };

  return (
    <div className="py-10 transition-colors duration-500 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-12 px-4">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Slide <span className="text-blue-500">Marketplace</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Discover premium slide presentations. Purchase licenses to view and present, while
          creators retain ownership and editing rights.
        </p>

        {/* Configuration Warning */}
        {(!import.meta.env.VITE_PACKAGE_ID || import.meta.env.VITE_PACKAGE_ID === '0x0') && (
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl max-w-2xl mx-auto flex items-center gap-4 text-left">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-amber-800 dark:text-amber-400 font-bold text-sm">Blockchain connection not configured</p>
            <p className="text-amber-700/80 dark:text-amber-400/60 text-xs mt-0.5 font-medium leading-relaxed">
              The marketplace is currently in preview mode. To see live slides from others, please configure the <code>VITE_PACKAGE_ID</code> in your <code>.env</code> file.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-4 max-w-[1400px] mx-auto">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-24 space-y-8 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
            {/* Search Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Search
              </h4>
              <div className="relative">
                <svg
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Title, author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-xl outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Price Range
                </h4>
                <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">
                  {maxPrice} SUI
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-400">
                <span>0 SUI</span>
                <span>100 SUI</span>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                Status
              </h4>
              <div className="flex flex-col gap-2">
                {["all", "premium", "free"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`cursor-pointer w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                      }`}
                  >
                    {f}
                    {filter === f && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN GRID */}
        <main className="flex-1">
          {/* SKELETON LOADING STATE */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && !isLoading && (
            <div
              className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-center"
              data-aos="zoom-in"
            >
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={refetch}
                className="mt-4 text-sm font-bold text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* REAL DATA GRID */}
          {!isLoading && !error && filteredSlides.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSlides.map((slide, index) => {
                const price = getPrice(slide);
                const accessStatus = getAccessStatus(slide);
                const canBuyLicense = Boolean(slide?.isListed);
                const canBuyOwnership = Boolean(slide?.isForSale);
                return (
                  <div
                    key={slide.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                    onClick={() => navigate(`/market/${slide.id}`)}
                    className="group bg-white dark:bg-slate-900 rounded-3xl p-3 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    <div
                      className={`aspect-4/3 rounded-[18px] mb-4 relative flex items-center justify-center overflow-hidden ${slide.bgColor || "bg-blue-50 dark:bg-blue-900/20"}`}
                    >
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full text-sm font-bold uppercase">
                        🔥 Trending
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#1e293b] text-white rounded-full text-sm font-bold">
                        {price} SUI
                      </div>
                      {slide.thumbnail ? (
                        <img
                          src={slide.thumbnail}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-10 h-10 text-blue-500/40"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="px-1 flex-1 flex flex-col">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate mb-1">
                        {slide.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-blue-500 font-medium mb-4 truncate">
                        @{slide.author || "Creator"}
                      </p>

                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold mb-1.5 text-gray-400 uppercase">
                          <span>Depreciation</span>
                          <span className="text-blue-500">8 Months Left</span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: "60%" }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-auto space-y-3">
                        <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                          <span>{accessStatus === "owner" ? "You own this" : accessStatus === "licensed" ? "License Active" : "Click to view details"}</span>
                          <span className="text-blue-500">→</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {/* Buttons removed per request. Click card to view details. */}
                          <div className="text-xs text-gray-400 italic">
                            Tap to view details
                          </div>
                          {!canBuyLicense && !canBuyOwnership && (
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                              Not available for purchase right now
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !isLoading && (
              <div
                className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-4xl"
                data-aos="fade-up"
              >
                <p className="text-gray-500 font-medium">
                  No slides found matching your criteria.
                </p>
              </div>
            )
          )}
        </main>
      </div>

      {isTermsModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeTermsModal}
          ></div>
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/10 shadow-2xl p-8">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition disabled:opacity-50"
              onClick={closeTermsModal}
              disabled={isBuying}
              aria-label="Đóng"
            >
              ✕
            </button>

            <div className="space-y-2 mb-6">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-500">Điều khoản &amp; Dịch vụ</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Xác nhận trước khi thanh toán</h2>
              {pendingPurchase?.slide && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Bạn đang yêu cầu {pendingPurchase.purchaseType === "ownership" ? "mua quyền sở hữu đầy đủ" : "mua license sử dụng"} cho
                  <span className="font-semibold"> {pendingPurchase.slide.title || "Untitled"}</span>.
                </p>
              )}
            </div>

            <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-8 text-sm text-slate-600 dark:text-slate-300">
              <section>
                <div className="flex items-center gap-2 text-rose-500 font-bold uppercase text-xs tracking-wider">
                  <span>🔴</span>
                  <span>Điều khoản 1</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  Điều khoản quyền sử dụng (License)
                </h3>

                <div className="space-y-4 mt-3">
                  <div>
                    <p className="font-semibold">Điều 1.1 – Phạm vi quyền</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Creator (A) giữ toàn bộ quyền sở hữu gốc đối với thiết kế.</li>
                      <li>Người mua (B, C, D, …) chỉ được cấp quyền sử dụng không độc quyền, không chuyển nhượng, theo thời hạn đã chọn.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Điều 1.2 – Thời hạn sử dụng</p>
                    <p>Người mua lựa chọn một trong các thời hạn sau:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>n tháng</li>
                      <li>n năm</li>
                      <li>Vĩnh viễn</li>
                    </ul>
                    <p className="mt-1">Thời hạn sử dụng được ghi nhận và quản lý trực tiếp bởi smart contract. Khi hết hạn, quyền truy cập sẽ tự động chấm dứt.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Điều 1.3 – Quyền chỉnh sửa và sử dụng</p>
                    <p>Trong thời gian license còn hiệu lực, người mua có quyền:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Chỉnh sửa, cá nhân hóa thiết kế.</li>
                      <li>Sử dụng cho mục đích cá nhân hoặc thương mại.</li>
                    </ul>
                    <p className="mt-2 font-semibold">Người mua không được phép:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Bán lại hoặc phân phối template ở dạng nguyên bản.</li>
                      <li>Chuyển nhượng quyền sử dụng cho bên thứ ba.</li>
                      <li>Tuyên bố quyền sở hữu đối với thiết kế gốc.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Điều 1.4 – Quyền cập nhật phiên bản</p>
                    <p>Creator có quyền cập nhật hoặc phát hành phiên bản mới của thiết kế. Người mua được quyền tiếp tục dùng phiên bản cũ hoặc nâng cấp sang phiên bản mới nếu có. Quyền sử dụng không bị ảnh hưởng trong suốt thời hạn license.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Điều 1.5 – Chuyển đổi sang quyền sở hữu</p>
                    <p>Người mua có thể đề xuất mua lại quyền sở hữu trong thời gian license còn hiệu lực. Nếu Creator chấp thuận, khoản hoàn trả license được tính như sau:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Trước 50% thời hạn: hoàn 70% giá trị license.</li>
                      <li>Sau 50% thời hạn: hoàn 30% giá trị license.</li>
                    </ul>
                    <p>Việc chuyển đổi được thực hiện tự động thông qua smart contract.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Điều 1.6 – Chấm dứt quyền</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Khi license hết hạn hoặc bị hủy, mọi quyền sử dụng của người mua chấm dứt.</li>
                      <li>Quyền truy cập vào thiết kế bị thu hồi tự động.</li>
                      <li>Creator không cần can thiệp thủ công.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 text-blue-500 font-bold uppercase text-xs tracking-wider">
                  <span>🔵</span>
                  <span>Điều khoản 2</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  Điều khoản quyền sở hữu (Ownership)
                </h3>

                <div className="space-y-4 mt-3">
                  <div>
                    <p className="font-semibold">Điều 2.1 – Chuyển nhượng quyền sở hữu</p>
                    <p>Creator (A) chuyển nhượng toàn bộ quyền sở hữu thiết kế cho người mua (B) thông qua giao dịch on-chain. Việc chuyển nhượng là vĩnh viễn và không thể đảo ngược.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Điều 2.2 – Quyền của chủ sở hữu mới</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Chỉnh sửa, khai thác, sử dụng thiết kế.</li>
                      <li>Phân phối, bán lại cho bất kỳ bên nào.</li>
                      <li>Cấp quyền sử dụng hoặc bán quyền sở hữu cho bên thứ ba mà không cần sự đồng ý của Creator ban đầu.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Điều 2.3 – Nghĩa vụ và hạn chế của Creator</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Sau khi chuyển nhượng, Creator không còn bất kỳ quyền nào đối với thiết kế.</li>
                      <li>Không được tiếp tục sử dụng, bán, cập nhật hoặc sao chép.</li>
                      <li>Không được claim quyền tác giả hoặc quyền liên quan.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Điều 2.4 – Bảo vệ quyền sở hữu</p>
                    <p>Quyền sở hữu được ghi nhận trên blockchain, có thể kiểm chứng công khai, không phụ thuộc nền tảng trung gian và không thể bị thay đổi hoặc thu hồi trái phép.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Điều 2.5 – Hiệu lực</p>
                    <p>Quyền sở hữu có hiệu lực vĩnh viễn, trừ khi chủ sở hữu mới tự nguyện chuyển nhượng cho bên khác thông qua smart contract.</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={hasAcceptedTerms}
                  onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                />
                <span>Tôi đã đọc và đồng ý với toàn bộ điều khoản ở trên.</span>
              </label>
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-white hover:text-slate-900 transition disabled:opacity-50"
                  onClick={closeTermsModal}
                  disabled={isBuying}
                >
                  Hủy
                </button>
                <button
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={confirmPurchaseWithTerms}
                  disabled={!hasAcceptedTerms || isBuying}
                >
                  {isBuying ? "Đang xử lý..." : "Chấp nhận điều khoản và Thanh toán"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
