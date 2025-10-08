###  Resume Routes (`routes/resume_routes.py`)


from flask import Blueprint
from controllers.resume_controller import analyze_resume

# Blueprint for Resume Analysis endpoints
# Base path: /api/resume
resume_bp = Blueprint('resume', __name__, url_prefix='/api/resume')

# POST /api/resume/analyze
# Submits resume text for Gemini analysis, which extracts structured data and scores.
resume_bp.route('/analyze', methods=['POST'])(analyze_resume)
