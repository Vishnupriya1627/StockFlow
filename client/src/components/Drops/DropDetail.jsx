import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getActiveDrops,
  getLiveStock,
  buyDropItem,
  checkoutDropOrder,
} from "../../api/flashSaleApi";
import socket from "../../socket";

const DropDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState(null);

  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState(null);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [formError, setFormError] = useState(null);

  // --------------------------------------------------
  // RESERVATION
  // --------------------------------------------------

  const [reservation, setReservation] = useState(null);
  const [ttlRemaining, setTtlRemaining] = useState(0);

  const [checkingOut, setCheckingOut] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  // --------------------------------------------------
  // WAITING ROOM
  // --------------------------------------------------

  const [waiting, setWaiting] = useState(false);
  const [queuePosition, setQueuePosition] = useState(null);
  const [promoted, setPromoted] = useState(false);

  // --------------------------------------------------
  // LOAD PRODUCT
  // --------------------------------------------------

  useEffect(() => {
    getActiveDrops().then((drops) => {
      const found = drops.find((d) => d._id === id);
      setProduct(found || null);
    });
  }, [id]);

  // --------------------------------------------------
  // LIVE STOCK + SOCKET
  // --------------------------------------------------

  useEffect(() => {
    getLiveStock(id)
      .then((data) => setStock(data.stock))
      .catch(() => setStock(null));

    socket.emit("watchProduct", id);

    const stockHandler = (data) => {
      if (data.productId === id) {
        setStock(data.remainingStock);
      }
    };

    socket.on("stockUpdate", stockHandler);

    // --------------------------------------------------
    // Buyer has been promoted from waiting room
    // --------------------------------------------------

    const promotionHandler = (data) => {
      if (data.productId !== id) {
        return;
      }

      console.log("Promoted from waiting room:", data);

      setWaiting(false);
      setQueuePosition(null);
      setPromoted(true);
      setBuyError(null);
    };

    socket.on("queuePromoted", promotionHandler);

    // --------------------------------------------------
    // Queue position update
    // --------------------------------------------------

    const queuePositionHandler = (data) => {
      if (data.productId !== id) {
        return;
      }

      setQueuePosition(data.position);
    };

    socket.on("queuePosition", queuePositionHandler);

    return () => {
      socket.emit("unwatchProduct", id);

      socket.off("stockUpdate", stockHandler);

      socket.off("queuePromoted", promotionHandler);

      socket.off("queuePosition", queuePositionHandler);
    };
  }, [id]);

  // --------------------------------------------------
  // RESERVATION COUNTDOWN
  // --------------------------------------------------

  useEffect(() => {
    if (!reservation) {
      return;
    }

    setTtlRemaining(reservation.ttlSeconds);

    const interval = setInterval(() => {
      setTtlRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  async function handleBuy() {
    setBuying(true);
    setBuyError(null);
    setPromoted(false);

    try {
      const result = await buyDropItem(id);

      // SUCCESSFUL PURCHASE
      if (result.success) {
        setWaiting(false);
        setQueuePosition(null);

        setReservation({
          ttlSeconds: result.reservationTtlSeconds,
        });

        return;
      }

      // WAITING ROOM — a 202 response resolves here, not in catch
      if (result.waiting && result.reason === "WAITING_ROOM") {
        setWaiting(true);
        setQueuePosition(result.position);
        return;
      }

      // SOLD OUT
      if (result.reason === "SOLD_OUT") {
        setBuyError("Sold out — better luck next drop.");
        return;
      }

      // SALE NOT LIVE
      if (result.reason === "SALE_NOT_LIVE") {
        setBuyError("This sale is not live yet.");
        return;
      }
    } catch (err) {
      // now this only fires for genuine 4xx/5xx failures
      setBuyError("Something went wrong. Please try again.");
    } finally {
      setBuying(false);
    }
  }

  // --------------------------------------------------
  // CHECKOUT
  // --------------------------------------------------

  async function handleCheckout() {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setCheckoutError("Please fill in your name, email, and phone.");
      return;
    }

    setCheckingOut(true);
    setCheckoutError(null);

    try {
      const result = await checkoutDropOrder(id, customerInfo);

      setOrderResult(result);
    } catch (err) {
      const reason = err.response?.data?.reason;

      if (reason === "RESERVATION_EXPIRED") {
        setCheckoutError("Your hold expired. Please try buying again.");

        setReservation(null);
      } else {
        setCheckoutError("Checkout failed. Please try again.");
      }
    } finally {
      setCheckingOut(false);
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (!product) {
    return (
      <div className="min-h-screen bg-[#04161a] text-[#f4faf9] relative overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(168,196,200,.045) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(168,196,200,.045) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="absolute left-[10%] top-[15%] w-80 h-80 rounded-full bg-[#013f46]/30 blur-[130px] pointer-events-none" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          <div className="relative mb-5">
            <div className="w-12 h-12 rounded-full border border-[#17444a]" />

            <div className="absolute inset-0 w-12 h-12 rounded-full border-t border-[#f9b223] animate-spin" />
          </div>

          <p className="font-mono text-[10px] tracking-[0.18em] text-[#78999e]">
            LOADING DROP
          </p>

          <p className="font-mono text-[8px] tracking-[0.12em] text-[#405f64] mt-2">
            CONNECTING TO INVENTORY SYSTEM...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ORDER COMPLETE
  // --------------------------------------------------

  if (orderResult) {
    return (
      <div className="min-h-screen bg-[#04161a] text-[#f4faf9] relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(168,196,200,.045) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(168,196,200,.045) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow */}
        <div className="absolute left-1/2 top-[25%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#013f46]/30 blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-20">
          <div className="text-center mb-8">
            <div
              className="
                inline-flex
                items-center
                gap-2
                border border-[#17444a]
                bg-[#061e22]/80
                backdrop-blur-sm
                rounded-full
                px-3
                py-1.5
                mb-6
              "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#67c987]" />

              <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
                TRANSACTION COMPLETE
              </span>
            </div>

            <p className="font-mono text-[9px] tracking-[0.22em] text-[#f9b223] mb-3">
              STOCKFLOW / CHECKOUT
            </p>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em]">
              Order confirmed.
            </h1>
          </div>

          <div
            className="
              relative
              border border-[#15434a]
              bg-[#061d21]/95
              backdrop-blur-xl
              rounded-2xl
              overflow-hidden
              shadow-[0_30px_80px_rgba(0,0,0,.3)]
            "
          >
            {/* Top accent */}
            <div className="h-1 bg-[#67c987]" />

            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 pb-6 border-b border-[#123a40]">
                <div className="w-11 h-11 rounded-xl bg-[#67c987]/10 border border-[#67c987]/20 flex items-center justify-center">
                  <span className="text-[#67c987] text-lg">✓</span>
                </div>

                <div>
                  <p className="font-mono text-[8px] tracking-[0.15em] text-[#52777c]">
                    ORDER STATUS
                  </p>

                  <p className="font-mono text-sm text-[#67c987] mt-1">
                    CONFIRMED
                  </p>
                </div>
              </div>

              <div className="py-7 space-y-6">
                <div className="flex items-center justify-between gap-5">
                  <span className="font-mono text-[9px] tracking-[0.13em] text-[#5d8085]">
                    ORDER NUMBER
                  </span>

                  <span className="font-mono text-sm font-semibold text-[#e7f1f1]">
                    {orderResult.orderNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-5">
                  <span className="font-mono text-[9px] tracking-[0.13em] text-[#5d8085]">
                    PRODUCT
                  </span>

                  <span className="text-sm font-medium text-[#d8e5e6] text-right">
                    {product.name}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-5 pt-5 border-t border-[#123a40]">
                  <span className="font-mono text-[9px] tracking-[0.13em] text-[#5d8085]">
                    TOTAL
                  </span>

                  <span className="font-mono text-xl font-semibold text-[#f9b223]">
                    ₹{orderResult.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/drops")}
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-[#f9b223]
                  text-[#013f46]
                  font-semibold
                  text-sm
                  px-5
                  py-3.5
                  rounded-xl
                  hover:opacity-90
                  transition-opacity
                "
              >
                Back to Active Drops
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#04161a] text-[#f4faf9] relative overflow-hidden">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(168,196,200,.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(168,196,200,.045) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute left-[5%] top-[5%] w-96 h-96 rounded-full bg-[#013f46]/35 blur-[140px] pointer-events-none" />

      <div className="absolute right-[5%] top-[25%] w-96 h-96 rounded-full bg-[#f9b223]/[0.035] blur-[140px] pointer-events-none" />

      <div className="absolute left-[40%] bottom-[-10%] w-[500px] h-[500px] rounded-full bg-[#013f46]/20 blur-[150px] pointer-events-none" />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* Back / breadcrumb */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate("/drops")}
            className="
              group
              flex
              items-center
              gap-2
              font-mono
              text-[9px]
              tracking-[0.13em]
              text-[#6c8d92]
              hover:text-[#f9b223]
              transition-colors
            "
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            BACK TO DROPS
          </button>

          <div
            className="
              flex
              items-center
              gap-2
              border border-[#17444a]
              bg-[#061e22]/70
              backdrop-blur-sm
              rounded-full
              px-3
              py-1.5
            "
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#67c987] opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#67c987]" />
            </span>

            <span className="font-mono text-[8px] tracking-[0.14em] text-[#78999e]">
              INVENTORY STREAM ACTIVE
            </span>
          </div>
        </div>

        {/* Page heading */}
        <div className="mb-10">
          <p className="font-mono text-[9px] tracking-[0.22em] text-[#f9b223] mb-3">
            STOCKFLOW / LIVE DROP
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.045em] leading-tight">
            Secure the drop.
            <br />
            <span className="text-[#78999e]">Before inventory disappears.</span>
          </h1>
        </div>

        {/* ======================================================
            MAIN PRODUCT PANEL
        ====================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-6 lg:gap-8">
          {/* ==================================================
              PRODUCT IMAGE
          ================================================== */}

          <div
            className="
              relative
              rounded-2xl
              overflow-hidden
              border border-[#15434a]
              bg-[#061d21]/95
              backdrop-blur-xl
              min-h-[520px]
              shadow-[0_25px_70px_rgba(0,0,0,.25)]
            "
          >
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(
                    rgba(168,196,200,.045) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(168,196,200,.045) 1px,
                    transparent 1px
                  )
                `,
                backgroundSize: "32px 32px",
              }}
            />

            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full bg-[#013f46]/35 blur-[90px]" />
            </div>

            {/* Top labels */}
            <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between">
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  border border-[#17444a]
                  bg-[#061e22]/85
                  backdrop-blur-sm
                  rounded-full
                  px-3
                  py-1.5
                "
              >
                {/* <Zap size={11} className="text-[#f9b223]" /> */}

                <span className="font-mono text-[8px] tracking-[0.14em] text-[#a8c4c8]">
                  LIVE PRODUCT
                </span>
              </div>

              <span className="font-mono text-[8px] tracking-[0.14em] text-[#52777c]">
                DROP ID / {id.slice(-6).toUpperCase()}
              </span>
            </div>

            {/* Image */}
            <div className="absolute inset-0 flex items-center justify-center p-12 lg:p-16">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="
                  relative
                  max-w-full
                  max-h-[410px]
                  object-contain
                  drop-shadow-[0_30px_50px_rgba(0,0,0,.45)]
                "
              />
            </div>

            {/* Bottom image telemetry */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <div>
                <p className="font-mono text-[8px] tracking-[0.16em] text-[#52777c]">
                  STOCKFLOW / PRODUCT ASSET
                </p>

                <p className="font-mono text-[8px] text-[#405f64] mt-1">
                  LIVE INVENTORY LINKED
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#67c987]" />

                <span className="font-mono text-[8px] text-[#52777c]">
                  SYNCED
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================
              PRODUCT DETAILS
          ================================================== */}

          <div
            className="
              relative
              rounded-2xl
              overflow-hidden
              border border-[#15434a]
              bg-[#061d21]/95
              backdrop-blur-xl
              shadow-[0_25px_70px_rgba(0,0,0,.25)]
            "
          >
            <div className="p-6 sm:p-8">
              {/* Product heading */}
              <div className="pb-6 border-b border-[#123a40]">
                <p className="font-mono text-[8px] tracking-[0.16em] text-[#52777c] mb-3">
                  PRODUCT
                </p>

                <h2 className="text-2xl sm:text-3xl font-semibold text-[#e7f1f1] tracking-[-0.03em]">
                  {product.name}
                </h2>

                <div className="flex items-end justify-between gap-4 mt-5">
                  <div>
                    <p className="font-mono text-[8px] tracking-[0.14em] text-[#52777c] mb-1">
                      UNIT PRICE
                    </p>

                    <p className="font-mono text-2xl font-semibold text-white">
                      ₹{product.unitPrice.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-[8px] tracking-[0.14em] text-[#52777c] mb-1">
                      INVENTORY
                    </p>

                    <p
                      className={`font-mono text-sm font-semibold ${
                        stock === 0 ? "text-[#e08484]" : "text-[#f9b223]"
                      }`}
                    >
                      {stock === null
                        ? "CHECKING..."
                        : stock > 0
                          ? `${stock} LEFT`
                          : "SOLD OUT"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  LIVE STOCK
              ================================================== */}

              <div className="py-6 border-b border-[#123a40]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#67c987] opacity-60 animate-ping" />

                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#67c987]" />
                    </span>

                    <span className="font-mono text-[8px] tracking-[0.14em] text-[#78999e]">
                      REAL-TIME INVENTORY
                    </span>
                  </div>

                  <span className="font-mono text-[8px] text-[#52777c]">
                    SOCKET.IO
                  </span>
                </div>

                <div className="h-2 bg-[#0d3035] rounded-full overflow-hidden">
                  <div
                    className={`
                      h-full
                      rounded-full
                      transition-all
                      duration-700
                      ${stock === 0 ? "bg-[#e08484]" : "bg-[#f9b223]"}
                    `}
                    style={{
                      width:
                        stock === null
                          ? "35%"
                          : stock > 0
                            ? `${Math.min(100, Math.max(3, stock))}%`
                            : "0%",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono text-[8px] text-[#405f64]">
                    INVENTORY LEVEL
                  </span>

                  <span className="font-mono text-[8px] text-[#405f64]">
                    LIVE
                  </span>
                </div>
              </div>

              {/* ==================================================
                  WAITING ROOM
              ================================================== */}

              {waiting && (
                <div className="py-6">
                  <div
                    className="
                      relative
                      border
                      border-[#28515a]
                      bg-[#08252a]
                      rounded-xl
                      p-5
                      overflow-hidden
                    "
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#f9b223]" />

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-[#f9b223]/10 border border-[#f9b223]/20 flex items-center justify-center">
                        <span className="font-mono text-[#f9b223] text-sm">
                          #
                        </span>
                      </div>

                      <div className="flex-1">
                        <p className="font-mono text-[9px] tracking-[0.14em] text-[#f9b223]">
                          WAITING ROOM
                        </p>

                        <p className="text-sm font-medium text-[#dce9ea] mt-2">
                          You are in the waiting room.
                        </p>

                        {queuePosition !== null && (
                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-mono text-[8px] tracking-[0.12em] text-[#52777c]">
                              QUEUE POSITION
                            </span>

                            <span className="font-mono text-xl font-semibold text-[#f9b223]">
                              #{queuePosition}
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-[#6d8c91] mt-4 leading-relaxed">
                          Please keep this page open. You will be notified
                          automatically when you are promoted.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  PROMOTED
              ================================================== */}

              {promoted && !reservation && (
                <div className="py-6">
                  <div
                    className="
                      border
                      border-[#285844]
                      bg-[#0a251c]
                      rounded-xl
                      p-5
                    "
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#67c987]/10 border border-[#67c987]/20 flex items-center justify-center">
                        <span className="text-[#67c987]">✓</span>
                      </div>

                      <div>
                        <p className="font-mono text-[9px] tracking-[0.14em] text-[#67c987]">
                          ACCESS GRANTED
                        </p>

                        <p className="text-sm font-medium text-[#dce9ea] mt-2">
                          You have been promoted!
                        </p>

                        <p className="text-xs text-[#71968a] mt-1">
                          You can now try to purchase the item.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  BUY BUTTON
              ================================================== */}

              {!waiting && !reservation && (
                <div className="pt-6">
                  <button
                    onClick={handleBuy}
                    disabled={buying || stock === 0 || stock === null}
                    className="
                      w-full
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-[#f9b223]
                      text-[#013f46]
                      text-sm
                      font-semibold
                      px-5
                      py-3.5
                      rounded-xl
                      hover:opacity-90
                      transition-all
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      shadow-[0_8px_30px_rgba(249,178,35,.08)]
                    "
                  >
                    {buying
                      ? "PROCESSING..."
                      : stock === 0
                        ? "SOLD OUT"
                        : "BUY NOW"}
                  </button>

                  {buyError && (
                    <div className="mt-3 border border-[#5b3035] bg-[#24171a] rounded-lg px-4 py-3">
                      <p className="font-mono text-[9px] text-[#e08484]">
                        ERROR / {buyError}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================
                  RESERVATION
              ================================================== */}

              {reservation && ttlRemaining > 0 && (
  <div className="pt-6">
    <div className="border border-[#72571f] bg-[#241d0d] rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-mono text-[9px] tracking-[0.14em] text-[#f9b223]">
            ITEM RESERVED
          </p>
          <p className="text-xs text-[#9b8963] mt-2">
            Your inventory hold is active.
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-[8px] text-[#796a48]">EXPIRES IN</p>
          <p className="font-mono text-2xl font-semibold text-[#f9b223] mt-1">
            {ttlRemaining}s
          </p>
        </div>
      </div>

      <div className="h-1.5 bg-[#3a301b] rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-[#f9b223] rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(
              100,
              Math.max(0, (ttlRemaining / reservation.ttlSeconds) * 100),
            )}%`,
          }}
        />
      </div>

      {/* --------------------------------------------------
          CUSTOMER DETAILS FORM
      -------------------------------------------------- */}

      <div className="space-y-3 mb-5">
        <p className="font-mono text-[8px] tracking-[0.14em] text-[#c4a660] mb-3">
          DELIVERY DETAILS
        </p>

        <input
          type="text"
          value={customerInfo.name}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, name: e.target.value })
          }
          placeholder="Full name"
          className="w-full bg-[#1a1408] border border-[#4a3d1a] rounded-lg px-4 py-2.5 text-sm text-[#f0e6cc] outline-none focus:border-[#f9b223]/50 transition-colors placeholder:text-[#7a6a3f]"
        />

        <input
          type="email"
          value={customerInfo.email}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, email: e.target.value })
          }
          placeholder="Email"
          className="w-full bg-[#1a1408] border border-[#4a3d1a] rounded-lg px-4 py-2.5 text-sm text-[#f0e6cc] outline-none focus:border-[#f9b223]/50 transition-colors placeholder:text-[#7a6a3f]"
        />

        <input
          type="tel"
          value={customerInfo.phone}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, phone: e.target.value })
          }
          placeholder="Phone"
          className="w-full bg-[#1a1408] border border-[#4a3d1a] rounded-lg px-4 py-2.5 text-sm text-[#f0e6cc] outline-none focus:border-[#f9b223]/50 transition-colors placeholder:text-[#7a6a3f]"
        />

        <textarea
          value={customerInfo.address}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, address: e.target.value })
          }
          rows={2}
          placeholder="Address (optional)"
          className="w-full bg-[#1a1408] border border-[#4a3d1a] rounded-lg px-4 py-2.5 text-sm text-[#f0e6cc] outline-none focus:border-[#f9b223]/50 transition-colors placeholder:text-[#7a6a3f] resize-none"
        />
      </div>

      {formError && (
        <div className="mb-4 border border-[#5b3035] bg-[#24171a] rounded-lg px-4 py-3">
          <p className="font-mono text-[9px] text-[#e08484]">{formError}</p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={checkingOut}
        className="w-full bg-[#f9b223] text-[#013f46] text-sm font-semibold px-5 py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {checkingOut ? "CONFIRMING ORDER..." : "COMPLETE CHECKOUT"}
      </button>

      {checkoutError && (
        <div className="mt-3 border border-[#5b3035] bg-[#24171a] rounded-lg px-4 py-3">
          <p className="font-mono text-[9px] text-[#e08484]">
            ERROR / {checkoutError}
          </p>
        </div>
      )}
    </div>
  </div>
)}

              {/* ==================================================
                  EXPIRED
              ================================================== */}

              {reservation && ttlRemaining === 0 && (
                <div className="pt-6">
                  <div className="border border-[#5b3035] bg-[#24171a] rounded-xl p-5">
                    <p className="font-mono text-[9px] tracking-[0.14em] text-[#e08484]">
                      RESERVATION EXPIRED
                    </p>

                    <p className="text-xs text-[#9b777b] mt-2">
                      Your hold expired. Please try buying again.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom technical footer */}
            <div className="border-t border-[#123a40] px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
              <span className="font-mono text-[7px] tracking-[0.15em] text-[#405f64]">
                STOCKFLOW / CONCURRENCY INFRASTRUCTURE
              </span>

              <span className="flex items-center gap-1.5 font-mono text-[7px] text-[#52777c]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#67c987]" />
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
            SYSTEM INFO
        ====================================================== */}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-[#123a40] bg-[#061d21]/70 rounded-xl p-4">
            <p className="font-mono text-[8px] tracking-[0.14em] text-[#52777c]">
              INVENTORY
            </p>

            <p className="font-mono text-xs text-[#a8c4c8] mt-2">
              REAL-TIME STOCK
            </p>
          </div>

          <div className="border border-[#123a40] bg-[#061d21]/70 rounded-xl p-4">
            <p className="font-mono text-[8px] tracking-[0.14em] text-[#52777c]">
              RESERVATION
            </p>

            <p className="font-mono text-xs text-[#a8c4c8] mt-2">
              TEMPORARY HOLD
            </p>
          </div>

          <div className="border border-[#123a40] bg-[#061d21]/70 rounded-xl p-4">
            <p className="font-mono text-[8px] tracking-[0.14em] text-[#52777c]">
              QUEUE
            </p>

            <p className="font-mono text-xs text-[#a8c4c8] mt-2">FAIR ACCESS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropDetail;
