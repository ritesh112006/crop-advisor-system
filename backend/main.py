"""
FastAPI ML Backend for Crop Advisor System
Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""
import os
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import pandas as pd
import joblib
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Crop Advisor ML API", version="1.0.0")

# CORS — allow frontend on any origin (tighten in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Model paths ────────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models", "saved")

# ─── Load models on startup ─────────────────────────────────
crop_model = None
crop_scaler = None
state_encoder = None
crop_encoder = None
price_model = None
price_crop_enc = None
price_state_enc = None
lag_cache = None
weather_lookup = None

@app.on_event("startup")
async def load_models():
    global crop_model, crop_scaler, state_encoder, crop_encoder
    global price_model, price_crop_enc, price_state_enc, lag_cache, weather_lookup
    try:
        crop_model    = joblib.load(os.path.join(MODELS_DIR, "crop_model.pkl"))
        crop_scaler   = joblib.load(os.path.join(MODELS_DIR, "crop_scaler.pkl"))
        state_encoder = joblib.load(os.path.join(MODELS_DIR, "state_encoder.pkl"))
        crop_encoder  = joblib.load(os.path.join(MODELS_DIR, "crop_encoder.pkl"))
        print("✓ Crop recommendation model loaded")

        price_model     = joblib.load(os.path.join(MODELS_DIR, "price_model.pkl"))
        price_crop_enc  = joblib.load(os.path.join(MODELS_DIR, "price_crop_encoder.pkl"))
        price_state_enc = joblib.load(os.path.join(MODELS_DIR, "price_state_encoder.pkl"))
        lag_cache       = pd.read_csv(os.path.join(MODELS_DIR, "price_lag_cache.csv"))
        print("✓ Price prediction model loaded")

        weather_lookup = pd.read_csv(os.path.join(MODELS_DIR, "weather_lookup.csv"))
        print("✓ Weather lookup table loaded")
    except Exception as e:
        print(f"⚠️  Model loading error (run train_models.py first): {e}")

# ─── Request / Response schemas ─────────────────────────────

class CropRecommendRequest(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    pH: float
    moisture: float
    state: str
    season: Optional[str] = "Kharif"
    soil_type: Optional[str] = "Loamy"

class MarketPriceRequest(BaseModel):
    crop_name: str
    state: str

class WeatherRequest(BaseModel):
    state: str
    month: int  # 1-12

# ─── Crop sowing / harvest info ─────────────────────────────
CROP_INFO = {
    "Rice":       {"sowing": "Jun-Jul", "harvest": "Nov-Dec", "fertilizer": "Urea 120kg/acre + SSP", "risk": "Medium"},
    "Wheat":      {"sowing": "Nov-Dec", "harvest": "Mar-Apr", "fertilizer": "DAP 50kg + Urea 65kg", "risk": "Low"},
    "Maize":      {"sowing": "Jun-Jul", "harvest": "Sep-Oct", "fertilizer": "Urea 100kg + MOP 50kg", "risk": "Low"},
    "Cotton":     {"sowing": "May-Jun", "harvest": "Nov-Jan", "fertilizer": "NPK 20:20:0 + Urea", "risk": "High"},
    "Sugarcane":  {"sowing": "Feb-Mar", "harvest": "Dec-Jan", "fertilizer": "Urea 180kg + SSP 90kg", "risk": "Medium"},
    "Soybean":    {"sowing": "Jun-Jul", "harvest": "Oct-Nov", "fertilizer": "DAP 60kg + Rhizobium", "risk": "Medium"},
    "Groundnut":  {"sowing": "Jun-Jul", "harvest": "Oct-Nov", "fertilizer": "Gypsum 200kg + DAP", "risk": "Low"},
    "Pulses":     {"sowing": "Oct-Nov", "harvest": "Feb-Mar", "fertilizer": "Rhizobium + DAP 20kg", "risk": "Low"},
    "Millets":    {"sowing": "Jun-Jul", "harvest": "Oct-Nov", "fertilizer": "Urea 40kg + SSP 20kg", "risk": "Low"},
    "Vegetables": {"sowing": "Oct-Nov", "harvest": "Jan-Feb", "fertilizer": "NPK 19:19:19 + FYM", "risk": "High"},
}

CROP_PRICES = {
    "Rice": 2800, "Wheat": 2275, "Maize": 2090, "Cotton": 6620,
    "Sugarcane": 315, "Soybean": 4892, "Groundnut": 6377,
    "Pulses": 5440, "Millets": 2500, "Vegetables": 2000
}

CROP_YIELDS = {
    "Rice": "45-55 q/acre", "Wheat": "18-22 q/acre", "Maize": "22-28 q/acre",
    "Cotton": "8-12 q/acre", "Sugarcane": "350-450 q/acre", "Soybean": "10-14 q/acre",
    "Groundnut": "12-16 q/acre", "Pulses": "6-10 q/acre", "Millets": "8-12 q/acre",
    "Vegetables": "60-90 q/acre"
}

# ─── Endpoints ──────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "models_loaded": crop_model is not None,
        "version": "1.0.0"
    }


@app.post("/api/recommend-crops")
async def recommend_crops(req: CropRecommendRequest):
    if crop_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded. Run train_models.py first.")
    try:
        # Encode state (handle unseen states gracefully)
        known_states = list(state_encoder.classes_)
        state_to_use = req.state if req.state in known_states else known_states[0]
        state_enc_val = state_encoder.transform([state_to_use])[0]

        features = np.array([[req.N, req.P, req.K, req.temperature, req.pH, req.moisture, state_enc_val]])
        features_scaled = crop_scaler.transform(features)
        proba = crop_model.predict_proba(features_scaled)[0]

        # Top 4 crops
        top4_idx = np.argsort(proba)[::-1][:4]
        results = []
        for idx in top4_idx:
            crop_name = crop_encoder.inverse_transform([idx])[0]
            confidence = round(float(proba[idx]) * 100, 1)
            info = CROP_INFO.get(crop_name, {})
            results.append({
                "crop": crop_name,
                "confidence": confidence,
                "expectedYield": CROP_YIELDS.get(crop_name, "N/A"),
                "marketPrice": CROP_PRICES.get(crop_name, 2500),
                "sowingPeriod": info.get("sowing", "N/A"),
                "harvestTime": info.get("harvest", "N/A"),
                "fertilizer": info.get("fertilizer", "NPK as recommended"),
                "riskLevel": info.get("risk", "Medium"),
            })
        return {"recommendations": results, "state": req.state, "status": "success"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/market-prices")
async def market_prices(req: MarketPriceRequest):
    if price_model is None:
        raise HTTPException(status_code=503, detail="Price model not loaded.")
    try:
        known_crops = list(price_crop_enc.classes_)
        known_states = list(price_state_enc.classes_)
        
        crop_to_use = req.crop_name if req.crop_name in known_crops else known_crops[0]
        state_to_use = req.state if req.state in known_states else known_states[0]

        crop_enc_val = price_crop_enc.transform([crop_to_use])[0]
        state_enc_val = price_state_enc.transform([state_to_use])[0]

        # Get lag values from cache
        cache_row = lag_cache[
            (lag_cache['crop_name'] == crop_to_use) &
            (lag_cache['state'] == state_to_use)
        ]
        if cache_row.empty:
            cache_row = lag_cache[(lag_cache['crop_name'] == crop_to_use)].head(1)

        if cache_row.empty:
            raise HTTPException(status_code=404, detail=f"No data for crop: {req.crop_name}")

        base_price = float(cache_row['avg_price_rs_quintal'].values[0])
        lag1 = float(cache_row['lag1'].values[0])
        lag3 = float(cache_row['lag3'].values[0])
        lag6 = float(cache_row['lag6'].values[0])
        lag12 = float(cache_row['lag12'].values[0])

        import datetime
        now = datetime.datetime.now()
        phases = []
        current_price = base_price
        prev_price = lag1

        for phase in range(4):  # 4 x 15-day phases
            future_month = (now.month + phase) % 12 + 1
            future_year = now.year + ((now.month + phase) // 12)

            X_pred = np.array([[crop_enc_val, state_enc_val, future_year, future_month,
                                 prev_price, lag3, lag6, lag12]])
            predicted = float(price_model.predict(X_pred)[0])

            # Apply small realistic noise ±2%
            noise = predicted * np.random.uniform(-0.02, 0.02)
            predicted = max(500, predicted + noise)

            trend = "up" if predicted > current_price else ("down" if predicted < current_price * 0.99 else "stable")
            phases.append({
                "phase": phase + 1,
                "label": f"Days {phase*15+1}–{phase*15+15}",
                "price": round(predicted),
                "trend": trend,
                "confidence": round(90 - phase * 5),  # Decreasing confidence over time
            })
            prev_price = predicted
            current_price = predicted

        return {
            "crop": req.crop_name,
            "state": req.state,
            "basePrice": round(base_price),
            "phases": phases,
            "currency": "INR",
            "unit": "per quintal"
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/weather-analysis")
async def weather_analysis(req: WeatherRequest):
    if weather_lookup is None:
        raise HTTPException(status_code=503, detail="Weather data not loaded.")
    try:
        row = weather_lookup[
            (weather_lookup['state'] == req.state) &
            (weather_lookup['month'] == req.month)
        ]
        if row.empty:
            row = weather_lookup[weather_lookup['month'] == req.month].head(1)
        if row.empty:
            raise HTTPException(status_code=404, detail="No weather data found")
        r = row.iloc[0]
        return {
            "state": req.state,
            "month": req.month,
            "avgTemp": round(float(r['avg_temp']), 1),
            "avgRainfall": round(float(r['avg_rainfall']), 1),
            "avgHumidity": round(float(r['avg_humidity']), 1),
            "recentTemp": round(float(r.get('recent_temp', r['avg_temp'])), 1),
            "recentRainfall": round(float(r.get('recent_rainfall', r['avg_rainfall'])), 1),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
