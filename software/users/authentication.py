from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User
from .models import ClerkUser, Profile
import jwt
import logging
from django.conf import settings
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class ClerkAuthentication(BaseAuthentication):
    def authenticate(self, request):
        logger.debug("\n=== Authentication Request ===")
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        logger.debug(f"Token received: {token[:20]}...")
        
        try:
            # First decode without verification to check claims
            unverified = jwt.decode(
                token,
                options={"verify_signature": False}
            )
            logger.debug(f"Unverified token claims: {unverified}")
            
            # Get current time and token's iat
            current_time = datetime.now(timezone.utc).timestamp()
            token_iat = unverified.get('iat', 0)
            
            # If token's iat is in the future, use it as current time
            verification_time = max(current_time, token_iat)
            
            # Decode and verify the token with relaxed settings
            decoded = jwt.decode(
                token,
                settings.CLERK_PUBLIC_KEY,
                algorithms=['RS256'],
                options={
                    'verify_exp': True,
                    'verify_iat': True,
                    'verify_nbf': False,
                    'verify_aud': False  # Don't verify audience claim
                },
                leeway=60,  # Add 60 seconds leeway
                clock_skew=60,  # Allow 60 seconds clock skew
                current_time=verification_time
            )
            
            logger.debug(f"Decoded token: {decoded}")
            clerk_id = decoded['sub']
            
            try:
                clerk_user = ClerkUser.objects.select_related('user').get(clerk_id=clerk_id)
                user = clerk_user.user
                logger.debug(f"Found existing user: {user.username}")
                
                # Create profile if it doesn't exist
                if not hasattr(user, 'profile'):
                    Profile.objects.create(
                        user=user,
                        clerk_id=clerk_id,
                        bio='',  # Empty bio by default
                        profile_image_url=clerk_user.profile_image_url
                    )
                    logger.debug(f"Created profile for existing user: {user.username}")
                
                return (user, None)
                
            except ClerkUser.DoesNotExist:
                logger.debug(f"Creating new user for clerk_id: {clerk_id}")
                email = decoded.get('email', '')
                username = email.split('@')[0] if email else f"user_{clerk_id.split('_')[1]}"
                
                user = User.objects.create_user(username=username, email=email)
                clerk_user = ClerkUser.objects.create(
                    user=user,
                    clerk_id=clerk_id
                )
                
                # Create profile for new user
                Profile.objects.create(
                    user=user,
                    clerk_id=clerk_id,
                    bio='',  # Empty bio by default
                    profile_image_url=clerk_user.profile_image_url
                )
                logger.debug(f"Created new user and profile: {user.username}")
                return (user, None)

        except jwt.InvalidTokenError as e:
            logger.error(f"JWT validation error: {str(e)}")
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            logger.error(f"Error type: {type(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise AuthenticationFailed('Authentication failed')

    def authenticate_header(self, request):
        return 'Bearer'