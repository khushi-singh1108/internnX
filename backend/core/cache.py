"""
Redis Caching Service for InternnX AI Allocation Engine

Provides high-performance caching for frequently accessed data including:
- User profiles and sessions
- Internship listings
- Match results
- Analytics data
"""

import json
import redis
import asyncio
import logging
from typing import Optional, Any, Dict
from datetime import timedelta
import os

logger = logging.getLogger(__name__)

class RedisCache:
    """Redis caching service with connection pooling and error handling."""

    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.pool = redis.ConnectionPool.from_url(
            self.redis_url,
            max_connections=20,
            retry_on_timeout=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
        self.redis_client = redis.Redis(connection_pool=self.pool)

    async def connect(self):
        """Test Redis connection."""
        try:
            await asyncio.get_event_loop().run_in_executor(
                None, self.redis_client.ping
            )
            logger.info("✅ Connected to Redis successfully")
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            raise

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            value = await asyncio.get_event_loop().run_in_executor(
                None, self.redis_client.get, key
            )
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache GET error for key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, expire_seconds: int = 3600) -> bool:
        """Set value in cache with expiration."""
        try:
            serialized_value = json.dumps(value, default=str)
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                self.redis_client.setex,
                key,
                expire_seconds,
                serialized_value
            )
            return bool(result)
        except Exception as e:
            logger.error(f"Cache SET error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                None, self.redis_client.delete, key
            )
            return bool(result)
        except Exception as e:
            logger.error(f"Cache DELETE error for key {key}: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                None, self.redis_client.exists, key
            )
            return bool(result)
        except Exception as e:
            logger.error(f"Cache EXISTS error for key {key}: {e}")
            return False

    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment counter in cache."""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                None, self.redis_client.incr, key, amount
            )
            return result
        except Exception as e:
            logger.error(f"Cache INCR error for key {key}: {e}")
            return 0

    def generate_key(self, prefix: str, identifier: str) -> str:
        """Generate standardized cache key."""
        return f"{prefix}:{identifier}"

# Global cache instance
cache = RedisCache()

# Cache key constants
CACHE_KEYS = {
    "user_profile": "user_profile",
    "internship_list": "internship_list",
    "match_results": "match_results",
    "analytics": "analytics",
    "rate_limit": "rate_limit"
}

# Cache TTL constants (in seconds)
CACHE_TTL = {
    "user_profile": 1800,      # 30 minutes
    "internship_list": 900,    # 15 minutes
    "match_results": 600,      # 10 minutes
    "analytics": 3600,         # 1 hour
    "rate_limit": 60           # 1 minute
}
