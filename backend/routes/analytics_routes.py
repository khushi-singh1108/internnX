from flask import Blueprint
from controllers.analytics_controller import get_analytics

# Blueprint for system analytics and aggregated data
# Base path: /api/analytics
analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

# GET /api/analytics
# Returns general system metrics (e.g., total users, top skills, internship count).
analytics_bp.route('/', methods=['GET'])(get_analytics)

