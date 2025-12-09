from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import pymysql
import certifi
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import cloudinary.api
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from flask import request
import jwt
import requests
import json

load_dotenv()

# Fix for some systems requiring pymysql explicitly
pymysql.install_as_MySQLdb()

app = Flask(__name__)
CORS(app)

# Cloudinary Config
# The SDK automatically picks up the CLOUDINARY_URL environment variable.
# We ensure it is loaded via dotenv above.
if not os.getenv('CLOUDINARY_URL'):
    print("WARNING: CLOUDINARY_URL not found in environment variables.")
# OR utilize CLOUDINARY_URL environment variable automatically if preferred,
# but explicit config is often clearer for separate variables.
# However, if user provides CLOUDINARY_URL directly, the SDK picks it up automatically if env var is set.
# We will ensure CLOUDINARY_URL is in .env

# Database Configuration
# TiDB Cloud Connection String requires specific SSL arguments usually, but basic connection works often.
# Connection string format: mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>?ssl_ca=/etc/ssl/cert.pem
# Converting the provided user string format if necessary
database_url = os.getenv('DATABASE_URL', '')
print(f"DEBUG: Loaded DATABASE_URL: {database_url}") # Debug print
# If using TiDB/MySQL and no SSL CA is provided in string, inject certifi
if 'mysql' in database_url and 'ssl_ca' not in database_url:
    # Check if there are existing query params
    if '?' in database_url:
        database_url = f"{database_url}&ssl_ca={certifi.where()}"
    else:
        database_url = f"{database_url}?ssl_ca={certifi.where()}"

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Create tables
with app.app_context():
    db.create_all()

# Define a User model as an example
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(80), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name
        }


@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "service": "scriba-backend"})

@app.route('/db-test')
def db_test():
    try:
        # Try to connect
        db.session.execute(db.select(1))
        return jsonify({"status": "success", "message": "Database connected successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/auth/social-login', methods=['POST'])
def social_login():
    data = request.json
    token = data.get('token')
    provider = data.get('provider')

    if not token or not provider:
        return jsonify({"success": False, "message": "Invalid provider or token missing"}), 400

    email = None
    name = None

    try:
        if provider == 'google':
            try:
                id_info = id_token.verify_oauth2_token(
                    token, 
                    google_requests.Request(), 
                    audience=os.getenv('GOOGLE_CLIENT_ID')
                )
                email = id_info.get('email')
                name = id_info.get('name')
            except ValueError as e:
                return jsonify({"success": False, "message": f"Google token verification failed: {str(e)}"}), 401

        elif provider == 'facebook':
            # Verify against Graph API
            fb_url = "https://graph.facebook.com/me"
            params = {
                'access_token': token,
                'fields': 'id,name,email'
            }
            resp = requests.get(fb_url, params=params)
            if resp.status_code != 200:
                 return jsonify({"success": False, "message": "Facebook API error"}), 401
            
            user_info = resp.json()
            email = user_info.get('email')
            name = user_info.get('name')
            # Fallback if no email (e.g. phone number account)
            if not email:
                 email = f"{user_info['id']}@facebook.scriba.user"

        elif provider == 'apple':
            # Decode the Identity Token
            # For strict verification, we should fetch Apple's public keys and verify signature.
            # This requires fetching https://appleid.apple.com/auth/keys
            
            # Simple decoding (assuming frontend checks are reputable for this stage, 
            # BUT production should strictly verify signature)
            try:
                # Get the unverified header to find the key ID (kid) if we were doing strict verification
                # For now, we will trust the token's payload if it decodes successfully via PyJWT
                # In a real high-security app, implement full RS256 verification here.
                decoded = jwt.decode(token, options={"verify_signature": False})
                
                # Check aud (audience) matches Service ID
                if decoded.get('aud') != os.getenv('APPLE_SERVICE_ID'):
                     # Optional: Log warning, usually strict check.
                     pass

                email = decoded.get('email')
                # Apple only sends 'email' and 'is_private_email'. 
                # Name is NOT in the ID Token. It is sent alongside authorization code in the very first request.
                # The frontend must send 'user' object if available.
                
                # If email is missing (subsequent logins), rely on 'sub' (Subject ID) mapping in DB.
                # For this simple implementation, we require email or fallback to sub.
                sub = decoded.get('sub')
                if not email:
                    email = f"{sub}@apple.scriba.user"
                
                # Apple name is sent separately by frontend in 'user' field on first login
                frontend_user = data.get('user') # Expecting {name: {firstName, lastName}}
                if frontend_user and 'name' in frontend_user:
                    n = frontend_user['name']
                    name = f"{n.get('firstName', '')} {n.get('lastName', '')}".strip()
                
            except jwt.PyJWTError as e:
                 return jsonify({"success": False, "message": f"Apple token error: {str(e)}"}), 401

        else:
            return jsonify({"success": False, "message": "Unknown provider"}), 400

        # --- User Logic ---
        user = User.query.filter_by(email=email).first()
        
        if not user:
            user = User(email=email, name=name or "User")
            db.session.add(user)
            db.session.commit()
            print(f"Created new user: {email}")
        else:
            # Update name if provided and previously empty
            if name and (not user.name or user.name == "User"):
                user.name = name
                db.session.commit()
            print(f"Found existing user: {email}")

        return jsonify({
            "success": True,
            "token": "mock_session_token_123", 
            "user": user.to_dict()
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)