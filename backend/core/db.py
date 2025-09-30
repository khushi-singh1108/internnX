"""
Database Configuration Module

This module handles all database connections and configurations for the InternnX application.
It uses Motor (async MongoDB driver) for non-blocking database operations.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings

# Configuration class that loads settings from environment variables with defaults
class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    
    Attributes:
        MONGO_URI (str): MongoDB connection string with authentication
    """
    MONGO_URI: str = "mongodb://smartuser:smartpassword@localhost:27017/pm_internship_db?authSource=admin"

# Initialize settings
settings = Settings()

class Database:
    """
    Database connection handler for MongoDB using Motor's AsyncIOMotorClient.
    
    This class manages the database connection lifecycle and provides access to collections.
    """
    client: AsyncIOMotorClient = None
    db_name: str = "pm_internship_db"  # Database name matching MONGO_INITDB_DATABASE

    async def connect(self) -> None:
        """
        Establishes a connection to MongoDB.
        
        This method initializes the MongoDB client if it's not already connected.
        It's automatically called during application startup.
        """
        if not self.client:
            self.client = AsyncIOMotorClient(settings.MONGO_URI)
            # Verify connection by pinging the server
            await self.client.admin.command('ping')
            print("✅ Successfully connected to MongoDB!")

    async def close(self) -> None:
        """
        Closes the MongoDB connection.
        
        This method ensures proper cleanup of database connections when the application shuts down.
        """
        if self.client:
            self.client.close()
            self.client = None
            print("🔌 MongoDB connection closed.")

    def get_collection(self, name: str):
        """
        Retrieves a reference to a MongoDB collection.
        
        Args:
            name (str): Name of the collection to retrieve
            
        Returns:
            MotorCollection: Reference to the specified collection
            
        Raises:
            ConnectionError: If the database client is not initialized
        """
        if not self.client:
            raise ConnectionError("❌ MongoDB client is not initialized. Call connect() first.")
        return self.client.get_database(self.db_name)[name]

# Global database instance to be used throughout the application
db = Database()
