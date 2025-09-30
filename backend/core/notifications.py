"""
Email Notification Service for InternnX AI Allocation Engine

Sends automated email notifications for:
- Match notifications
- Allocation confirmations
- Application status updates
- System alerts
"""

import asyncio
import logging
from typing import Dict, List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from datetime import datetime
import os
import json

logger = logging.getLogger(__name__)

class EmailNotificationService:
    """Email notification service with HTML template support."""

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@internnx.com")
        self.from_name = "InternnX AI Allocation Engine"

        # Email templates
        self.templates = {
            "match_notification": self._get_match_notification_template(),
            "allocation_confirmation": self._get_allocation_confirmation_template(),
            "welcome": self._get_welcome_template()
        }

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email with HTML and optional text content."""
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email
            msg["Subject"] = subject
            msg["Date"] = datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S UTC")

            # Add text content if provided
            if text_content:
                msg.attach(MIMEText(text_content, "plain"))

            # Add HTML content
            msg.attach(MIMEText(html_content, "html"))

            # Send email
            await aiosmtplib.send(
                msg,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_username,
                password=self.smtp_password,
                use_tls=True
            )

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    async def send_match_notification(
        self,
        user_email: str,
        user_name: str,
        matches: List[Dict]
    ) -> bool:
        """Send match notification email."""
        if not matches:
            return True

        # Prepare match data for template
        top_matches = matches[:3]  # Show top 3 matches

        template_data = {
            "user_name": user_name,
            "matches_count": len(matches),
            "top_matches": top_matches,
            "total_matches": len(matches)
        }

        html_content = self._render_template("match_notification", template_data)
        subject = f"Great News! You have {len(matches)} internship matches"

        return await self.send_email(user_email, subject, html_content)

    async def send_allocation_confirmation(
        self,
        user_email: str,
        user_name: str,
        allocation: Dict
    ) -> bool:
        """Send allocation confirmation email."""
        template_data = {
            "user_name": user_name,
            "internship_title": allocation.get("title", "Unknown Position"),
            "company_name": allocation.get("company_id", "Unknown Company"),
            "location": allocation.get("location", "TBD"),
            "start_date": allocation.get("start_date", "TBD"),
            "contact_email": allocation.get("contact_email", "hr@company.com")
        }

        html_content = self._render_template("allocation_confirmation", template_data)
        subject = f"🎉 Congratulations! You've been allocated to {allocation.get('title', 'an internship')}"

        return await self.send_email(user_email, subject, html_content)

    async def send_welcome_email(
        self,
        user_email: str,
        user_name: str,
        activation_link: Optional[str] = None
    ) -> bool:
        """Send welcome email to new users."""
        template_data = {
            "user_name": user_name,
            "activation_link": activation_link,
            "current_year": datetime.now().year
        }

        html_content = self._render_template("welcome", template_data)
        subject = "Welcome to InternnX AI Allocation Engine!"

        return await self.send_email(user_email, subject, html_content)

    def _render_template(self, template_name: str, data: Dict) -> str:
        """Render email template with provided data."""
        template = self.templates.get(template_name)
        if not template:
            return f"Template {template_name} not found"

        try:
            return template.format(**data)
        except Exception as e:
            logger.error(f"Template rendering error: {e}")
            return f"Error rendering template: {e}"

    def _get_match_notification_template(self) -> str:
        """Match notification email template."""
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Internship Matches Found!</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                .match-card {{ border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }}
                .score {{ font-weight: bold; color: #4CAF50; }}
                .footer {{ margin-top: 30px; padding: 20px; background-color: #f5f5f5; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎯 Great News, {user_name}!</h1>
                    <p>You have {matches_count} internship matches waiting for you!</p>
                </div>

                <h2>Your Top Matches:</h2>
                {top_matches_html}

                <p><strong>Total Matches:</strong> {total_matches}</p>
                <p>Log in to your dashboard to view all matches and apply!</p>

                <div class="footer">
                    <p>This is an automated notification from InternnX AI Allocation Engine.</p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _get_allocation_confirmation_template(self) -> str:
        """Allocation confirmation email template."""
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Allocation Confirmed!</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2196F3; color: white; padding: 20px; text-align: center; }}
                .success-card {{ background-color: #f8f9fa; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; }}
                .details {{ background-color: #fff; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                .footer {{ margin-top: 30px; padding: 20px; background-color: #f5f5f5; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Congratulations, {user_name}!</h1>
                </div>

                <div class="success-card">
                    <h2>You're Allocated!</h2>
                    <p>You've been successfully allocated to the following internship opportunity:</p>
                </div>

                <div class="details">
                    <h3>Internship Details:</h3>
                    <p><strong>Position:</strong> {internship_title}</p>
                    <p><strong>Company:</strong> {company_name}</p>
                    <p><strong>Location:</strong> {location}</p>
                    <p><strong>Start Date:</strong> {start_date}</p>
                    <p><strong>Contact:</strong> {contact_email}</p>
                </div>

                <p>Please check your email for further instructions and next steps from the company.</p>

                <div class="footer">
                    <p>Congratulations on your achievement!</p>
                    <p>InternnX AI Allocation Engine - Connecting talent with opportunity.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def _get_welcome_template(self) -> str:
        """Welcome email template."""
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Welcome to InternnX!</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #FF9800; color: white; padding: 20px; text-align: center; }}
                .welcome-card {{ background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; }}
                .cta-button {{ display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
                .footer {{ margin-top: 30px; padding: 20px; background-color: #f5f5f5; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to InternnX, {user_name}!</h1>
                </div>

                <div class="welcome-card">
                    <h2>Your AI-Powered Internship Journey Begins</h2>
                    <p>Thank you for joining InternnX AI Allocation Engine. We're excited to help you find the perfect internship opportunity using our advanced matching algorithm.</p>

                    <p><strong>What happens next?</strong></p>
                    <ul>
                        <li>Upload your resume to get personalized matches</li>
                        <li>Browse available internship opportunities</li>
                        <li>Get matched with opportunities that fit your skills and preferences</li>
                        <li>Receive notifications when new matches become available</li>
                    </ul>

                    {activation_link_html}
                </div>

                <div class="footer">
                    <p>Welcome aboard! 🚀</p>
                    <p>InternnX AI Allocation Engine - {current_year}</p>
                </div>
            </div>
        </body>
        </html>
        """

# Global email service instance
email_service = EmailNotificationService()
