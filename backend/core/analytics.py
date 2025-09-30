"""
Advanced Analytics Service for InternnX AI Allocation Engine

Tracks and analyzes:
- Allocation success rates
- User engagement metrics
- Internship completion rates
- ML model performance
- Geographic distribution
- Sector-wise analytics
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import json
from core.cache import cache, CACHE_TTL
from core.db import db

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Comprehensive analytics service for tracking system performance."""

    def __init__(self):
        self.cache_ttl = CACHE_TTL["analytics"]

    async def get_allocation_success_rate(self, days: int = 30) -> Dict[str, Any]:
        """Calculate allocation success rate for the last N days."""
        cache_key = f"analytics:allocation_success:{days}"

        # Check cache first
        cached_result = await cache.get(cache_key)
        if cached_result:
            return cached_result

        try:
            # Get date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)

            # Get matches from the period
            matches_collection = db.get_collection("matches")
            pipeline = [
                {
                    "$match": {
                        "created_at": {"$gte": start_date, "$lte": end_date}
                    }
                },
                {
                    "$group": {
                        "_id": "$allocation_status",
                        "count": {"$sum": 1}
                    }
                }
            ]

            results = await matches_collection.aggregate(pipeline).to_list(length=None)

            # Calculate success rate
            total_matches = sum(result["count"] for result in results)
            matched_count = next(
                (result["count"] for result in results if result["_id"] == "Matched"),
                0
            )

            success_rate = (matched_count / total_matches * 100) if total_matches > 0 else 0

            result = {
                "period_days": days,
                "total_matches": total_matches,
                "matched_count": matched_count,
                "success_rate": round(success_rate, 2),
                "calculated_at": datetime.utcnow().isoformat()
            }

            # Cache the result
            await cache.set(cache_key, result, self.cache_ttl)
            return result

        except Exception as e:
            logger.error(f"Error calculating allocation success rate: {e}")
            return {"error": str(e)}

    async def get_user_engagement_metrics(self) -> Dict[str, Any]:
        """Get user engagement metrics."""
        cache_key = "analytics:user_engagement"

        cached_result = await cache.get(cache_key)
        if cached_result:
            return cached_result

        try:
            users_collection = db.get_collection("users")
            matches_collection = db.get_collection("matches")

            # Get user statistics
            total_users = await users_collection.count_documents({})
            active_users = await users_collection.count_documents({
                "updated_at": {"$gte": datetime.utcnow() - timedelta(days=7)}
            })

            # Get match statistics
            total_matches = await matches_collection.count_documents({})
            recent_matches = await matches_collection.count_documents({
                "created_at": {"$gte": datetime.utcnow() - timedelta(days=7)}
            })

            result = {
                "total_users": total_users,
                "active_users_7d": active_users,
                "total_matches": total_matches,
                "recent_matches_7d": recent_matches,
                "engagement_rate": round((active_users / total_users * 100), 2) if total_users > 0 else 0,
                "calculated_at": datetime.utcnow().isoformat()
            }

            await cache.set(cache_key, result, self.cache_ttl)
            return result

        except Exception as e:
            logger.error(f"Error calculating user engagement: {e}")
            return {"error": str(e)}

    async def get_geographic_distribution(self) -> Dict[str, Any]:
        """Get geographic distribution of users and internships."""
        cache_key = "analytics:geographic_distribution"

        cached_result = await cache.get(cache_key)
        if cached_result:
            return cached_result

        try:
            users_collection = db.get_collection("users")
            internships_collection = db.get_collection("internships")

            # User locations
            user_locations = await users_collection.aggregate([
                {"$group": {"_id": "$location", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]).to_list(length=20)

            # Internship locations
            internship_locations = await internships_collection.aggregate([
                {"$group": {"_id": "$location", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]).to_list(length=20)

            result = {
                "user_locations": [
                    {"location": loc["_id"], "count": loc["count"]}
                    for loc in user_locations
                ],
                "internship_locations": [
                    {"location": loc["_id"], "count": loc["count"]}
                    for loc in internship_locations
                ],
                "calculated_at": datetime.utcnow().isoformat()
            }

            await cache.set(cache_key, result, self.cache_ttl)
            return result

        except Exception as e:
            logger.error(f"Error calculating geographic distribution: {e}")
            return {"error": str(e)}

    async def get_sector_analytics(self) -> Dict[str, Any]:
        """Get sector-wise analytics."""
        cache_key = "analytics:sector_analytics"

        cached_result = await cache.get(cache_key)
        if cached_result:
            return cached_result

        try:
            users_collection = db.get_collection("users")
            internships_collection = db.get_collection("internships")

            # Get sector distribution for users (from their skills/interests)
            user_sectors = await users_collection.aggregate([
                {
                    "$lookup": {
                        "from": "matches",
                        "localField": "email",
                        "foreignField": "applicant_id",
                        "as": "user_matches"
                    }
                },
                {
                    "$project": {
                        "sector": {"$arrayElemAt": ["$user_matches.sector", 0]},
                        "skills": 1
                    }
                },
                {"$group": {"_id": "$sector", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]).to_list(length=10)

            # Get internship sectors
            internship_sectors = await internships_collection.aggregate([
                {"$group": {"_id": "$sector", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]).to_list(length=10)

            result = {
                "user_sectors": [
                    {"sector": sector["_id"], "count": sector["count"]}
                    for sector in user_sectors
                ],
                "internship_sectors": [
                    {"sector": sector["_id"], "count": sector["count"]}
                    for sector in internship_sectors
                ],
                "calculated_at": datetime.utcnow().isoformat()
            }

            await cache.set(cache_key, result, self.cache_ttl)
            return result

        except Exception as e:
            logger.error(f"Error calculating sector analytics: {e}")
            return {"error": str(e)}

    async def get_ml_model_performance(self) -> Dict[str, Any]:
        """Get ML model performance metrics."""
        cache_key = "analytics:ml_performance"

        cached_result = await cache.get(cache_key)
        if cached_result:
            return cached_result

        try:
            matches_collection = db.get_collection("matches")

            # Get matches with scores
            matches = await matches_collection.find({
                "s_final": {"$exists": True}
            }).to_list(length=1000)

            if not matches:
                return {"message": "No match data available yet"}

            # Calculate score statistics
            scores = [match["s_final"] for match in matches]
            avg_score = sum(scores) / len(scores)

            # Calculate allocation success by score ranges
            score_ranges = {
                "high": (0.8, 1.0),
                "medium": (0.6, 0.8),
                "low": (0.0, 0.6)
            }

            range_stats = {}
            for range_name, (min_score, max_score) in score_ranges.items():
                range_matches = [m for m in matches if min_score <= m["s_final"] < max_score]
                allocated_in_range = len([m for m in range_matches if m["allocation_status"] == "Matched"])
                total_in_range = len(range_matches)

                range_stats[range_name] = {
                    "total": total_in_range,
                    "allocated": allocated_in_range,
                    "success_rate": round((allocated_in_range / total_in_range * 100), 2) if total_in_range > 0 else 0
                }

            result = {
                "total_matches": len(matches),
                "average_score": round(avg_score, 3),
                "score_distribution": range_stats,
                "calculated_at": datetime.utcnow().isoformat()
            }

            await cache.set(cache_key, result, self.cache_ttl)
            return result

        except Exception as e:
            logger.error(f"Error calculating ML performance: {e}")
            return {"error": str(e)}

    async def get_comprehensive_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive analytics dashboard data."""
        cache_key = "analytics:comprehensive_dashboard"

        cached_result = await cache.get(cache_key)
        if cached_result:
            return cached_result

        try:
            # Gather all analytics data
            dashboard_data = {
                "allocation_success": await self.get_allocation_success_rate(),
                "user_engagement": await self.get_user_engagement_metrics(),
                "geographic_distribution": await self.get_geographic_distribution(),
                "sector_analytics": await self.get_sector_analytics(),
                "ml_performance": await self.get_ml_model_performance(),
                "generated_at": datetime.utcnow().isoformat()
            }

            # Cache for 30 minutes
            await cache.set(cache_key, dashboard_data, 1800)
            return dashboard_data

        except Exception as e:
            logger.error(f"Error generating dashboard: {e}")
            return {"error": str(e)}

# Global analytics service instance
analytics_service = AnalyticsService()
