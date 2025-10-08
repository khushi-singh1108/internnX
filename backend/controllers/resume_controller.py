from flask import request, jsonify
from mongoengine.errors import DoesNotExist, ValidationError
from models import User, ResumeAnalysis
import requests
import json
import os
import logging
from bson.objectid import ObjectId

logging.basicConfig(level=logging.INFO)

# Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent"

# JSON Schema for Structured Output
RESUME_ANALYSIS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {"type": "STRING", "description": "A 2-3 sentence professional summary."},
        "skills_extracted": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "List of technical and soft skills."},
        "market_readiness_score": {"type": "INTEGER", "description": "Score from 1 to 100 for overall market readiness."},
    },
    "required": ["summary", "skills_extracted", "market_readiness_score"],
}


def analyze_resume():
    """
    POST /api/resume/analyze: Sends resume text to the Gemini API for analysis.
    Stores the structured result in the ResumeAnalysis collection.
    """
    data = request.get_json()
    user_id = data.get('userId')
    resume_text = data.get('resumeText')

    if not all([user_id, resume_text]):
        return jsonify({"status": "error", "message": "Missing required fields: userId and resumeText."}), 400
    if not GEMINI_API_KEY:
        return jsonify({"status": "error", "message": "Server configuration error: Gemini API Key missing."}), 500

    try:
        # 1. Verify User Exists
        user = User.objects.get(id=ObjectId(user_id))
    except DoesNotExist:
        return jsonify({"status": "error", "message": f"User with ID {user_id} not found."}), 404
    except Exception:
        return jsonify({"status": "error", "message": "Invalid user ID format."}), 400

    # 2. Construct Gemini API Request Payload
    system_prompt = (
        "You are a professional resume analyst for an internship allocation platform. "
        "Extract critical information, generate a summary, and calculate a market readiness score. "
        "You MUST respond ONLY with the requested JSON schema."
    )
    prompt = f"Analyze the following resume text:\n\n---\n{resume_text}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": RESUME_ANALYSIS_SCHEMA,
        }
    }

    headers = {'Content-Type': 'application/json'}
    
    # 3. Call Gemini API
    try:
        response = requests.post(f"{GEMINI_API_URL}?key={GEMINI_API_KEY}", 
                                 headers=headers, 
                                 data=json.dumps(payload))
        response.raise_for_status()
        
        gemini_result = response.json()
        
        # Safely extract the structured JSON string and parse it
        json_string = gemini_result['candidates'][0]['content']['parts'][0]['text']
        analysis_data = json.loads(json_string)

    except requests.exceptions.RequestException as e:
        logging.error(f"Gemini API Request Failed: {e.response.status_code if e.response else 'No Response'}")
        return jsonify({"status": "error", "message": "Failed to communicate with the Gemini API."}), 503
    except Exception as e:
        logging.error(f"Error processing Gemini response: {e}")
        return jsonify({"status": "error", "message": "Failed to parse AI response."}), 500

    # 4. Save Analysis Result to MongoDB (upsert/replace existing)
    try:
        # Use modify(upsert=True) to either create a new document or update the existing one for this user
        analysis = ResumeAnalysis.objects(user=user).modify(
            upsert=True,
            new=True,
            set__raw_text=resume_text,
            set__summary=analysis_data.get('summary'),
            set__skills_extracted=analysis_data.get('skills_extracted'),
            set__market_readiness_score=analysis_data.get('market_readiness_score')
        )

        logging.info(f"Resume analysis saved/updated for user: {user_id}")
        return jsonify({
            "status": "success",
            "message": "Resume analyzed and saved.",
            "analysis": analysis.to_dict()
        }), 201

    except Exception as e:
        logging.error(f"Unexpected error saving analysis: {e}", exc_info=True)
        return jsonify({"status": "error", "message": "An unexpected server error occurred during save."}), 500
