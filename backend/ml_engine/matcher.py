# ml_engine/matcher.py
import os
import joblib
import numpy as np
from typing import Dict, List, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model_data")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
CORPUS_PATH = os.path.join(MODEL_DIR, "training_corpus.txt")

# Create model directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

# Matching weights configuration
MATCHING_WEIGHTS = {
    "skill_match": 0.60,
    "location_match": 0.20,
    "sector_match": 0.10,
    "qualification_match": 0.10,
}

FAIRNESS_BOOSTS = {
    "Aspirational District": 1.15,
    "Rural": 1.10,
    "None": 1.0,
}

class MatchEngine:
    def __init__(self):
        self.vectorizer = self._load_or_train_vectorizer()
        
    def _load_or_train_vectorizer(self) -> TfidfVectorizer:
        """Load a pre-trained vectorizer or train a new one."""
        try:
            if os.path.exists(VECTORIZER_PATH):
                vectorizer = joblib.load(VECTORIZER_PATH)
                logger.info("Loaded existing TF-IDF vectorizer")
                return vectorizer
                
            # If no vectorizer exists, train a new one
            corpus = self._load_training_corpus()
            if not corpus:
                logger.warning("No training corpus found. Initializing empty vectorizer.")
                return TfidfVectorizer()
                
            vectorizer = TfidfVectorizer()
            vectorizer.fit(corpus)
            joblib.dump(vectorizer, VECTORIZER_PATH)
            logger.info("Trained and saved new TF-IDF vectorizer")
            return vectorizer
            
        except Exception as e:
            logger.error(f"Error loading/training vectorizer: {str(e)}")
            return TfidfVectorizer()
            
    def _load_training_corpus(self) -> List[str]:
        """Load the training corpus for the vectorizer."""
        try:
            if os.path.exists(CORPUS_PATH):
                with open(CORPUS_PATH, 'r', encoding='utf-8') as f:
                    return [line.strip() for line in f if line.strip()]
            return []
        except Exception as e:
            logger.error(f"Error loading training corpus: {str(e)}")
            return []
            
    def calculate_skill_match(
        self, 
        applicant_skills: List[str], 
        required_skills: List[str]
    ) -> float:
        """Calculate skill match score using TF-IDF and cosine similarity."""
        if not applicant_skills or not required_skills:
            return 0.0
            
        try:
            # Convert skill lists to strings
            app_text = " ".join(applicant_skills)
            req_text = " ".join(required_skills)
            
            # Transform to vectors
            vectors = self.vectorizer.transform([app_text, req_text])
            
            # Calculate cosine similarity
            return float(cosine_similarity(vectors[0:1], vectors[1:2])[0][0])
            
        except Exception as e:
            logger.error(f"Error calculating skill match: {str(e)}")
            return 0.0
            
    def calculate_match_score(
        self,
        applicant: Dict[str, Any],
        opportunity: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate the final match score between an applicant and an opportunity.
        
        Args:
            applicant: Dictionary containing applicant details
            opportunity: Dictionary containing opportunity details
            
        Returns:
            Dictionary containing match score and reasoning
        """
        try:
            # 1. Calculate component scores
            skill_score = self.calculate_skill_match(
                applicant.get("skills", []),
                opportunity.get("required_skills", [])
            )
            
            location_score = 1.0 if (
                applicant.get("location") and 
                opportunity.get("location") and
                applicant["location"].lower() == opportunity["location"].lower()
            ) else 0.0
            
            sector_score = 1.0 if (
                applicant.get("sector_interests") and 
                opportunity.get("sector") and
                opportunity["sector"] in applicant["sector_interests"]
            ) else 0.0
            
            qualification_score = 1.0  # Assume basic qualification is met
            
            # 2. Calculate weighted sum
            weighted_score = (
                MATCHING_WEIGHTS["skill_match"] * skill_score +
                MATCHING_WEIGHTS["location_match"] * location_score +
                MATCHING_WEIGHTS["sector_match"] * sector_score +
                MATCHING_WEIGHTS["qualification_match"] * qualification_score
            )
            
            # 3. Apply fairness boost
            aa_category = applicant.get("aa_category", "None")
            fairness_boost = FAIRNESS_BOOSTS.get(aa_category, 1.0)
            final_score = min(1.0, weighted_score * fairness_boost)
            
            # 4. Generate explanation
            explanation = (
                f"Skill Match: {skill_score:.2f} (Weighted: {skill_score * MATCHING_WEIGHTS['skill_match']:.2f}). "
                f"Location Match: {location_score:.2f}. "
                f"Sector Match: {sector_score:.2f}. "
                f"Fairness Boost Applied: {fairness_boost:.2f}x (Category: {aa_category})."
            )
            
            return {
                "final_score": final_score,
                "components": {
                    "skill": skill_score,
                    "location": location_score,
                    "sector": sector_score,
                    "qualification": qualification_score,
                    "fairness_boost": fairness_boost
                },
                "explanation": explanation
            }
            
        except Exception as e:
            logger.error(f"Error calculating match score: {str(e)}")
            raise ValueError(f"Failed to calculate match score: {str(e)}")

# Singleton instance
match_engine = MatchEngine()
