import os
import json
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

def grus_init():
    try:
        # check if config/grus_init_done file exists
        if os.path.exists("config/grus_init_done"):
            print("GRUS is already initialized")
            return

        # Ensure the required directories exist before creating files
        os.makedirs("config/security", exist_ok=True)
        os.makedirs("config/clusters", exist_ok=True)
        os.makedirs("config/registry", exist_ok=True)
        os.makedirs("config/security/users", exist_ok=True)
        os.makedirs("config/security/secrets", exist_ok=True)

        # Load the RSA keys if they are not existing, generate them
        private_key_path = "config/security/private.pem"
        public_key_path = "config/security/public.pem"

        if not os.path.exists(private_key_path):
            # Generate private key
            print("Generating private key...")
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
                backend=default_backend()
            )

            # Save private key
            with open(private_key_path, "wb") as f:
                f.write(private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))

            # Save public key
            with open(public_key_path, "wb") as f:
                f.write(private_key.public_key().public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                ))

        # Create a user admin with password admin
        print("Creating user admin...")
        with open("config/security/users/admin.json", "w") as f:
            json.dump({"userdetails": {"name": "Super Admin", "role": "admin", "username": "admin", "password": "admin"}, "name": "admin"}, f)

        # Mark initialization as done
        with open("config/grus_init_done", "w") as f:
            f.write("grus_init_done")

        print("GRUS initialization complete.")

    except Exception as e:
        print("Failed to initialize grus, error: ", str(e))

# Run the function
grus_init()
