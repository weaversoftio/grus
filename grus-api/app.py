import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
import flows.grus_init
flows.grus_init.grus_init()

# Import routers
from routes.registry import router as registry_router
from routes.checkpoint import router as checkpoint_router
from routes.pod import router as pod_router
from routes.automation import router as automation_router
from routes.kubectl import router as kubectl_router
from routes.config import router as config_router
from routes.cluster import router as cluster_router
from routes.download import router as cluster_download
from routes.websocket import router as websocket_router

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
checkpoint_path = os.path.join(BASE_DIR, 'checkpoints')
origins_env = os.getenv("GRUS_ORIGINS", "http://localhost,http://localhost:3000,*")
origins = origins_env.split(",")

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("automation_api")
logging.getLogger().setLevel(logging.ERROR)  # Root logger
logging.getLogger("multipart.multipart").setLevel(logging.ERROR)  # Full path to multipart logger
logging.getLogger("multipart.multipart.parse").setLevel(logging.ERROR)  # Parser specific logger
logging.getLogger("uvicorn").setLevel(logging.ERROR)

# Include routers
app.include_router(registry_router, prefix="/registry", tags=["registry"])
app.include_router(cluster_router, prefix="/cluster", tags=["cluster"])
app.include_router(checkpoint_router, prefix="/checkpoint", tags=["checkpoint"])
app.include_router(pod_router, prefix="/pod", tags=["pod"])
app.include_router(automation_router, prefix="/automation", tags=["automation"])
app.include_router(kubectl_router, prefix="/kubectl", tags=["kubectl"])
app.include_router(config_router, prefix="/config", tags=["config"])
app.include_router(cluster_download, prefix="/download", tags=["download"])
app.include_router(websocket_router, prefix="/ws", tags=["websocket"])