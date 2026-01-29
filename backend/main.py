from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- CORS CONFIGURATION ---
# This defines who can talk to the API
origins = [
    "http://localhost:3000",       # Your local frontend
    "http://127.0.0.1:3000",       # Alternative local address
    "https://crabu.vercel.app", # Your LIVE website (Add your actual Vercel link later)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # Allow these sites
    allow_credentials=True,        # Allow cookies/login headers
    allow_methods=["*"],           # Allow all methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],           # Allow all headers
)

@app.get("/")
def read_root():
    return {"message": "CRAB API is Online 🟢"}

@app.get("/health")
def health_check():
    return {"status": "active", "server": "FastAPI"}