# Use Red Hat UBI 8 with Python 3.9
FROM frenzy669/grus-api-base:latest

USER root

# Install checkpointctl
RUN yum install -y go make && \
    git clone https://github.com/checkpoint-restore/checkpointctl.git && \
    cd checkpointctl && \
    make && \
    mv checkpointctl /usr/local/bin/ && \
    cd .. && \
    rm -rf checkpointctl

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Set working directory
WORKDIR /app

# Install system dependencies including buildah and crictl
RUN dnf install -y buildah \
    && dnf clean all \
    && curl -L https://github.com/kubernetes-sigs/cri-tools/releases/download/v1.28.0/crictl-v1.28.0-linux-amd64.tar.gz -o crictl.tar.gz \
    && tar zxvf crictl.tar.gz -C /usr/local/bin \
    && rm -f crictl.tar.gz 
    

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["/bin/bash", "/app/run-grus.sh"]