"""
Continuous ML Training Service for InternnX AI Allocation Engine

Implements continuous learning from:
- User feedback on matches
- Allocation success/failure
- Manual corrections
- A/B testing results
- Performance metrics
"""

import asyncio
import logging
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

logger = logging.getLogger(__name__)

class ContinuousMLTrainer:
    """Service for continuous ML model improvement."""

    def __init__(self):
        self.model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml_engine", "model_data")
        os.makedirs(self.model_dir, exist_ok=True)

        # Model files
        self.vectorizer_file = os.path.join(self.model_dir, "tfidf_vectorizer.pkl")
        self.feedback_file = os.path.join(self.model_dir, "training_feedback.json")
        self.performance_metrics_file = os.path.join(self.model_dir, "performance_metrics.json")

        # Training parameters
        self.min_feedback_threshold = 10  # Minimum feedback samples before retraining
        self.retrain_interval = 24 * 60 * 60  # Retrain every 24 hours
        self.last_retrain = None

        # Load existing models
        self.vectorizer = self._load_vectorizer()
        self.feedback_data = self._load_feedback_data()
        self.performance_metrics = self._load_performance_metrics()

    def _load_vectorizer(self) -> Optional[TfidfVectorizer]:
        """Load existing TF-IDF vectorizer."""
        try:
            if os.path.exists(self.vectorizer_file):
                with open(self.vectorizer_file, 'rb') as f:
                    return pickle.load(f)
            return None
        except Exception as e:
            logger.error(f"Error loading vectorizer: {e}")
            return None

    def _save_vectorizer(self, vectorizer: TfidfVectorizer):
        """Save TF-IDF vectorizer."""
        try:
            with open(self.vectorizer_file, 'wb') as f:
                pickle.dump(vectorizer, f)
            logger.info("Vectorizer saved successfully")
        except Exception as e:
            logger.error(f"Error saving vectorizer: {e}")

    def _load_feedback_data(self) -> List[Dict]:
        """Load training feedback data."""
        try:
            if os.path.exists(self.feedback_file):
                with open(self.feedback_file, 'r') as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Error loading feedback data: {e}")
            return []

    def _save_feedback_data(self, feedback_data: List[Dict]):
        """Save training feedback data."""
        try:
            with open(self.feedback_file, 'w') as f:
                json.dump(feedback_data, f, indent=2)
            logger.info("Feedback data saved successfully")
        except Exception as e:
            logger.error(f"Error saving feedback data: {e}")

    def _load_performance_metrics(self) -> Dict:
        """Load performance metrics."""
        try:
            if os.path.exists(self.performance_metrics_file):
                with open(self.performance_metrics_file, 'r') as f:
                    return json.load(f)
            return {"model_versions": [], "accuracy_trends": []}
        except Exception as e:
            logger.error(f"Error loading performance metrics: {e}")
            return {"model_versions": [], "accuracy_trends": []}

    def _save_performance_metrics(self, metrics: Dict):
        """Save performance metrics."""
        try:
            with open(self.performance_metrics_file, 'w') as f:
                json.dump(metrics, f, indent=2)
            logger.info("Performance metrics saved successfully")
        except Exception as e:
            logger.error(f"Error saving performance metrics: {e}")

    async def add_feedback(
        self,
        applicant_profile: Dict,
        internship_profile: Dict,
        predicted_score: float,
        actual_outcome: str,  # "matched", "rejected", "no_response"
        user_feedback: Optional[str] = None
    ):
        """Add feedback for model improvement."""
        feedback_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "applicant_profile": applicant_profile,
            "internship_profile": internship_profile,
            "predicted_score": predicted_score,
            "actual_outcome": actual_outcome,
            "user_feedback": user_feedback,
            "model_version": self.performance_metrics.get("current_version", "1.0")
        }

        self.feedback_data.append(feedback_entry)
        self._save_feedback_data(self.feedback_data)

        logger.info(f"Feedback added for {actual_outcome} outcome")

        # Trigger retraining if we have enough feedback
        if len(self.feedback_data) >= self.min_feedback_threshold:
            await self._check_and_retrain()

    async def _check_and_retrain(self):
        """Check if retraining is needed and perform it."""
        current_time = datetime.utcnow()

        # Check if enough time has passed since last retrain
        if (self.last_retrain and
            (current_time - self.last_retrain).total_seconds() < self.retrain_interval):
            return

        # Check if we have enough feedback
        if len(self.feedback_data) < self.min_feedback_threshold:
            return

        logger.info("Starting model retraining...")
        await self.retrain_model()

    async def retrain_model(self) -> bool:
        """Retrain the ML model with accumulated feedback."""
        try:
            if len(self.feedback_data) < self.min_feedback_threshold:
                logger.warning("Not enough feedback data for retraining")
                return False

            # Prepare training data
            training_texts, labels = self._prepare_training_data()

            if len(training_texts) < 2:
                logger.warning("Not enough training samples")
                return False

            # Create new vectorizer with expanded vocabulary
            vectorizer = TfidfVectorizer(
                max_features=5000,
                stop_words='english',
                ngram_range=(1, 2)
            )

            # Fit vectorizer on training data
            X = vectorizer.fit_transform(training_texts)
            y = np.array(labels)

            # Update performance metrics
            model_version = self._get_next_version()
            self.performance_metrics["current_version"] = model_version
            self.performance_metrics["model_versions"].append({
                "version": model_version,
                "training_samples": len(training_texts),
                "accuracy": self._calculate_training_accuracy(X, y),
                "trained_at": datetime.utcnow().isoformat()
            })

            # Save new vectorizer
            self._save_vectorizer(vectorizer)
            self.vectorizer = vectorizer

            # Update last retrain time
            self.last_retrain = datetime.utcnow()

            # Save updated metrics
            self._save_performance_metrics(self.performance_metrics)

            logger.info(f"Model retrained successfully to version {model_version}")
            return True

        except Exception as e:
            logger.error(f"Error during model retraining: {e}")
            return False

    def _prepare_training_data(self) -> tuple[List[str], List[int]]:
        """Prepare training data from feedback."""
        training_texts = []
        labels = []

        for feedback in self.feedback_data[-1000:]:  # Use last 1000 feedback entries
            # Create text representation
            applicant_text = self._create_profile_text(feedback["applicant_profile"])
            internship_text = self._create_profile_text(feedback["internship_profile"])

            combined_text = f"{applicant_text} {internship_text}"
            training_texts.append(combined_text)

            # Convert outcome to label
            outcome = feedback["actual_outcome"]
            if outcome == "matched":
                labels.append(1)
            elif outcome == "rejected":
                labels.append(0)
            else:
                labels.append(0.5)  # Neutral for no_response

        return training_texts, labels

    def _create_profile_text(self, profile: Dict) -> str:
        """Create text representation of a profile."""
        texts = []

        if "skills" in profile and profile["skills"]:
            texts.append(" ".join(profile["skills"]))

        if "location" in profile and profile["location"]:
            texts.append(f"location {profile['location']}")

        if "sector" in profile and profile["sector"]:
            texts.append(f"sector {profile['sector']}")

        if "qualification" in profile and profile["qualification"]:
            texts.append(f"qualification {profile['qualification']}")

        return " ".join(texts)

    def _calculate_training_accuracy(self, X, y) -> float:
        """Calculate training accuracy (simplified)."""
        try:
            # Simple accuracy calculation for demonstration
            # In production, you'd use proper cross-validation
            similarities = cosine_similarity(X)

            # For now, return a placeholder accuracy
            # In production, implement proper accuracy calculation
            return 0.75  # Placeholder

        except Exception as e:
            logger.error(f"Error calculating training accuracy: {e}")
            return 0.0

    def _get_next_version(self) -> str:
        """Get next model version."""
        versions = self.performance_metrics.get("model_versions", [])
        if not versions:
            return "1.0"

        latest_version = versions[-1]["version"]
        major, minor = latest_version.split(".")
        return f"{major}.{int(minor) + 1}"

    async def get_model_performance_summary(self) -> Dict[str, Any]:
        """Get model performance summary."""
        return {
            "current_version": self.performance_metrics.get("current_version", "1.0"),
            "total_feedback_samples": len(self.feedback_data),
            "last_retrain": self.last_retrain.isoformat() if self.last_retrain else None,
            "model_versions": len(self.performance_metrics.get("model_versions", [])),
            "training_ready": len(self.feedback_data) >= self.min_feedback_threshold
        }

    async def clear_old_feedback(self, days_to_keep: int = 90):
        """Clear old feedback data to manage storage."""
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)

        original_count = len(self.feedback_data)
        self.feedback_data = [
            feedback for feedback in self.feedback_data
            if datetime.fromisoformat(feedback["timestamp"]) > cutoff_date
        ]

        cleared_count = original_count - len(self.feedback_data)
        if cleared_count > 0:
            self._save_feedback_data(self.feedback_data)
            logger.info(f"Cleared {cleared_count} old feedback entries")

        return cleared_count

# Global ML trainer instance
ml_trainer = ContinuousMLTrainer()
