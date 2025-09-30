# ml_engine/preprocessor.py
import spacy
import re
from typing import Dict, List, Any
from io import BytesIO
from docx import Document
from pypdf import PdfReader
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load the NLP model once
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("spaCy model loaded successfully")
except OSError:
    logger.error("spaCy model 'en_core_web_sm' not found. Please run 'python -m spacy download en_core_web_sm'")
    nlp = None

# Configuration: Lists of keywords for rule-based extraction
SKILL_KEYWORDS = [
    "Python", "MongoDB", "FastAPI", "SQL", "React", "JavaScript", "AWS", 
    "Machine Learning", "NLP", "Data Analysis", "Project Management", 
    "Marketing", "Finance", "Design", "Figma", "TensorFlow", "scikit-learn"
]

QUALIFICATION_KEYWORDS = ["B.Tech", "M.Tech", "B.Sc", "M.Sc", "MBA", "PhD", "BE"]
SECTOR_KEYWORDS = ["Technology", "Analytics", "Finance", "Marketing", "Design"]

def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extracts text from PDF or DOCX file content."""
    try:
        text = ""
        file_extension = os.path.splitext(filename)[1].lower()

        if file_extension == '.pdf':
            reader = PdfReader(BytesIO(file_content))
            for page in reader.pages:
                text += page.extract_text() or ""
                
        elif file_extension == '.docx':
            document = Document(BytesIO(file_content))
            for para in document.paragraphs:
                text += para.text + "\n"
                
        elif file_extension == '.txt':
            text = file_content.decode('utf-8', errors='ignore')
            
        else:
            raise ValueError("Unsupported file format. Please upload PDF, DOCX, or TXT.")
            
        return text.strip()
        
    except Exception as e:
        raise ValueError(f"Error processing file: {str(e)}")

def parse_resume_text(resume_text: str) -> Dict[str, Any]:
    """Parses raw resume text to extract structured data using NLP and rules."""
    if not nlp:
        return {"error": "NLP model failed to load. Cannot parse resume."}

    if not resume_text or not isinstance(resume_text, str):
        return {"error": "Invalid resume text provided"}

    try:
        doc = nlp(resume_text.lower())

        # 1. Skill Extraction
        found_skills = set()
        for token in doc:
            if token.text.lower() in [s.lower() for s in SKILL_KEYWORDS]:
                found_skills.add(token.text.title())

        # 2. Location Extraction
        location = "Unknown"
        for ent in doc.ents:
            if ent.label_ in ["GPE", "LOC"]:
                location = ent.text.title()
                break

        # 3. Qualification Extraction
        qualification = "Not Specified"
        for qual in QUALIFICATION_KEYWORDS:
            if qual.lower() in doc.text:
                qualification = qual
                break

        # 4. AA Category
        aa_category = "None"
        if re.search(r'\b(rural|village|aspirational)\b', doc.text):
            aa_category = "Aspirational District"

        return {
            "skills": list(found_skills),
            "location": location,
            "qualification": qualification,
            "aa_category": aa_category,
            "past_participation": False,
        }

    except Exception as e:
        logger.error(f"Error parsing resume text: {str(e)}")
        return {"error": f"Failed to parse resume: {str(e)}"}