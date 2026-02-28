"""
train_models.py - Train all ML models from dataset CSVs and save as .pkl files
Run once: python train_models.py
"""
import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error

DATA_DIR = os.path.join(os.path.dirname(__file__), '..')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models', 'saved')
os.makedirs(MODELS_DIR, exist_ok=True)

print("=" * 60)
print("CROP ADVISOR SYSTEM — ML MODEL TRAINER")
print("=" * 60)

# ─── Soil type compatibility table ──────────────────────────
# Maps crop → compatible soil types (from agricultural knowledge)
CROP_SOIL_TYPES = {
    "Rice":       ["Clay", "Clay Loam", "Silty Clay", "Silty Loam"],
    "Wheat":      ["Loamy", "Clay Loam", "Sandy Loam", "Black Cotton"],
    "Maize":      ["Loamy", "Sandy Loam", "Sandy", "Clay Loam"],
    "Cotton":     ["Black Cotton", "Clay Loam", "Sandy Clay", "Loamy"],
    "Sugarcane":  ["Loamy", "Clay Loam", "Silty Loam", "Sandy Loam"],
    "Soybean":    ["Loamy", "Sandy Loam", "Clay Loam", "Silty Loam"],
    "Groundnut":  ["Sandy Loam", "Sandy", "Loamy", "Red Soil"],
    "Pulses":     ["Sandy Loam", "Loamy", "Clay Loam", "Red Soil"],
    "Millets":    ["Sandy", "Sandy Loam", "Loamy", "Red Soil"],
    "Vegetables": ["Loamy", "Silty Loam", "Sandy Loam", "Clay Loam"],
}

ALL_SOIL_TYPES = sorted(set(st for soils in CROP_SOIL_TYPES.values() for st in soils))

def soil_compatibility_score(crop: str, soil: str) -> float:
    """Returns 1.0 if best match, 0.75 if secondary, 0.3 if incompatible."""
    soils = CROP_SOIL_TYPES.get(crop, [])
    if not soils or soil not in soils:
        return 0.3   # incompatible
    idx = soils.index(soil)
    if idx == 0: return 1.0
    if idx == 1: return 0.9
    return 0.75     # secondary match

# ===========================================================
# 1. CROP RECOMMENDATION MODEL — RandomForestClassifier
# ===========================================================
print("\n[1/3] Training Crop Recommendation Model (with soil_type)...")

df_crops = pd.read_csv(os.path.join(DATA_DIR, 'crops_india_master.csv'))
print(f"  Loaded {len(df_crops)} rows from crops_india_master.csv")

records = []
for _, row in df_crops.iterrows():
    for soil in ALL_SOIL_TYPES:
        compat = soil_compatibility_score(row['crop_name'], soil)
        # Generate 15 synthetic samples per crop×state×soil
        for _ in range(15):
            n_noise = compat if compat > 0.5 else 0.5
            n = np.random.uniform(row['ideal_n'] * 0.7 * n_noise, row['ideal_n'] * 1.3)
            p = np.random.uniform(row['ideal_p'] * 0.7 * n_noise, row['ideal_p'] * 1.3)
            k = np.random.uniform(row['ideal_k'] * 0.7 * n_noise, row['ideal_k'] * 1.3)
            temp = np.random.uniform(row['temp_min_c'], row['temp_max_c'])
            ph = np.random.uniform(row['ph_min'], row['ph_max'])
            moisture = np.random.uniform(row['soil_moisture_min'], row['soil_moisture_max'])
            records.append({
                'N': n, 'P': p, 'K': k,
                'temperature': temp,
                'pH': ph,
                'moisture': moisture,
                'state': row['state'],
                'soil_type': soil,
                'soil_compat': compat,
                'crop': row['crop_name']
            })

df_train = pd.DataFrame(records)
print(f"  Generated {len(df_train):,} training samples (state × crop × soil_type combinations)")

# Encode categoricals
state_enc  = LabelEncoder()
soil_enc   = LabelEncoder()
crop_enc   = LabelEncoder()
df_train['state_enc']     = state_enc.fit_transform(df_train['state'])
df_train['soil_type_enc'] = soil_enc.fit_transform(df_train['soil_type'])
df_train['crop_enc']      = crop_enc.fit_transform(df_train['crop'])

features = ['N', 'P', 'K', 'temperature', 'pH', 'moisture', 'state_enc', 'soil_type_enc', 'soil_compat']
X = df_train[features].values
y = df_train['crop_enc'].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler_crop = StandardScaler()
X_train_s   = scaler_crop.fit_transform(X_train)
X_test_s    = scaler_crop.transform(X_test)

clf = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42, n_jobs=-1)
clf.fit(X_train_s, y_train)
y_pred = clf.predict(X_test_s)
acc = accuracy_score(y_test, y_pred)
print(f"  ✓ RandomForest accuracy: {acc:.2%}")

# Save encoders and model
joblib.dump(clf,          os.path.join(MODELS_DIR, 'crop_model.pkl'))
joblib.dump(scaler_crop,  os.path.join(MODELS_DIR, 'crop_scaler.pkl'))
joblib.dump(state_enc,    os.path.join(MODELS_DIR, 'state_encoder.pkl'))
joblib.dump(soil_enc,     os.path.join(MODELS_DIR, 'soil_encoder.pkl'))
joblib.dump(crop_enc,     os.path.join(MODELS_DIR, 'crop_encoder.pkl'))

# Save soil types list for frontend
import json
with open(os.path.join(MODELS_DIR, 'soil_types.json'), 'w') as f:
    json.dump({"soil_types": ALL_SOIL_TYPES, "crop_soil_map": CROP_SOIL_TYPES}, f, indent=2)
print(f"  ✓ Soil types saved: {ALL_SOIL_TYPES}")

# ===========================================================
# 2. MARKET PRICE PREDICTION MODEL — GradientBoosting
# ===========================================================
print("\n[2/3] Training Market Price Prediction Model...")

df_prices = pd.read_csv(os.path.join(DATA_DIR, 'crop_prices_india_monthly_1975_2025.csv'))
print(f"  Loaded {len(df_prices):,} rows from crop_prices_india_monthly_1975_2025.csv")

df_prices['year']  = df_prices['date'].str[:4].astype(int)
df_prices['month'] = df_prices['date'].str[5:7].astype(int)
df_prices = df_prices.sort_values(['crop_name', 'state', 'date'])

df_prices['lag1']  = df_prices.groupby(['crop_name', 'state'])['avg_price_rs_quintal'].shift(1)
df_prices['lag3']  = df_prices.groupby(['crop_name', 'state'])['avg_price_rs_quintal'].shift(3)
df_prices['lag6']  = df_prices.groupby(['crop_name', 'state'])['avg_price_rs_quintal'].shift(6)
df_prices['lag12'] = df_prices.groupby(['crop_name', 'state'])['avg_price_rs_quintal'].shift(12)
df_prices = df_prices.dropna()

price_crop_enc  = LabelEncoder()
price_state_enc = LabelEncoder()
df_prices['crop_enc']  = price_crop_enc.fit_transform(df_prices['crop_name'])
df_prices['state_enc'] = price_state_enc.fit_transform(df_prices['state'])

price_features = ['crop_enc', 'state_enc', 'year', 'month', 'lag1', 'lag3', 'lag6', 'lag12']
X_p = df_prices[price_features].values
y_p = df_prices['avg_price_rs_quintal'].values

X_p_train, X_p_test, y_p_train, y_p_test = train_test_split(X_p, y_p, test_size=0.15, random_state=42)

price_model = GradientBoostingRegressor(n_estimators=200, max_depth=6, learning_rate=0.1, random_state=42)
price_model.fit(X_p_train, y_p_train)
mae = mean_absolute_error(y_p_test, price_model.predict(X_p_test))
print(f"  ✓ GradientBoosting MAE: ₹{mae:.0f}/quintal")

joblib.dump(price_model,     os.path.join(MODELS_DIR, 'price_model.pkl'))
joblib.dump(price_crop_enc,  os.path.join(MODELS_DIR, 'price_crop_encoder.pkl'))
joblib.dump(price_state_enc, os.path.join(MODELS_DIR, 'price_state_encoder.pkl'))

lag_cache = df_prices.groupby(['crop_name', 'state']).last()[
    ['lag1','lag3','lag6','lag12','avg_price_rs_quintal']
].reset_index()
lag_cache.to_csv(os.path.join(MODELS_DIR, 'price_lag_cache.csv'), index=False)
print(f"  ✓ Price model saved")

# ===========================================================
# 3. WEATHER ANALYSIS — Historical averages by state+month
# ===========================================================
print("\n[3/3] Building Weather Lookup Table...")

df_weather = pd.read_csv(os.path.join(DATA_DIR, 'weather_india_monthly_1975_2025.csv'))
df_weather['month'] = df_weather['date'].str[5:7].astype(int)
df_weather['year']  = df_weather['date'].str[:4].astype(int)

weather_avg = df_weather.groupby(['state', 'month']).agg(
    avg_temp=('avg_temp_c', 'mean'),
    avg_rainfall=('rainfall_mm', 'mean'),
    avg_humidity=('humidity_pct', 'mean'),
    avg_wind=('wind_speed_mps', 'mean')
).reset_index()

recent = df_weather[df_weather['year'] >= 2020]
weather_recent = recent.groupby(['state', 'month']).agg(
    recent_temp=('avg_temp_c', 'mean'),
    recent_rainfall=('rainfall_mm', 'mean'),
    recent_humidity=('humidity_pct', 'mean'),
).reset_index()

weather_full = weather_avg.merge(weather_recent, on=['state', 'month'], how='left')
weather_full.to_csv(os.path.join(MODELS_DIR, 'weather_lookup.csv'), index=False)
print(f"  ✓ Weather lookup: {len(weather_full)} state×month combinations")

print("\n" + "=" * 60)
print("✅ ALL MODELS TRAINED SUCCESSFULLY!")
print(f"   Saved to: {MODELS_DIR}")
print("=" * 60)
