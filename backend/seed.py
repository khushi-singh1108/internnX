import os
import random
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
from mongoengine import connect, get_db

# Ensure environment variables are loaded for MONGO_URI
load_dotenv()

# --- Data Definitions ---

SAMPLE_USERS = [
    {"name": "Alice Johnson", "email": "alice@internx.com", "password": "password123"},
    {"name": "Bob Smith", "email": "bob@internx.com", "password": "password123"},
    {"name": "Charlie Day", "email": "charlie@internx.com", "password": "password123"},
]

SAMPLE_INTERNSHIPS = [
    {
        "title": "Python Backend Developer Intern",
        "company": "TechFusion",
        "location": "Remote",
        "skills_required": ["Python", "Flask", "MongoDB", "REST APIs"],
        "link": "https://techfusion.com/job/1",
    },
    {
        "title": "Data Science Intern (FinTech)",
        "company": "CapVest",
        "location": "New York, NY",
        "skills_required": ["Python", "Pandas", "SQL", "Machine Learning"],
        "link": "https://capvest.com/job/2",
    },
    {
        "title": "Frontend Development Internship",
        "company": "DesignFlow",
        "location": "San Francisco, CA",
        "skills_required": ["React", "JavaScript", "Tailwind CSS", "UX/UI"],
        "link": "https://designflow.com/job/3",
    },
    {
        "title": "Cloud Engineering Intern",
        "company": "CloudNine",
        "location": "Seattle, WA",
        "skills_required": ["AWS", "Docker", "Terraform", "Linux"],
        "link": "https://cloudnine.com/job/4",
    },
]

# --- Seeder Logic ---

def seed_database():
    """Connects to MongoDB, drops collections, and inserts fresh data."""
    
    MONGO_URI = os.getenv('MONGO_URI')
    if not MONGO_URI:
        print("ERROR: MONGO_URI not found in .env file. Cannot connect to database.")
        return

    try:
        # Connect to the database
        connect(host=MONGO_URI)
        print("Connected to MongoDB. Starting seed process...")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return

    # Import models locally after connecting
    from models import User, Internship, Preferences, ResumeAnalysis

    # 1. Clean up existing data (IMPORTANT: Use with caution in production)
    print("1. Cleaning up existing collections...")
    User.drop_collection()
    Internship.drop_collection()
    Preferences.drop_collection()
    ResumeAnalysis.drop_collection()
    print("   Cleanup complete.")

    # 2. Insert Users and create initial Preferences
    print("2. Creating sample users and preferences...")
    for user_data in SAMPLE_USERS:
        # Create User
        user = User(**user_data).save()
        
        # Create initial Preferences linked to the User
        Preferences(
            user=user,
            skills=["Python", "MongoDB", "APIs"] if user.name == "Alice Johnson" else ["React", "JavaScript"],
            interests=["FinTech", "AI/ML"] if user.name == "Alice Johnson" else ["Design", "E-commerce"],
            location="Remote"
        ).save()
        
    print(f"   Successfully created {len(SAMPLE_USERS)} users.")

    # 3. Insert Internships
    print("3. Creating sample internships...")
    for internship_data in SAMPLE_INTERNSHIPS:
        # Add random applicants count and posted date for realistic data
        internship_data['applicants_count'] = random.randint(5, 50)
        days_ago = random.randint(1, 60)
        internship_data['posted_date'] = datetime.utcnow() - timedelta(days=days_ago)
        Internship(**internship_data).save()
        
    print(f"   Successfully created {len(SAMPLE_INTERNSHIPS)} internships.")

    # 4. Create one sample ResumeAnalysis result for Alice, ready for /api/allocation
    try:
        alice = User.objects.get(email='alice@internx.com')
        ResumeAnalysis(
            user=alice,
            raw_text="Alice is a Python expert focused on FinTech integration and data modeling. She has 3 years of experience with Flask and MongoDB.",
            summary="Highly proficient Python developer with strong Mongo/Flask skills and an interest in financial technology.",
            skills_extracted=["Python", "Flask", "MongoDB", "FinTech", "Data Modeling"],
            market_readiness_score=88
        ).save()
        print("   Created sample resume analysis for Alice.")
    except Exception as e:
        print(f"Warning: Could not create Alice's Resume Analysis (User not found/DB error): {e}")


    print("\n✅ Database Seeding Complete!")

if __name__ == '__main__':
    seed_database()
    