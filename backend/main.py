from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="Arthenyx Cost Intelligence API",
    description="Autonomous cost intelligence platform with NFI computation, risk detection, and autonomous actions.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "platform": "Arthenyx",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": ["/financial-data", "/health"],
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "arthenyx-backend"}