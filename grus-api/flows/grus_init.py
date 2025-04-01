import os
import json
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

def grus_init():
    # Ensure necessary directories exist first
    os.makedirs("config/security", exist_ok=True)

    # check if config/grus_init_done file exists
    if os.path.exists("config/grus_init_done"):
        print("GRUS is already initialized")
        return

    # Load or generate RSA keys
    private_key_path = "config/security/private.pem"
    if not os.path.exists(private_key_path):
        print("Generating private key")
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        with open(private_key_path, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))

        with open("config/security/public.pem", "wb") as f:
            f.write(private_key.public_key().public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))

    # Create other necessary directories
    os.makedirs("config/clusters", exist_ok=True)
    os.makedirs("config/registry", exist_ok=True)
    os.makedirs("config/security/users", exist_ok=True)
    os.makedirs("config/security/secrets", exist_ok=True)

    # Create admin user
    print("Creating user admin")
    admin_user = {
        "userdetails": {
            "name": "Super Admin",
            "role": "admin",
            "username": "admin",
            "password": "admin"
        },
        "name": "admin"
    }
    with open("config/security/users/admin.json", "w") as f:
        json.dump(admin_user, f)

    # Mark initialization as done
    with open("config/grus_init_done", "w") as f:
        f.write("grus_init_done")
