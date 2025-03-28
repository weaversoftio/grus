#!/bin/bash

# Define variables
RUNC_VERSION="v1.2.4"
RUNC_URL="https://github.com/opencontainers/runc/releases/download/$RUNC_VERSION/runc.amd64"
RUNC_PATH="/usr/bin/runc"

# Download runc
echo "Downloading runc version $RUNC_VERSION..."
curl -LO $RUNC_URL || { echo "Failed to download runc"; exit 1; }


# Remount /usr as writable
echo "Remounting /usr as writable..."
sudo mount -o remount,rw /usr || { echo "Failed to remount /usr as writable"; exit 1; }


# Backup existing runc
if [ -f "$RUNC_PATH" ]; then
    echo "Backing up existing runc to $RUNC_PATH.bak..."
    sudo cp "$RUNC_PATH" "$RUNC_PATH.bak" || { echo "Failed to backup existing runc"; exit 1; }
fi

# Move the new runc binary into place
echo "Replacing the runc binary..."
sudo mv ./runc.amd64 "$RUNC_PATH" || { echo "Failed to move runc binary"; exit 1; }
sudo chmod +x "$RUNC_PATH" || { echo "Failed to set execute permission on runc binary"; exit 1; }


# Verify the runc version
echo "Verifying the runc installation..."
/usr/bin/runc --version || { echo "Failed to verify runc version"; exit 1; }

echo "runc has been successfully updated to version $RUNC_VERSION."
