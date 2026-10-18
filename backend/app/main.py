import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import init_db
from app.api.v1.router import api_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("mediflow.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handling DB initialization, seeding, and shutdown cleanup.
    """
    logger.info("Initializing MediFlow AI Clinical Intelligence Platform...")
    try:
        await init_db()
        logger.info("Database schema initialized and seed records verified.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
    yield
    logger.info("MediFlow AI shutting down gracefully.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Clinical Intelligence & Multimodal Agent Framework — Evolus AI Hackathon",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware Configuration
origins = settings.cors_origins
logger.info(f"Configuring CORS for allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "OPERATIONAL",
        "documentation": "/docs",
        "api_v1_prefix": "/api/v1",
        "track": "Evolus AI Hackathon — Clinical Intelligence & Multimodal Agent Framework",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
