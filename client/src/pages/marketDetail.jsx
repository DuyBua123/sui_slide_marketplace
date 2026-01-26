import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Stage, Layer, Rect, Circle, Line, Text, Image as KonvaImage, Star, RegularPolygon, Path } from "react-konva";
import { CardSkeleton } from "../components/CardSkeleton";
import { useMarketplaceSlides, useBuySlide } from "../hooks/useMarketplace";
import { useBuyLicense } from "../hooks/useBuyLicense";
import { fetchFromWalrus } from "../services/exports/exportToWalrus";

const MIST_IN_SUI = 1_000_000_000;
const normalizeId = (value) => (value || "").replace(/^0x/i, "").toLowerCase();
const formatSui = (mist = 0) => (mist / MIST_IN_SUI).toFixed(4);
const SLIDE_CANVAS_WIDTH = 960;
const SLIDE_CANVAS_HEIGHT = 540;

const PreviewImageElement = ({ element }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !element?.src) return;
    let isMounted = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = element.src;
    img.onload = () => {
      if (isMounted) {
        setImage(img);
      }
    };
    img.onerror = () => console.warn("Failed to load preview image", element.src);
    return () => {
      isMounted = false;
    };
  }, [element?.src]);

  if (!image) return null;

  return (
    <KonvaImage
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width || image.width || 200}
      height={element.height || image.height || 150}
      image={image}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      listening={false}
    />
  );
};

const renderPreviewElement = (element) => {
  if (!element) return null;
  const key = element.id || `${element.type}-${element.x}-${element.y}`;
  const baseProps = {
    key,
    id: element.id,
    x: element.x,
    y: element.y,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
    listening: false,
  };

  switch (element.type) {
    case "rect":
      return (
        <Rect
          {...baseProps}
          width={element.width}
          height={element.height}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          cornerRadius={element.cornerRadius}
        />
      );
    case "circle":
      return (
        <Circle
          {...baseProps}
          radius={element.radius}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
        />
      );
    case "line":
      return (
        <Line
          {...baseProps}
          points={element.points}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          lineCap="round"
          lineJoin="round"
        />
      );
    case "text":
      return (
        <Text
          {...baseProps}
          text={element.text}
          fontSize={element.fontSize}
          fontFamily={element.fontFamily}
          fill={element.fill}
          width={element.width}
          align={element.align}
        />
      );
    case "image":
      return <PreviewImageElement key={key} element={element} />;
    case "star":
      return (
        <Star
          {...baseProps}
          numPoints={element.numPoints || 5}
          innerRadius={element.innerRadius || 20}
          outerRadius={element.outerRadius || 40}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
        />
      );
    case "regularPolygon":
      return (
        <RegularPolygon
          {...baseProps}
          sides={element.sides || 6}
          radius={element.radius || 40}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
        />
      );
    case "path":
      return (
        <Path
          {...baseProps}
          data={element.data}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          scaleX={element.scaleX || 1}
          scaleY={element.scaleY || 1}
        />
      );
    default:
      return null;
  }
};

const SlidePreviewCanvas = ({ slide }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(SLIDE_CANVAS_WIDTH);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      setContainerWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
      setContainerWidth(containerRef.current.offsetWidth || SLIDE_CANVAS_WIDTH);
    }
    return () => observer.disconnect();
  }, []);

  const limitedWidth = Math.min(containerWidth, SLIDE_CANVAS_WIDTH);
  const scale = Math.max(limitedWidth / SLIDE_CANVAS_WIDTH, 0.1);
  const displayWidth = SLIDE_CANVAS_WIDTH * scale;
  const displayHeight = SLIDE_CANVAS_HEIGHT * scale;

  return (
    <div ref={containerRef} className="w-full">
      {slide ? (
        <div className="flex justify-center">
          <Stage
            width={SLIDE_CANVAS_WIDTH}
            height={SLIDE_CANVAS_HEIGHT}
            scaleX={scale}
            scaleY={scale}
            listening={false}
            style={{
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
            }}
            className="rounded-3xl border border-gray-100 bg-white shadow-inner shadow-slate-900/5 dark:border-white/5 dark:bg-slate-950/30"
          >
            <Layer>
              <Rect
                width={SLIDE_CANVAS_WIDTH}
                height={SLIDE_CANVAS_HEIGHT}
                fill={slide.background || "#f8fafc"}
                listening={false}
              />
              {(slide.elements || []).map((element) => renderPreviewElement(element))}
            </Layer>
          </Stage>
        </div>
      ) : (
        <div className="aspect-video w-full rounded-3xl bg-slate-100 dark:bg-slate-800" />
      )}
    </div>
  );
};

import { CheckoutModal } from "../components/Checkout/CheckoutModal";

export const MarketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { slides, isLoading, error, refetch } = useMarketplaceSlides();
  const { buySlide, isLoading: isBuyingSlide } = useBuySlide();
  const { buyLicense, isLoading: isBuyingLicense } = useBuyLicense();

  const [activeSlide, setActiveSlide] = useState(0);
  const [presentationData, setPresentationData] = useState(null);
  const [isPresentationLoading, setIsPresentationLoading] = useState(false);
  const [presentationError, setPresentationError] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const isBuying = isBuyingSlide || isBuyingLicense;
  const [showCheckout, setShowCheckout] = useState(false);

  const selectedSlide = useMemo(
    () => slides.find((slide) => normalizeId(slide.id) === normalizeId(id)),
    [slides, id]
  );

  const presentationSlides = presentationData?.slides || [];
  const currentPreviewSlide = presentationSlides[previewIndex] || null;

  useEffect(() => {
    if (!slides.length) return;
    const currentIndex = slides.findIndex((slide) => normalizeId(slide.id) === normalizeId(id));
    setActiveSlide(currentIndex >= 0 ? currentIndex : 0);
  }, [slides, id]);

  useEffect(() => {
    let isMounted = true;

    const loadFromLocal = (slideId) => {
      try {
        const raw = localStorage.getItem("slides");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const found = parsed.find((entry) => normalizeId(entry.id) === normalizeId(slideId));
        return found?.data || null;
      } catch (err) {
        console.warn("Failed to read local slides", err);
        return null;
      }
    };

    const hydratePresentation = async () => {
      if (!selectedSlide?.id) {
        if (!isMounted) return;
        setPresentationData(null);
        setPresentationError(null);
        setPreviewIndex(0);
        return;
      }

      if (!selectedSlide.contentUrl) {
        if (!isMounted) return;
        setPresentationData(null);
        setPresentationError("Creator has not published the slide content yet.");
        setPreviewIndex(0);
        return;
      }

      setIsPresentationLoading(true);
      setPresentationError(null);

      try {
        const data = await fetchFromWalrus(selectedSlide.contentUrl);
        if (!isMounted) return;
        if (data?.slides?.length) {
          setPresentationData(data);
          setPreviewIndex(0);
        } else {
          setPresentationData(null);
          setPresentationError("Slide content is empty or unavailable.");
        }
      } catch (err) {
        console.error("Failed to load slide content", err);
        if (!isMounted) return;
        const fallback = loadFromLocal(selectedSlide.id);
        if (fallback?.slides?.length) {
          setPresentationData(fallback);
          setPresentationError(null);
          setPreviewIndex(0);
        } else {
          setPresentationData(null);
          setPresentationError(err.message || "Unable to load slide content.");
        }
      } finally {
        if (isMounted) {
          setIsPresentationLoading(false);
        }
      }
    };

    hydratePresentation();

    return () => {
      isMounted = false;
    };
  }, [selectedSlide?.id, selectedSlide?.contentUrl]);

  useEffect(() => {
    if (!presentationSlides.length) {
      setPreviewIndex(0);
      return;
    }
    setPreviewIndex((prev) => Math.min(prev, presentationSlides.length - 1));
  }, [presentationSlides.length]);

  const getAccessStatus = (slide) => {
    if (!account?.address || !slide) return "none";
    const userAddr = normalizeId(account.address);
    const ownerAddr = normalizeId(slide.owner);
    if (ownerAddr === userAddr) return "owner";

    const licenses = JSON.parse(localStorage.getItem("licenses") || "[]");
    if (
      licenses.some((license) => {
        const licenseSlideId = normalizeId(license.slideId);
        return licenseSlideId === normalizeId(slide.id) && license.buyer === account.address;
      })
    ) {
      return "licensed";
    }
    return "none";
  };

  const handlePurchase = async (slide, purchaseType) => {
    if (!account) {
      navigate("/sign-in");
      return;
    }

    if (purchaseType === "license") {
      setShowCheckout(true);
      return;
    }

    try {
      if (purchaseType === "ownership") {
        await buySlide({
          slideId: slide.id,
          price: slide.salePrice,
        });
      }
      await refetch();
      alert(`Purchase completed for "${slide.title}"`);
    } catch (err) {
      console.error("Purchase error", err);
      alert(`Purchase failed: ${err.message}`);
    }
  };

  const executeLicensePurchase = async ({ slideId, price, durationType }) => {
    try {
      const result = await buyLicense({ slideId, price, durationType });
      await refetch();
      return result;
    } catch (err) {
      throw err;
    }
  };

  const handleMarketplaceSliderNav = (direction) => {
    if (slides.length <= 1) return;
    setActiveSlide((prev) => {
      const nextIndex =
        direction === "prev"
          ? (prev - 1 + slides.length) % slides.length
          : (prev + 1) % slides.length;
      const targetSlide = slides[nextIndex];
      if (targetSlide) {
        navigate(`/market/${targetSlide.id}`);
      }
      return nextIndex;
    });
  };

  const navigateToSlide = (slideId) => {
    navigate(`/market/${slideId}`);
  };

  const handlePreviewNav = (direction) => {
    if (!presentationSlides.length) return;
    setPreviewIndex((prev) => {
      if (direction === "prev") {
        return prev === 0 ? presentationSlides.length - 1 : prev - 1;
      }
      return prev === presentationSlides.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        <span className="text-lg">←</span> Back to Marketplace
      </button>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="mb-10 rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600 shadow-sm">
          <p className="font-semibold">{error}</p>
          <button
            onClick={refetch}
            className="cursor-pointer mt-3 text-sm font-bold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !selectedSlide && (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center dark:bg-slate-900 dark:border-white/5">
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            Slide not found or no longer available.
          </p>
          <button
            onClick={() => navigate("/market")}
            className="cursor-pointer mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
          >
            Return to marketplace
          </button>
        </div>
      )}

      {selectedSlide && (
        <>
          <section className="grid grid-cols-1 gap-10 rounded-[32px] border border-gray-100 bg-white p-6 shadow-lg shadow-slate-900/5 dark:bg-slate-900 dark:border-white/5 md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/10">
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs font-bold uppercase tracking-wide text-slate-700 shadow">
                🔥 Trending
                <span className="text-blue-600">{formatSui(selectedSlide.price)} SUI</span>
              </div>
              {selectedSlide.thumbnail ? (
                <img
                  src={selectedSlide.thumbnail}
                  alt={selectedSlide.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl text-blue-500/30">
                  ⧉
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Slide detail</p>
                <h1 className="mt-2 text-4xl font-black text-slate-900 dark:text-white">
                  {selectedSlide.title || "Untitled Slide"}
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  @{selectedSlide.author || "Creator"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:bg-white/5 dark:border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">License Price</p>
                  <p className="mt-2 text-3xl font-black text-blue-600">
                    {formatSui(selectedSlide.price)} <span className="text-base font-semibold">SUI</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:bg-white/5 dark:border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Ownership</p>
                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                    {selectedSlide.isForSale ? (
                      <>
                        {formatSui(selectedSlide.salePrice)} <span className="text-base font-semibold">SUI</span>
                      </>
                    ) : (
                      <span className="text-base font-semibold text-gray-400">Not for sale</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-blue-100 px-4 py-1 text-xs font-bold uppercase text-blue-700">
                  #{selectedSlide.type || "listing"}
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-bold uppercase text-slate-600">
                  Owner {selectedSlide.owner?.slice(0, 8)}...
                </span>
                {selectedSlide.source && (
                  <span className="rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase text-emerald-600">
                    {selectedSlide.source}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-slate-600 dark:text-gray-300">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:bg-white/5">
                  <span>License Status</span>
                  <span className={selectedSlide.isListed ? "text-blue-600" : "text-gray-400"}>
                    {selectedSlide.isListed ? "Available" : "Paused"}
                  </span>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  <span className="font-semibold text-slate-500">Content URL</span>
                  {selectedSlide.contentUrl ? (
                    <a
                      href={selectedSlide.contentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-blue-600 underline"
                    >
                      {selectedSlide.contentUrl}
                    </a>
                  ) : (
                    <span className="text-gray-400">No preview link provided.</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {selectedSlide.isListed && (
                  <button
                    onClick={() => handlePurchase(selectedSlide, "license")}
                    disabled={isBuying}
                    className="cursor-pointer rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isBuyingLicense ? "Processing..." : `Buy License (${formatSui(selectedSlide.price)} SUI)`}
                  </button>
                )}
                {selectedSlide.isForSale && (
                  <button
                    onClick={() => handlePurchase(selectedSlide, "ownership")}
                    disabled={isBuying}
                    className="cursor-pointer rounded-2xl border border-blue-500 bg-blue-50 px-6 py-3 text-sm font-bold text-blue-600 shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isBuyingSlide
                      ? "Processing..."
                      : `Buy Ownership (${formatSui(selectedSlide.salePrice)} SUI)`}
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500">Inside this deck</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Slide carousel</h2>
                {presentationSlides.length > 0 && (
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Slide {previewIndex + 1} of {presentationSlides.length}
                  </p>
                )}
              </div>
              {presentationSlides.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreviewNav("prev")}
                    disabled={isPresentationLoading}
                    className="cursor-pointer rounded-full border border-gray-200 bg-white p-3 text-lg font-bold text-slate-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:border-white/10"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handlePreviewNav("next")}
                    disabled={isPresentationLoading}
                    className="cursor-pointer rounded-full border border-gray-200 bg-white p-3 text-lg font-bold text-slate-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:border-white/10"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {isPresentationLoading && (
              <div className="h-72 rounded-[32px] border border-gray-100 bg-gradient-to-r from-slate-100 via-white to-slate-100 animate-pulse dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
            )}

            {presentationError && !isPresentationLoading && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-700 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10">
                <p className="font-semibold">{presentationError}</p>
              </div>
            )}

            {!isPresentationLoading && !presentationError && currentPreviewSlide && (
              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-lg shadow-slate-900/5 dark:bg-slate-900 dark:border-white/5">
                <SlidePreviewCanvas slide={currentPreviewSlide} />
              </div>
            )}

            {!isPresentationLoading && !presentationError && !currentPreviewSlide && (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500 dark:bg-white/5">
                Creator hasn't shared individual slide content yet.
              </div>
            )}

            {presentationSlides.length > 1 && (
              <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                {presentationSlides.map((slide, idx) => (
                  <button
                    key={slide.id || `preview-${idx}`}
                    onClick={() => setPreviewIndex(idx)}
                    className={`cursor-pointer rounded-2xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${idx === previewIndex
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                      : "bg-gray-100 text-slate-500 hover:bg-gray-200 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                      }`}
                  >
                    Slide {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Browse more</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Marketplace slider</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleMarketplaceSliderNav("prev")}
              disabled={slides.length <= 1}
              className="cursor-pointer rounded-full border border-gray-200 bg-white p-3 text-lg font-bold text-slate-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ←
            </button>
            <button
              onClick={() => handleMarketplaceSliderNav("next")}
              disabled={slides.length <= 1}
              className="cursor-pointer rounded-full border border-gray-200 bg-white p-3 text-lg font-bold text-slate-600 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              →
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[...Array(2)].map((_, idx) => (
              <CardSkeleton key={idx} />
            ))}
          </div>
        )}

        {!isLoading && slides.length > 0 && (
          <div className="relative">
            <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-inner dark:bg-slate-900 dark:border-white/5">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {slides.map((slide) => {
                  const isActive = normalizeId(slide.id) === normalizeId(id);
                  return (
                    <div key={slide.id} className="min-w-full flex-shrink-0 px-6 py-8">
                      <div
                        className={`flex flex-col gap-4 rounded-3xl border p-6 transition duration-300 ${isActive
                          ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20"
                          : "border-gray-100 bg-gray-50 dark:bg-white/5 dark:border-white/5"
                          }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="sm:w-64 overflow-hidden rounded-2xl bg-slate-900/5">
                            {slide.thumbnail ? (
                              <img
                                src={slide.thumbnail}
                                alt={slide.title}
                                className="h-40 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-40 items-center justify-center text-4xl text-blue-500/30">
                                ⧉
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col">
                            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                              #{slide.type || "listing"}
                            </p>
                            <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                              {slide.title || "Untitled Slide"}
                            </h3>
                            <p className="text-sm font-medium text-blue-500">@{slide.author || "Creator"}</p>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">License</p>
                                <p className="text-lg font-black text-blue-600">{formatSui(slide.price)} SUI</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Ownership</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">
                                  {slide.isForSale ? `${formatSui(slide.salePrice)} SUI` : "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                              <button
                                onClick={() => navigateToSlide(slide.id)}
                                className="cursor-pointer rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
                              >
                                View details
                              </button>
                              {getAccessStatus(slide) !== "none" && (
                                <button
                                  onClick={() => navigate(`/slide/${slide.id}`)}
                                  className="cursor-pointer rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-600"
                                >
                                  View slide
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!isLoading && !slides.length && (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500 dark:bg-white/5">
            No slides to show right now.
          </div>
        )}
      </section>

      {selectedSlide && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          slide={selectedSlide}
          onPurchaseSuccess={executeLicensePurchase}
        />
      )}
    </div>
  );
};
