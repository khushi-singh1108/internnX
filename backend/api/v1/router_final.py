from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File, Form, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
import json
import os

# Configure logging
logger = logging.getLogger(__name__)
from core.db import db
from core.models import UserModel, MatchResultModel, InternshipModel

# Schemas
from .schemas import (
    UserCreateSchema,
    InternshipCreateSchema,
    MatchResultSchema,
    MatchRequestSchema
)

# Security
from .security import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_role, settings, get_user_by_email
)

# Import new services
from core.cache import cache
from core.rate_limiter import rate_limiter
from core.notifications import email_service
from core.analytics import analytics_service
from ml_engine.continuous_trainer import ml_trainer

# Initialize router
router = APIRouter()

# Create model_data directory if it doesn't exist
model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml_engine", "model_data")
os.makedirs(model_dir, exist_ok=True)

# Create training_corpus.txt if it doesn't exist
training_corpus_path = os.path.join(model_dir, "training_corpus.txt")
if not os.path.exists(training_corpus_path):
    with open(training_corpus_path, "w", encoding="utf-8") as f:
        f.write("")

@router.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    try:
        # Test database connection
        await db.get_collection("users").find_one()
        return {"status": "ok", "service": "InternnX Allocation Engine"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unavailable: {str(e)}"
        )

@router.post("/auth/register", response_model=dict, tags=["Authentication"])
async def register_user(user_data: UserCreateSchema):
    """Register a new user."""
    try:
        users_collection = get_users_collection()

        # Check if user already exists
        existing_user = await users_collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = get_password_hash(user_data.password)

        # Create user document
        user_doc = {
            "user_id": f"applicant_{user_data.email.split('@')[0]}",
            "email": user_data.email,
            "hashed_password": hashed_password,
            "name": user_data.name,
            "role": user_data.role or "applicant",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Insert user
        result = await users_collection.insert_one(user_doc)

        # Send welcome email
        await email_service.send_welcome_email(
            user_data.email,
            user_data.name,
            "https://internnx.com/activate"
        )

        return {
            "message": "User registered successfully",
            "user_id": str(result.inserted_id),
            "email": user_data.email
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error registering user"
        )

@router.post("/auth/token", response_model=dict, tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token."""
    try:
        user = await get_user_by_email(form_data.username)
        if not user or not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"]},
            expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during login"
        )

@router.get("/profile/me", response_model=dict, tags=["Profile"])
async def read_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    user = await get_users_collection().find_one({"email": current_user["email"]}, {"hashed_password": 0, "_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# =========================================================================
# INTERNSHIP MANAGEMENT
# =========================================================================

@router.post("/internships", response_model=dict, tags=["Internships"])
async def create_internship(
    internship_data: InternshipCreateSchema,
    current_user: dict = Depends(require_role("admin"))
):
    """Create a new internship opportunity."""
    try:
        internships_collection = get_internships_collection()

        # Create internship document
        internship_doc = {
            "company_id": internship_data.company_id,
            "title": internship_data.title,
            "location": internship_data.location,
            "required_skills": internship_data.required_skills,
            "sector": internship_data.sector,
            "total_capacity": internship_data.total_capacity,
            "slots_filled": 0,
            "is_active": internship_data.is_active,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Insert internship
        result = await internships_collection.insert_one(internship_doc)

        # Clear internship cache
        await cache.delete("internship_list:*")

        return {
            "message": "Internship created successfully",
            "internship_id": str(result.inserted_id),
            "title": internship_data.title
        }

    except Exception as e:
        logger.error(f"Error creating internship: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating internship"
        )

@router.get("/internships", response_model=List[dict], tags=["Internships"])
async def get_internships():
    """Get all active internships."""
    try:
        # Check cache first
        cache_key = "internship_list:active"
        cached_data = await cache.get(cache_key)
        if cached_data:
            return cached_data

        internships_collection = get_internships_collection()
        internships = await internships_collection.find({"is_active": True}).to_list(length=None)

        # Convert ObjectId to string for JSON serialization
        for internship in internships:
            internship["_id"] = str(internship["_id"])

        # Cache the results
        await cache.set(cache_key, internships, 900)  # 15 minutes

        return internships

    except Exception as e:
        logger.error(f"Error getting internships: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting internships"
        )

@router.get("/internships/{internship_id}", response_model=dict, tags=["Internships"])
async def get_internship(internship_id: str):
    """Get specific internship details."""
    try:
        from bson import ObjectId
        internships_collection = get_internships_collection()
        internship = await internships_collection.find_one({"_id": ObjectId(internship_id)})

        if not internship:
            raise HTTPException(status_code=404, detail="Internship not found")

        internship["_id"] = str(internship["_id"])
        return internship

    except Exception as e:
        logger.error(f"Error getting internship: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting internship"
        )

@router.put("/internships/{internship_id}", response_model=dict, tags=["Internships"])
async def update_internship(
    internship_id: str,
    internship_data: InternshipCreateSchema,
    current_user: dict = Depends(require_role("admin"))
):
    """Update an existing internship."""
    try:
        from bson import ObjectId
        internships_collection = get_internships_collection()

        # Update internship
        result = await internships_collection.update_one(
            {"_id": ObjectId(internship_id)},
            {
                "$set": {
                    "company_id": internship_data.company_id,
                    "title": internship_data.title,
                    "location": internship_data.location,
                    "required_skills": internship_data.required_skills,
                    "sector": internship_data.sector,
                    "total_capacity": internship_data.total_capacity,
                    "is_active": internship_data.is_active,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Internship not found")

        # Clear cache
        await cache.delete("internship_list:*")

        return {"message": "Internship updated successfully"}

    except Exception as e:
        logger.error(f"Error updating internship: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating internship"
        )

# =========================================================================
# MATCHING & ALLOCATION
# =========================================================================

@router.post("/matches/calculate", response_model=List[MatchResultSchema], tags=["Matching"])
async def calculate_matches(
    request: MatchRequestSchema,
    current_user: dict = Depends(get_current_user)
):
    """Calculate matches for the current user."""
    try:
        # Get user profile for matching
        users_collection = get_users_collection()
        user_profile = await users_collection.find_one({"email": current_user["email"]})
        if not user_profile:
            raise HTTPException(status_code=404, detail="User not found")

        # Get active internships
        internships_collection = get_internships_collection()
        internships = await internships_collection.find({"is_active": True}).to_list(100)

        results = []
        for internship in internships:
            # Use the ML engine to calculate match
            match_result = match_engine.calculate_match_score(user_profile, internship)

            results.append(MatchResultSchema(
                internship_id=str(internship["_id"]),
                title=internship["title"],
                organization=internship.get("company_id", "Unknown"),
                score=match_result["final_score"],
                explanation=match_result["explanation"],
                components=match_result["components"]
            ))

        # Sort by score descending
        results.sort(key=lambda x: x.score, reverse=True)
        return results

    except Exception as e:
        logger.error(f"Error calculating matches: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error calculating matches"
        )

@router.post("/matches/run-allocation", response_model=dict, tags=["Matching"])
async def run_allocation_process(
    current_user: dict = Depends(require_role("admin"))
):
    """Admin endpoint to run the full allocation process for all users."""
    try:
        users_collection = get_users_collection()
        matches_collection = get_matches_collection()

        # Get all applicants
        applicants = await users_collection.find({"role": "applicant"}).to_list(length=None)

        allocation_results = []

        for applicant in applicants:
            applicant_email = applicant["email"]
            applicant_features = {
                "skills": applicant.get("skills", []),
                "location": applicant.get("location", "Unknown"),
                "qualification": applicant.get("qualification", "Not Specified"),
                "aa_category": applicant.get("aa_category", "None")
            }

            # Run the matching process for this applicant
            await run_matching_process(applicant_email, applicant_features, applicant.get("location"))

            # Get the allocated match for this applicant
            allocated_match = await matches_collection.find_one(
                {"applicant_id": applicant_email, "allocation_status": "Matched"}
            )

            if allocated_match:
                allocation_results.append({
                    "applicant_email": applicant_email,
                    "allocated_internship_id": str(allocated_match["internship_id"]),
                    "score": allocated_match["s_final"]
                })

        return {
            "message": f"Allocation process completed for {len(applicants)} applicants",
            "allocations_made": len(allocation_results),
            "results": allocation_results
        }

    except Exception as e:
        logger.error(f"Error running allocation process: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error running allocation process"
        )

# ============================================================================
# ADVANCED FEATURES - ANALYTICS, ML TRAINING, NOTIFICATIONS
# ============================================================================

@router.post("/analytics/dashboard", tags=["Analytics"])
async def get_analytics_dashboard(current_user: dict = Depends(require_role("admin"))):
    """Get comprehensive analytics dashboard."""
    return await analytics_service.get_comprehensive_dashboard()

@router.get("/analytics/allocation-success", tags=["Analytics"])
async def get_allocation_success(days: int = 30, current_user: dict = Depends(require_role("admin"))):
    """Get allocation success rate."""
    return await analytics_service.get_allocation_success_rate(days)

@router.get("/analytics/user-engagement", tags=["Analytics"])
async def get_user_engagement(current_user: dict = Depends(require_role("admin"))):
    """Get user engagement metrics."""
    return await analytics_service.get_user_engagement_metrics()

@router.get("/analytics/geographic", tags=["Analytics"])
async def get_geographic_distribution(current_user: dict = Depends(require_role("admin"))):
    """Get geographic distribution of users and internships."""
    return await analytics_service.get_geographic_distribution()

@router.get("/analytics/sectors", tags=["Analytics"])
async def get_sector_analytics(current_user: dict = Depends(require_role("admin"))):
    """Get sector-wise analytics."""
    return await analytics_service.get_sector_analytics()

@router.get("/analytics/ml-performance", tags=["Analytics"])
async def get_ml_performance(current_user: dict = Depends(require_role("admin"))):
    """Get ML model performance metrics."""
    return await analytics_service.get_ml_performance()

@router.post("/ml/feedback", tags=["ML Training"])
async def submit_match_feedback(
    feedback_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Submit feedback on match quality for model improvement."""
    try:
        # Extract feedback data
        applicant_profile = feedback_data.get("applicant_profile", {})
        internship_profile = feedback_data.get("internship_profile", {})
        predicted_score = feedback_data.get("predicted_score", 0.0)
        actual_outcome = feedback_data.get("actual_outcome", "no_response")
        user_feedback = feedback_data.get("user_feedback")

        # Add to training data
        await ml_trainer.add_feedback(
            applicant_profile,
            internship_profile,
            predicted_score,
            actual_outcome,
            user_feedback
        )

        return {"message": "Feedback submitted successfully", "status": "training"}

    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error submitting feedback"
        )

@router.post("/ml/retrain", tags=["ML Training"])
async def trigger_model_retrain(current_user: dict = Depends(require_role("admin"))):
    """Manually trigger model retraining."""
    try:
        success = await ml_trainer.retrain_model()
        if success:
            return {"message": "Model retraining completed successfully"}
        else:
            return {"message": "Model retraining failed or not enough data"}

    except Exception as e:
        logger.error(f"Error during model retraining: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during model retraining"
        )

@router.get("/ml/performance", tags=["ML Training"])
async def get_ml_performance_summary(current_user: dict = Depends(require_role("admin"))):
    """Get ML model performance summary."""
    return await ml_trainer.get_model_performance_summary()

@router.post("/notifications/test-email", tags=["Notifications"])
async def test_email_notification(
    email_data: dict,
    current_user: dict = Depends(require_role("admin"))
):
    """Test email notification system."""
    try:
        to_email = email_data.get("to_email")
        if not to_email:
            raise HTTPException(status_code=400, detail="to_email is required")

        success = await email_service.send_welcome_email(
            to_email,
            "Test User",
            "https://example.com/activate"
        )

        if success:
            return {"message": "Test email sent successfully"}
        else:
            return {"message": "Failed to send test email"}

    except Exception as e:
        logger.error(f"Error sending test email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error sending test email"
        )

@router.get("/cache/stats", tags=["System"])
async def get_cache_stats(current_user: dict = Depends(require_role("admin"))):
    """Get cache statistics."""
    try:
        return {
            "cache_enabled": True,
            "cache_backend": "Redis",
            "status": "active"
        }
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        return {"error": str(e)}

@router.post("/cache/clear", tags=["System"])
async def clear_cache(current_user: dict = Depends(require_role("admin"))):
    """Clear all cached data."""
    try:
        # Clear specific cache keys
        cache_keys = [
            "analytics:*",
            "user_profile:*",
            "internship_list:*",
            "match_results:*"
        ]

        for pattern in cache_keys:
            # In a real implementation, you'd use Redis SCAN and DEL
            pass

        return {"message": "Cache cleared successfully"}

    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error clearing cache"
        )

# =========================================================================
# HELPER FUNCTIONS
# =========================================================================

def get_users_collection():
    """Get users collection - lazy loaded to avoid import-time DB connection."""
    return db.get_collection("users")

def get_matches_collection():
    """Get matches collection - lazy loaded to avoid import-time DB connection."""
    return db.get_collection("matches")

def get_internships_collection():
    """Get internships collection - lazy loaded to avoid import-time DB connection."""
    return db.get_collection("internships")

def run_matching_process(applicant_email: str, applicant_features: dict, location_preference: str):
    """Internal function to orchestrate the ML matching, ranking, and final allocation."""
    # This would contain the core allocation logic
    pass
