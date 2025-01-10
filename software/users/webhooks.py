import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from .models import ClerkUser
from django.conf import settings
import hmac
import hashlib
import sys
import logging
from datetime import datetime
import traceback

# Set up logging
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logger = logging.getLogger(__name__)

@csrf_exempt
def clerk_webhook(request):
    sys.stdout.write(f"\n=== WEBHOOK REQUEST RECEIVED AT {datetime.now()} ===\n")
    sys.stdout.flush()
    
    try:
        data = json.loads(request.body)
        event_type = data.get('type')
        
        print(f"Event type: {event_type}", flush=True)
        
        if event_type == 'user.created':
            user_data = data.get('data', {})
            print(f"Processing user data: {json.dumps(user_data, indent=2)}", flush=True)
            
            # Get email from the first email address
            email_addresses = user_data.get('email_addresses', [])
            if not email_addresses:
                print("No email addresses found!", flush=True)
                return HttpResponse(status=400)
            
            email = email_addresses[0].get('email_address')
            username = user_data.get('username')  # Get username from Clerk
            clerk_id = user_data.get('id')
            
            if not username:
                username = email.split('@')[0]  # Fallback to email prefix if no username
            
            print(f"Creating user with: username={username}, email={email}, clerk_id={clerk_id}", flush=True)
            
            try:
                # Check if user already exists
                if User.objects.filter(email=email).exists():
                    print(f"User with email {email} already exists", flush=True)
                    return HttpResponse(status=200)
                
                # Create Django user with minimal required fields
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=None,  # No password needed as we're using Clerk
                    first_name='',  # Empty string for first name
                    last_name=''    # Empty string for last name
                )
                print(f"Created Django user: {user.username}", flush=True)
                
                # Create ClerkUser
                clerk_user = ClerkUser.objects.create(
                    user=user,
                    clerk_id=clerk_id
                )
                print(f"Created ClerkUser: {clerk_user}", flush=True)
                
            except Exception as e:
                print(f"Error creating user: {str(e)}", flush=True)
                print(traceback.format_exc(), flush=True)
                return HttpResponse(status=500)
        
        return HttpResponse(status=200)
        
    except Exception as e:
        print(f"Error processing webhook: {str(e)}", flush=True)
        print(traceback.format_exc(), flush=True)
        return HttpResponse(status=500) 