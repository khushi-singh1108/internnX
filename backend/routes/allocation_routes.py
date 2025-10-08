from flask import Blueprint
from controllers.allocation_controller import get_recommendations

# Blueprint for the AI Allocation Assistant endpoints
# Base path: /api/allocation
allocation_bp = Blueprint('allocation', __name__, url_prefix='/api/allocation')

# POST /api/allocation/recommend
# Triggers the Gemini API to provide personalized internship recommendations,
# suitability scores, and interview preparation questions.
allocation_bp.route('/recommend', methods=['POST'])(get_recommendations)
