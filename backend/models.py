from mongoengine import Document, StringField, ListField, ReferenceField, DateTimeField, IntField, CASCADE
from datetime import datetime

# --- Utility Functions (for easy JSON serialization) ---

def serialize_document(doc):
    """Converts a MongoEngine document into a Python dictionary."""
    data = doc.to_mongo().to_dict()
    # Convert MongoDB ObjectId to string for JSON compatibility
    data['id'] = str(data.pop('_id'))
    
    # Handle ReferenceFields
    for field_name, field in doc._fields.items():
        if isinstance(field, ReferenceField) and data.get(field_name):
            data[field_name] = str(data[field_name])

    return data


# --- Core Models ---

class Preferences(Document):
    """User preferences used for AI matching and filtering."""
    # CASCADE ensures this is deleted if the User is deleted
    user = ReferenceField('User', required=True, unique=True, reverse_delete_rule=CASCADE) 
    skills = ListField(StringField(), default=list) # Skills the user possesses
    interests = ListField(StringField(), default=list) # Sector interests (e.g., 'FinTech', 'AI/ML')
    location = StringField(default='Remote') # Preferred work location
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'preferences'}
    
    def to_dict(self):
        """Custom dictionary representation for serialization."""
        return {
            "id": str(self.id),
            "user_id": str(self.user.id),
            "skills": self.skills,
            "interests": self.interests,
            "location": self.location,
            "updated_at": self.updated_at.isoformat()
        }


class User(Document):
    """Core user model."""
    name = StringField(required=True)
    email = StringField(required=True, unique=True)
    # NOTE: In a real application, the password should be hashed (e.g., using Flask-Bcrypt)
    password = StringField(required=True)
    
    meta = {'collection': 'users'}
    
    def to_dict(self):
        """Custom dictionary representation for serialization."""
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
        }


class Internship(Document):
    """Internship listing details."""
    title = StringField(required=True)
    company = StringField(required=True)
    location = StringField(required=True)
    skills_required = ListField(StringField(), default=list)
    link = StringField()
    applicants_count = IntField(default=0)
    posted_date = DateTimeField(default=datetime.utcnow)
    
    meta = {'collection': 'internships'}

    def to_dict(self):
        """Custom dictionary representation for serialization."""
        return {
            "id": str(self.id),
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "skills_required": self.skills_required,
            "link": self.link,
            "applicants_count": self.applicants_count,
            "posted_date": self.posted_date.isoformat()
        }


class ResumeAnalysis(Document):
    """Stores the structured output from the Gemini API analysis of a user's resume."""
    # Link to the user, ensure one analysis per user
    user = ReferenceField(User, required=True, unique=True, reverse_delete_rule=CASCADE)
    raw_text = StringField() # The full resume text submitted
    summary = StringField() # AI-generated short summary
    skills_extracted = ListField(StringField(), default=list)
    market_readiness_score = IntField() # Suitability score (1-100)
    analysis_date = DateTimeField(default=datetime.utcnow)
    
    meta = {'collection': 'resume_analysis'}

    def to_dict(self):
        """Custom dictionary representation for serialization."""
        return {
            "id": str(self.id),
            "user_id": str(self.user.id),
            "summary": self.summary,
            "skills_extracted": self.skills_extracted,
            "market_readiness_score": self.market_readiness_score,
            "analysis_date": self.analysis_date.isoformat()
        }