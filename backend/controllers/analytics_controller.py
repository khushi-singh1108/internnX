from flask import jsonify
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)

def get_analytics():
    """
    Returns dummy analytics data. 
    In a real app, this would perform complex aggregation queries on MongoDB.
    GET /api/analytics
    """
    try:
        # Dummy data simulating aggregation
        analytics_data = {
            "system_overview": {
                "total_users": 1540,
                "total_active_listings": 85,
                "total_applications_tracked": 7890
            },
            "top_skills_required": [
                {"skill": "Python", "count": 350},
                {"skill": "SQL", "count": 280},
                {"skill": "React", "count": 150},
                {"skill": "AWS", "count": 110}
            ],
            "sector_distribution": {
                "FinTech": 45, "HealthTech": 30, "E-commerce": 25, "AI/ML": 15
            },
            "data_retrieved_at": datetime.utcnow().isoformat()
        }
        
        return jsonify({"status": "success", "data": analytics_data}), 200

    except Exception as e:
        logging.error(f"Error generating analytics data: {e}", exc_info=True)
        return jsonify({"status": "error", "message": "Failed to retrieve system analytics."}), 500
