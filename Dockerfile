FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory inside the container
WORKDIR /app

# ✅ Install system packages including build tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    build-essential \
    g++ \
    && rm -rf /var/lib/apt/lists/*


COPY greenstand_docker/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

RUN pip install cython && \
    pip install git+https://github.com/lucasb-eyer/pydensecrf.git

# COPY greenstand_segmentation_model_build/segmentation_model_build/AutoSAM /app/AutoSAM

COPY greenstand_segmentation_model_build/segmentation_model_build/AutoSAM /app/AutoSAM

WORKDIR /app/AutoSAM
# ✅ Install AutoSAM repo in editable mode
RUN pip install -e .


# Replace your current ENTRYPOINT with this
COPY greenstand_docker/sagemaker_entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/sagemaker_entrypoint.sh
ENTRYPOINT ["/usr/local/bin/sagemaker_entrypoint.sh"]

EXPOSE 8000