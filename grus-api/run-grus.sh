#! /bin/bash
echo "Activating virtual environment"
python -m venv venv
source ./venv/bin/activate
echo "Starting uvicorn server"
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4 --reload
