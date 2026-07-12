#!/usr/bin/env python3
"""
Social Media Cross-Posting Script
Posts blog entries to Instagram, Facebook, and Telegram

Usage: python3 social_media_poster.py '{"title": "...", "excerpt": "...", ...}'
"""

import os
import sys
import json
import requests
from typing import Dict

# ==================== CONFIGURATION ====================
# API Keys loaded from environment variables for security
INSTAGRAM_ACCESS_TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "")
INSTAGRAM_ACCOUNT_ID = os.environ.get("INSTAGRAM_ACCOUNT_ID", "")

FACEBOOK_ACCESS_TOKEN = os.environ.get("FACEBOOK_ACCESS_TOKEN", "")
FACEBOOK_PAGE_ID = os.environ.get("FACEBOOK_PAGE_ID", "")

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

# API Endpoints
INSTAGRAM_API = "https://graph.facebook.com/v18.0"
FACEBOOK_API = "https://graph.facebook.com/v18.0"


def get_telegram_api():
    """Get Telegram API base URL"""
    return f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"


class SocialMediaPoster:
    """Handles cross-posting to multiple social media platforms"""

    def __init__(self, post_data: Dict):
        self.post_data = post_data
        self.results = {
            "instagram": {"success": False, "post_id": None, "error": None},
            "facebook": {"success": False, "post_id": None, "error": None},
            "telegram": {"success": False, "message_id": None, "error": None}
        }

    def post_to_instagram(self) -> Dict:
        """Post to Instagram using Graph API (requires Business/Creator account)"""
        if not INSTAGRAM_ACCESS_TOKEN or not INSTAGRAM_ACCOUNT_ID:
            self.results["instagram"]["error"] = "Instagram credentials not configured"
            return self.results["instagram"]

        try:
            title = self.post_data.get("title", "")
            excerpt = self.post_data.get("excerpt", "")
            tags = self.post_data.get("tags", [])
            image_url = self.post_data.get("image")
            video_url = self.post_data.get("video")
            media_type = self.post_data.get("mediaType", "text")

            # Format caption with hashtags
            hashtags = " ".join([f"#{tag.replace(' ', '').replace('-', '')}" for tag in tags if tag])
            caption = f"{title}\n\n{excerpt}\n\n{hashtags}"[:2200]  # Instagram limit

            # Determine if it's image or video
            if media_type == "video" and video_url:
                # Step 1: Create video container
                container_response = requests.post(
                    f"{INSTAGRAM_API}/{INSTAGRAM_ACCOUNT_ID}/media",
                    params={
                        "access_token": INSTAGRAM_ACCESS_TOKEN,
                        "media_type": "REELS",
                        "video_url": video_url,
                        "caption": caption
                    },
                    timeout=30
                )
                container_data = container_response.json()

                if "id" not in container_data:
                    raise Exception(f"Failed to create video container: {container_data}")

                container_id = container_data["id"]

                # Step 2: Publish the video
                publish_response = requests.post(
                    f"{INSTAGRAM_API}/{INSTAGRAM_ACCOUNT_ID}/media_publish",
                    params={
                        "access_token": INSTAGRAM_ACCESS_TOKEN,
                        "creation_id": container_id
                    },
                    timeout=30
                )
                result = publish_response.json()

            elif image_url:
                # Step 1: Create image container
                container_response = requests.post(
                    f"{INSTAGRAM_API}/{INSTAGRAM_ACCOUNT_ID}/media",
                    params={
                        "access_token": INSTAGRAM_ACCESS_TOKEN,
                        "image_url": image_url,
                        "caption": caption
                    },
                    timeout=30
                )
                container_data = container_response.json()

                if "id" not in container_data:
                    raise Exception(f"Failed to create image container: {container_data}")

                container_id = container_data["id"]

                # Step 2: Publish the image
                publish_response = requests.post(
                    f"{INSTAGRAM_API}/{INSTAGRAM_ACCOUNT_ID}/media_publish",
                    params={
                        "access_token": INSTAGRAM_ACCESS_TOKEN,
                        "creation_id": container_id
                    },
                    timeout=30
                )
                result = publish_response.json()
            else:
                raise Exception("Instagram requires an image or video")

            if "id" in result:
                self.results["instagram"]["success"] = True
                self.results["instagram"]["post_id"] = result["id"]
            else:
                raise Exception(f"Instagram API error: {result}")

        except Exception as e:
            self.results["instagram"]["error"] = str(e)
            print(f"Instagram Error: {e}", file=sys.stderr)

        return self.results["instagram"]

    def post_to_facebook(self) -> Dict:
        """Post to Facebook Page"""
        if not FACEBOOK_ACCESS_TOKEN or not FACEBOOK_PAGE_ID:
            self.results["facebook"]["error"] = "Facebook credentials not configured"
            return self.results["facebook"]

        try:
            title = self.post_data.get("title", "")
            excerpt = self.post_data.get("excerpt", "")
            tags = self.post_data.get("tags", [])
            image_url = self.post_data.get("image")
            video_url = self.post_data.get("video")
            media_type = self.post_data.get("mediaType", "text")
            link = self.post_data.get("link", "")

            # Format message
            hashtags = " ".join([f"#{tag.replace(' ', '').replace('-', '')}" for tag in tags if tag])
            message = f"{title}\n\n{excerpt}\n\n{hashtags}"

            if media_type == "video" and video_url:
                # Post video
                response = requests.post(
                    f"{FACEBOOK_API}/{FACEBOOK_PAGE_ID}/videos",
                    params={
                        "access_token": FACEBOOK_ACCESS_TOKEN,
                        "description": message,
                        "file_url": video_url
                    },
                    timeout=60
                )
            elif image_url:
                # Post photo
                response = requests.post(
                    f"{FACEBOOK_API}/{FACEBOOK_PAGE_ID}/photos",
                    params={
                        "access_token": FACEBOOK_ACCESS_TOKEN,
                        "url": image_url,
                        "caption": message
                    },
                    timeout=30
                )
            else:
                # Post text with link
                response = requests.post(
                    f"{FACEBOOK_API}/{FACEBOOK_PAGE_ID}/feed",
                    params={
                        "access_token": FACEBOOK_ACCESS_TOKEN,
                        "message": message,
                        "link": link if link else None
                    },
                    timeout=30
                )

            result = response.json()

            if "id" in result:
                self.results["facebook"]["success"] = True
                self.results["facebook"]["post_id"] = result["id"]
            else:
                raise Exception(f"Facebook API error: {result}")

        except Exception as e:
            self.results["facebook"]["error"] = str(e)
            print(f"Facebook Error: {e}", file=sys.stderr)

        return self.results["facebook"]

    def post_to_telegram(self) -> Dict:
        """Post to Telegram Channel"""
        if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
            self.results["telegram"]["error"] = "Telegram credentials not configured"
            return self.results["telegram"]

        try:
            title = self.post_data.get("title", "")
            excerpt = self.post_data.get("excerpt", "")
            tags = self.post_data.get("tags", [])
            image_url = self.post_data.get("image")
            video_url = self.post_data.get("video")
            media_type = self.post_data.get("mediaType", "text")
            link = self.post_data.get("link", "")

            # Format message with Markdown
            hashtags = " ".join([f"#{tag.replace(' ', '_').replace('-', '_')}" for tag in tags if tag])
            message = f"*{title}*\n\n{excerpt}\n\n{hashtags}"

            if link:
                message += f"\n\n[Read More]({link})"

            telegram_api = get_telegram_api()

            if media_type == "video" and video_url:
                # Send video
                response = requests.post(
                    f"{telegram_api}/sendVideo",
                    data={
                        "chat_id": TELEGRAM_CHAT_ID,
                        "video": video_url,
                        "caption": message[:1024],  # Telegram caption limit
                        "parse_mode": "Markdown"
                    },
                    timeout=60
                )
            elif image_url:
                # Send photo
                response = requests.post(
                    f"{telegram_api}/sendPhoto",
                    data={
                        "chat_id": TELEGRAM_CHAT_ID,
                        "photo": image_url,
                        "caption": message[:1024],
                        "parse_mode": "Markdown"
                    },
                    timeout=30
                )
            else:
                # Send text message
                response = requests.post(
                    f"{telegram_api}/sendMessage",
                    data={
                        "chat_id": TELEGRAM_CHAT_ID,
                        "text": message[:4096],  # Telegram message limit
                        "parse_mode": "Markdown"
                    },
                    timeout=30
                )

            result = response.json()

            if result.get("ok"):
                self.results["telegram"]["success"] = True
                self.results["telegram"]["message_id"] = result["result"]["message_id"]
            else:
                raise Exception(f"Telegram API error: {result}")

        except Exception as e:
            self.results["telegram"]["error"] = str(e)
            print(f"Telegram Error: {e}", file=sys.stderr)

        return self.results["telegram"]

    def post_to_all_platforms(self) -> Dict:
        """Post to all social media platforms"""
        print("Starting social media cross-posting...", file=sys.stderr)

        # Post to each platform
        self.post_to_instagram()
        self.post_to_facebook()
        self.post_to_telegram()

        # Return results
        return self.results


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Error: No post data provided", file=sys.stderr)
        print("Usage: python3 social_media_poster.py '{\"title\": \"...\", ...}'", file=sys.stderr)
        sys.exit(1)

    try:
        # Parse post data from command line argument
        post_data = json.loads(sys.argv[1])

        # Create poster and post to all platforms
        poster = SocialMediaPoster(post_data)
        results = poster.post_to_all_platforms()

        # Output results as JSON
        print(json.dumps(results))

        # Exit with success if at least one platform succeeded
        if any(r["success"] for r in results.values()):
            sys.exit(0)
        else:
            sys.exit(1)

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
