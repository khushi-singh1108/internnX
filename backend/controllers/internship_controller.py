from flask import request, jsonify
from mongoengine.errors import ValidationError, DoesNotExist, OperationError
from bson import ObjectId
from datetime import datetime
import logging

# Import models
from models import User, Preferences, Internship

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def set_user_preferences():
    """
    Endpoint to set or update user preferences including skills, interests, and location.
    
    Request Body (JSON):
        - userId (str): Required. The ID of the user
        - skills (list, optional): List of user skills
        - interests (list, optional): List of user interests
        - location (str, optional): User's preferred location
        
    Returns:
        JSON response with status, message, and updated preferences
    """
    # Validate request data
    if not request.is_json:
        logger.warning("Invalid request: Content-Type must be application/json")
        return jsonify({
            "status": "error",
            "message": "Content-Type must be application/json"
        }), 400
        
    data = request.get_json()
    user_id = data.get('userId')
    
    # Input validation
    if not user_id:
        logger.warning("Missing userId in request")
        return jsonify({
            "status": "error",
            "message": "userId is required for setting preferences.",
            "required_fields": ["userId"],
            "optional_fields": ["skills", "interests", "location"]
        }), 400

    try:
        # Validate user exists and get user object
        try:
            user = User.objects.get(id=ObjectId(user_id))
        except Exception as e:
            logger.error(f"User lookup failed for ID {user_id}: {str(e)}")
            raise DoesNotExist(f"User with ID {user_id} not found")

        # Get existing preferences (created during user registration)
        try:
            preferences = Preferences.objects.get(user=user)
        except DoesNotExist:
            logger.error(f"Preferences not found for user {user_id}")
            raise DoesNotExist("User preferences not found. Please ensure the user is properly registered.")

        # Update fields if provided in the request
        update_fields = []
        
        if 'skills' in data:
            if not isinstance(data['skills'], list):
                return jsonify({
                    "status": "error",
                    "message": "Skills must be a list of strings.",
                    "field": "skills"
                }), 400
            preferences.skills = data['skills']
            update_fields.append('skills')
            
        if 'interests' in data:
            if not isinstance(data['interests'], list):
                return jsonify({
                    "status": "error",
                    "message": "Interests must be a list of strings.",
                    "field": "interests"
                }), 400
            preferences.interests = data['interests']
            update_fields.append('interests')
            
        if 'location' in data:
            if not isinstance(data['location'], str):
                return jsonify({
                    "status": "error",
                    "message": "Location must be a string.",
                    "field": "location"
                }), 400
            preferences.location = data['location']
            update_fields.append('location')
        
        # Only update if there are changes
        if update_fields:
            preferences.updated_at = datetime.utcnow()
            try:
                preferences.save()
                logger.info(f"Successfully updated preferences for user {user_id}. Updated fields: {', '.join(update_fields)}")
            except (ValidationError, OperationError) as e:
                logger.error(f"Failed to save preferences for user {user_id}: {str(e)}")
                raise Exception("Failed to save preferences due to a database error.")
        
        return jsonify({
            "status": "success",
            "message": "Preferences updated successfully.",
            "updated_fields": update_fields,
            "preferences": preferences.to_dict()
        }), 200

    except DoesNotExist as e:
        logger.warning(f"Preferences update failed: {str(e)}")
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 404
        
    except ValidationError as e:
        logger.error(f"Validation error in preferences update: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Invalid data format in request.",
            "details": str(e)
        }), 400
        
    except Exception as e:
        logger.critical(f"Unexpected error in set_user_preferences: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": "An unexpected server error occurred.",
            "request_id": request.headers.get('X-Request-ID', 'none')
        }), 500
