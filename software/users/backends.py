from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from .models import ClerkUser
import jwt
import requests
from django.conf import settings
from datetime import datetime, timezone

class ClerkAuthBackend(BaseBackend):
    def authenticate(self, request, token=None):
        if not token:
            return None

        try:
            # First decode without verification to check timing
            unverified = jwt.decode(
                token,
                options={"verify_signature": False}
            )
            
            # Get current time and token's iat
            current_time = datetime.now(timezone.utc).timestamp()
            token_iat = unverified.get('iat', 0)
            
            # If token's iat is in the future, use it as current time
            verification_time = max(current_time, token_iat)
            
            # Decode and verify the token
            decoded = jwt.decode(
                token,
                settings.CLERK_PUBLIC_KEY,
                algorithms=['RS256'],
                audience=None,
                issuer=settings.CLERK_ISSUER,
                options={
                    'verify_exp': True,
                    'verify_iat': True,
                    'verify_nbf': False,
                },
                leeway=60,
                clock_skew=60,
                current_time=verification_time
            )

            print("\n=== Token Contents ===")
            print("Claims:", decoded)

            clerk_user_id = decoded['sub']
            
            try:
                clerk_user = ClerkUser.objects.get(clerk_id=clerk_user_id)
                return clerk_user.user
            except ClerkUser.DoesNotExist:
                # Fetch user data from Clerk API
                headers = {
                    'Authorization': f'Bearer {settings.CLERK_SECRET_KEY}',
                }
                response = requests.get(
                    f'https://api.clerk.com/v1/users/{clerk_user_id}',
                    headers=headers
                )
                
                if not response.ok:
                    print(f"Failed to fetch Clerk user data: {response.text}")
                    raise Exception("Failed to fetch Clerk user data")

                clerk_data = response.json()
                print("Clerk API response:", clerk_data)  # Debug line
                
                # Get the primary email address
                email_addresses = clerk_data.get('email_addresses', [])
                primary_email = next((email['email_address'] for email in email_addresses if email.get('id')), '')
                
                # Get the username from Clerk data
                username = clerk_data.get('username') or primary_email.split('@')[0]
                
                # Create Django user
                user = User.objects.create_user(
                    username=username,
                    email=primary_email
                )
                
                # Get profile image if available
                image_url = clerk_data.get('image_url', None)
                
                ClerkUser.objects.create(
                    user=user,
                    clerk_id=clerk_user_id,
                    profile_image_url=image_url
                )
                
                return user

        except Exception as e:
            print(f"Authentication error: {str(e)}")
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None 