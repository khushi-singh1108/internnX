from flask import Blueprint
from controllers.internship_controller import (
    create_internship,
    get_all_internships,
    set_user_preferences
)

# Blueprint for Internship Listings and User Preferences
# Base path: /api/internships
internship_bp = Blueprint('internship', __name__, url_prefix='/api/internships')

# GET /api/internships
# Retrieves a list of all available internships.
internship_bp.route('/', methods=['GET'])(get_all_internships)

# POST /api/internships
# Admin/Manual endpoint to create a new internship listing.
internship_bp.route('/', methods=['POST'])(create_internship)

# POST /api/internships/preferences
# Sets or updates the user's skills, interests, and location preferences.
internship_bp.route('/preferences', methods=['POST'])(set_user_preferences)
