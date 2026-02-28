# 🌾 Crop Advisor System

An AI-powered crop advisory platform for Indian farmers — providing ML-based crop recommendations, market price predictions, sensor data integration, weather analysis, and government scheme information.

## 🏗️ Project Structure

```
Crop Advisor System/
├── frontend/          # React + Vite + TypeScript (deployed on Render Static)
├── backend/           # Python FastAPI ML API  (deployed on Render Web Service)
├── database/          # PostgreSQL schema
├── datasets/
│   ├── crops_india_master.csv
│   ├── crop_prices_india_monthly_1975_2025.csv
│   └── weather_india_monthly_1975_2025.csv
└── README.md
```

## 🚀 Quick Start (Local)

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local    # Set VITE_API_URL=http://localhost:8000
npm run dev
```

### Backend (ML API)
```bash
cd backend
pip install -r requirements.txt
python train_models.py         # Train ML models (run once)
uvicorn main:app --reload --port 8000
```

### Database
```bash
# Paste database/schema.sql in Render PostgreSQL console
```

## 🤖 ML Models

| Model | Algorithm | Dataset | Purpose |
|-------|-----------|---------|---------|
| Crop Recommender | RandomForestClassifier | crops_india_master.csv | Top-4 crop suggestions from N, P, K, pH, moisture, temp |
| Price Predictor | GradientBoostingRegressor | crop_prices_india_monthly_1975_2025.csv | 60-day price forecast in 4×15-day phases |
| Weather Analyzer | Historical Lookup | weather_india_monthly_1975_2025.csv | State/month weather patterns (50 years) |

## 🌐 Deployment (Render)

### Backend Web Service
- **Repository**: `github.com/ritesh112006/crop-advisor-system`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt && python train_models.py`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment**: `VITE_API_URL=<your-backend-url>`

## 🔑 Environment Variables

### Frontend `.env.local`
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## 📊 API Endpoints

```
GET  /api/health              Health check
POST /api/recommend-crops     ML crop recommendation
POST /api/market-prices       60-day price prediction
POST /api/weather-analysis    Historical weather patterns
```

## 🌍 Supported Languages
English, हिन्दी, தமிழ், తెలుగు, मराठी, ଓଡ଼ିଆ, ਪੰਜਾਬੀ, বাংলা, ગુજરાતી
