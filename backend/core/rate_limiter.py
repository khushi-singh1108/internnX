"""
API Rate Limiting Service for InternnX AI Allocation Engine

Implements rate limiting using Redis to prevent abuse and ensure fair usage.
Supports multiple rate limit strategies and sliding window approach.
"""

import time
import asyncio
from typing import Dict, Optional, Tuple
from dataclasses import dataclass
from core.cache import cache, CACHE_TTL
import logging

logger = logging.getLogger(__name__)

@dataclass
class RateLimitRule:
    """Rate limit configuration for different endpoints."""
    requests_per_minute: int
    requests_per_hour: int = 0
    requests_per_day: int = 0

class RateLimiter:
    """Redis-based rate limiter with sliding window support."""

    def __init__(self):
        self.default_rules = {
            "read": RateLimitRule(100, 1000, 10000),      # General read operations
            "write": RateLimitRule(20, 200, 2000),        # Write operations
            "auth": RateLimitRule(5, 50, 500),            # Authentication endpoints
            "admin": RateLimitRule(50, 500, 5000),        # Admin operations
            "ml": RateLimitRule(10, 100, 1000)            # ML processing endpoints
        }

    def get_rule_for_endpoint(self, endpoint: str, method: str) -> RateLimitRule:
        """Get rate limit rule based on endpoint and HTTP method."""
        # Define endpoint categories
        endpoint_rules = {
            "auth": ["register", "token", "login"],
            "admin": ["internships", "run-allocation"],
            "ml": ["upload-resume", "calculate-match"],
            "read": ["health", "profile", "internships"],
            "write": ["matches"]
        }

        for category, patterns in endpoint_rules.items():
            if any(pattern in endpoint for pattern in patterns):
                return self.default_rules[category]

        return self.default_rules["read"]  # Default fallback

    async def is_rate_limited(
        self,
        user_id: str,
        endpoint: str,
        method: str,
        ip_address: str = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if request should be rate limited.

        Returns:
            (is_limited, rate_limit_info)
        """
        rule = self.get_rule_for_endpoint(endpoint, method)

        # Use user_id as primary identifier, fallback to IP
        identifier = user_id or ip_address or "anonymous"

        # Create time windows
        current_time = int(time.time())
        minute_window = current_time // 60
        hour_window = current_time // 3600
        day_window = current_time // 86400

        # Build cache keys for different time windows
        keys = {
            "minute": f"rate_limit:{identifier}:minute:{minute_window}",
            "hour": f"rate_limit:{identifier}:hour:{hour_window}",
            "day": f"rate_limit:{identifier}:day:{day_window}"
        }

        # Check each time window
        rate_limit_info = {
            "minute_limit": rule.requests_per_minute,
            "hour_limit": rule.requests_per_hour or 0,
            "day_limit": rule.requests_per_day or 0,
            "current_counts": {},
            "reset_times": {}
        }

        for window_name, key in keys.items():
            limit_key = f"{window_name}_limit"
            limit_value = getattr(rule, f"requests_per_{window_name}" if window_name != "day" else "requests_per_day")

            if limit_value > 0:
                # Get current count
                current_count = await cache.get(key) or 0
                rate_limit_info["current_counts"][window_name] = current_count
                rate_limit_info["reset_times"][window_name] = self._get_window_reset_time(window_name)

                # Check if limit exceeded
                if current_count >= limit_value:
                    logger.warning(f"Rate limit exceeded for {identifier} on {window_name} window")
                    return True, rate_limit_info

        # If not rate limited, increment counters
        for window_name, key in keys.items():
            limit_key = f"{window_name}_limit"
            limit_value = getattr(rule, f"requests_per_{window_name}" if window_name != "day" else "requests_per_day")

            if limit_value > 0:
                # Increment counter
                new_count = await cache.increment(key, 1)

                # Set expiration if this is the first request in window
                if new_count == 1:
                    ttl = self._get_window_ttl(window_name)
                    await cache.redis_client.expire(key, ttl)

                rate_limit_info["current_counts"][window_name] = new_count

        return False, rate_limit_info

    def _get_window_ttl(self, window_name: str) -> int:
        """Get TTL for different time windows."""
        ttl_map = {
            "minute": 120,  # 2 minutes (sliding window)
            "hour": 7200,   # 2 hours
            "day": 172800   # 2 days
        }
        return ttl_map.get(window_name, 3600)

    def _get_window_reset_time(self, window_name: str) -> int:
        """Get next reset timestamp for time window."""
        current_time = int(time.time())

        if window_name == "minute":
            return (current_time // 60 + 1) * 60
        elif window_name == "hour":
            return (current_time // 3600 + 1) * 3600
        elif window_name == "day":
            return (current_time // 86400 + 1) * 86400
        else:
            return current_time + 3600

# Global rate limiter instance
rate_limiter = RateLimiter()
