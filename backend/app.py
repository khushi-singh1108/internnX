from flask import Flask, jsonify, request
from config import Config, init_db
import os
from dotenv import load_dotenv

# Import Blueprints (Routes)
from routes.user_routes import user_bp
from routes.internship_routes import internship_bp
from routes.analytics_routes import analytics_bp
from routes.resume_routes import resume_bp
from routes.allocation_routes import allocation_bp

# Load environment variables
load_dotenv()

def create_app():
    """Application factory function: Initializes app, configures DB, and registers routes."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize the MongoDB connection within the app context
    with app.app_context():
        init_db(app)

    # NOTE: Flask-CORS should be initialized here if not handled by middleware
    # Example: CORS(app)

    # --- Register Blueprints (Routes) ---
    app.register_blueprint(user_bp)
    app.register_blueprint(internship_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(allocation_bp)

    # --- Root Route ---
    @app.route('/')
    def home():
        return jsonify({
            "status": "success",
            "message": "InternX Python Backend API is Running!",
            "version": "1.0",
        })

    # --- Error Handling (Custom 404) ---
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "status": "error", 
            "message": "Resource Not Found",
            "details": f"The requested URL {request.url} was not found."
        }), 404

    return app

if __name__ == '__main__':
    app = create_app()
    port = os.getenv('PORT', 5000)
    # The server starts here, using the port defined in .env or defaulting to 5000
    app.run(port=port, debug=app.config['DEBUG'])
