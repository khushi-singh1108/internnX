"""
Main FastAPI Application

This module serves as the entry point for the InternnX AI Allocation Engine.
It configures the FastAPI application, sets up middleware, and includes all API routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database instance
from core.db import db

# Import API routers
from api.v1.router import router as api_router

# Initialize FastAPI application with metadata
app = FastAPI(
    title="InternnX AI Allocation Engine",
    description="""
    Backend API for the PM Internship Smart Allocation Scheme.
    
    This service handles user authentication, internship management, and AI-powered
    matching between applicants and internship opportunities.
    """,
    version="1.0.0",
    docs_url="/docs",  # Enable Swagger UI at /docs
    redoc_url="/redoc"  # Enable ReDoc at /redoc
)

# --- CORS Middleware Configuration ---
# This allows cross-origin requests from any origin for development.
# In production, you should restrict this to specific origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (restrict in production)
    allow_credentials=True,  # Allow cookies to be included in requests
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["Content-Range", "X-Total-Count"],  # Expose custom headers
)

# --- Database Connection Lifecycle Hooks ---

@app.on_event("startup")
async def startup_db_client():
    """
    Initialize database connection when the application starts.
    
    This function is called automatically by FastAPI during application startup.
    It establishes a connection to the MongoDB database.
    """
    try:
        await db.connect()
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    """
    Clean up database connections on application shutdown.
    
    This function is called automatically by FastAPI when the application is shutting down.
    It ensures all database connections are properly closed.
    """
    try:
        await db.close()
    except Exception as e:
        print(f"⚠️ Error closing database connection: {str(e)}")

# --- Include API Router ---
# All API endpoints defined in the router will be prefixed with /api/v1
app.include_router(
    api_router,
    prefix="/api/v1",
    tags=["api"],  # Group related endpoints in API documentation
)

# --- Health Check Endpoint ---
@app.get("/health", tags=["system"])
async def health_check():
    """
    Health check endpoint for load balancers and monitoring.
    
    Returns:
        dict: Status of the service and its dependencies
    """
    try:
        # Verify database connection
        await db.client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }, 503

# --- Root Endpoint ---
@app.get("/", include_in_schema=False)
async def root():
    """
    Root endpoint that provides basic API information.
    
    This endpoint is excluded from the API documentation.
    """
    return {
        "project": "InternnX",
        "status": "operational",
        "documentation": "/docs",
        "version": "1.0.0"
    }
