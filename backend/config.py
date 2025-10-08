from flask import Flask
from mongoengine import connect
from dotenv import load_dotenv
import os

# 1. Load environment variables from .env file
load_dotenv()

def create_app():
    """Initializes and configures the Flask application."""
    app = Flask(__name__)
    
    # 2. Flask configuration (Can be expanded later, e.g., secret key)
    # app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key') 
    
    # 3. Connect to MongoDB Atlas
    # The MONGO_URI is read from the .env file.
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        print("FATAL ERROR: MONGO_URI not found in environment variables.")
    else:
        try:
            connect(host=mongo_uri)
            print("MongoDB Connected successfully.")
        except Exception as e:
            print(f"MongoDB connection failed: {e}")

    return app

# The function is called in app.py to start the application.
