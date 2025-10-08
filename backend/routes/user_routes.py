from flask import Blueprint
from controllers.user_controller import register_user

# Blueprint for User endpoints (Authentication and Profile creation)
# Base path: /api/users
user_bp = Blueprint('user', __name__, url_prefix='/api/users')

# POST /api/users/register
# Registers a new user and automatically creates a default Preferences document.
user_bp.route('/register', methods=['POST'])(register_user)

# NOTE: In a production app, you would add /login and /profile routes here.

