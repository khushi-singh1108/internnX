from flask import request, jsonify
from mongoengine.errors import NotUniqueError, ValidationError, DoesNotExist
from models import User, Preferences
import logging

logging.basicConfig(level=logging.INFO)

def register_user():
    """
    Handles user registration. Requires name, email, and password.
    Automatically creates a corresponding Preferences document.
    """
    data = request.get_json()
    if not data or not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({"status": "error", "message": "Missing required fields: name, email, and password."}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    try:
        # 1. Create the User
        user = User(name=name, email=email, password=password)
        user.save()

        # 2. Create the initial Preferences document
        preferences = Preferences(user=user)
        preferences.save()
        
        # NOTE: In a real app, preferences reference would be saved on User model here,
        # but MongoEngine ReferenceField is typically managed implicitly or later.

        logging.info(f"User registered successfully: {email}")
        
        return jsonify({
            "status": "success",
            "message": "User registered and preferences initiated.",
            "user_id": str(user.id),
            "email": user.email
        }), 201

    except NotUniqueError:
        logging.error(f"Registration failed: Email {email} already exists.")
        return jsonify({"status": "error", "message": "User with this email already exists."}), 409
    except ValidationError as e:
        logging.error(f"Validation Error during registration: {e}")
        return jsonify({"status": "error", "message": f"Validation failed: {e}"}), 400
    except Exception as e:
        logging.error(f"Unexpected error during registration: {e}", exc_info=True)
        return jsonify({"status": "error", "message": "An unexpected server error occurred."}), 500
