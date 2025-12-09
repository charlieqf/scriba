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

    if not token or provider != 'google':
        return jsonify({"success": False, "message": "Invalid provider or token missing"}), 400

    try:
        # Verify the token with Google
        # In a real app, replace "YOUR_GOOGLE_CLIENT_ID" with os.getenv('GOOGLE_CLIENT_ID')
        # and pass it as the second argument to verify_oauth2_token
        id_info = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            audience=os.getenv('GOOGLE_CLIENT_ID')
        )

        email = id_info.get('email')
        name = id_info.get('name')
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Create new user
            user = User(email=email, name=name)
            db.session.add(user)
            db.session.commit()
            print(f"Created new user: {email}")
        else:
            print(f"Found existing user: {email}")

        # In a real app, you would generate a JWT here. 
        # For now, we'll return the user info.
        return jsonify({
            "success": True,
            "token": "mock_session_token_123", # Replace with real JWT generation
            "user": user.to_dict()
        })

    except ValueError as e:
        # Invalid token
        return jsonify({"success": False, "message": f"Token verification failed: {str(e)}"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)