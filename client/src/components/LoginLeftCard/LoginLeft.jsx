import React from 'react'
import stockFlowLogo from "../../assets/stockflow_logo.png";
import './LoginLeft.css'

const LoginLeft = () => {
  return (
    <>
        <div className="logoArea">
            <img src={stockFlowLogo} alt="StockFlow" className="logoIcon" />
            <span className="logoText">StockFlow</span>
          </div>

          <svg
            className="bgChart"
            viewBox="0 0 600 300"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f9b223" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f9b223" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,220 C80,200 120,140 200,150 C280,160 300,90 380,80 C460,70 480,120 560,40 L600,20 L600,300 L0,300 Z"
              fill="url(#chartFade)"
            />
            <path
              d="M0,220 C80,200 120,140 200,150 C280,160 300,90 380,80 C460,70 480,120 560,40 L600,20"
              fill="none"
              stroke="#f9b223"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
          </svg>

          <div className="statCard card1">
            <span className="statDot"></span>
            <div className="statText">
              <p className="statLabel">Low stock alert</p>
              <p className="statValue">3 items need reorder</p>
            </div>
          </div>

          <div className="statCard card2">
            <span className="statDot dotGreen"></span>
            <div className="statText">
              <p className="statLabel">Order fulfilled</p>
              <p className="statValue">94% on-time delivery</p>
            </div>
          </div>

          <div className="statCard card3">
            <span className="statDot dotRed"></span>
            <div className="statText">
              <p className="statLabel">Shipment delayed</p>
              <p className="statValue">PO-2291 · 2 days late</p>
            </div>
          </div>

          <div className="statCard card4">
            <span className="statDot dotGreen"></span>
            <div className="statText">
              <p className="statLabel">Stock replenished</p>
              <p className="statValue">SKU-1042 · +500 units</p>
            </div>
          </div>

          <div className="statCard card5">
            <span className="statDot"></span>
            <div className="statText">
              <p className="statLabel">Overstock warning</p>
              <p className="statValue">Category: Electronics</p>
            </div>
          </div>
    </>
  )
}

export default LoginLeft