#  Main idea is to use a bounding box prompt from the user to return an overlayed mask from SAM, SAM would be running locally on the you studio/aws env. Using Flask for deploying it, not for final production, testing.

import os
import io
import torch
from flask_cors import CORS
import numpy as np
import cv2
from PIL import Image
from flask import Flask, request, jsonify, send_file
import sys

from transformers import SamModel, SamProcessor


# Setup model
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SamModel.from_pretrained("facebook/sam-vit-huge").to(device)
processor = SamProcessor.from_pretrained("facebook/sam-vit-huge")

sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
sam.to(device)
predictor = SamPredictor(sam)

# Flask app
app = Flask(__name__)
CORS(app) 

def create_colored_overlay(mask, color=(30, 144, 255, 153)):  # R, G, B, A
    h, w = mask.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[mask > 0] = color  # Only where mask == 1
    return Image.fromarray(rgba, mode="RGBA")

def create_mask(mask, random_color=False):
    if random_color:
        color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
    else:
        color = np.array([30/255, 144/255, 255/255, 0.6])
    h, w = mask.shape[-2:]
    mask_image = mask.reshape(h, w, 1) * color.reshape(1, 1, -1)

@app.route('/segment', methods=['POST'])
def segment():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image_file = request.files['image']
    box = request.form.get('box')  # Format: x_min,y_min,x_max,y_max

    if not box:
        return jsonify({'error': 'No box provided'}), 400

    # Convert string to list of ints
    try:
        box_coords = list(map(int, box.split(',')))
        assert len(box_coords) == 4
    except:
        return jsonify({'error': 'Invalid box format'}), 400

    # Open and convert image
    image = Image.open(image_file).convert("RGB")
    
    # Convert box to input points (center of the box) and input boxes format
    x_min, y_min, x_max, y_max = box_coords
    input_box = [[x_min, y_min, x_max, y_max]]
    
    # Process inputs with the processor
    inputs = processor(
        image, 
        input_boxes=[input_box],  # Note the nested list structure
        return_tensors="pt"
    ).to(device)

    # Predict
    with torch.no_grad():
        outputs = model(**inputs)

    # Post-process masks
    masks = processor.image_processor.post_process_masks(
        outputs.pred_masks.cpu(), 
        inputs["original_sizes"].cpu(), 
        inputs["reshaped_input_sizes"].cpu()
    )
    
    # Get the best mask (index 0 since multimask_output=False equivalent)
    binary_mask = masks[0][0][0].numpy().astype(np.uint8)
    
    # Create overlay (assuming you have this function defined elsewhere)
    overlay = create_colored_overlay(binary_mask)  # Create RGBA mask image

    # Save debug image if needed
    overlay.save(f'debug_masks/mask_{box_coords}.png')
    
    # Return the image
    mask_bytes = io.BytesIO()
    overlay.save(mask_bytes, format="PNG")
    mask_bytes.seek(0)
    return send_file(mask_bytes, mimetype="image/png")

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port)
