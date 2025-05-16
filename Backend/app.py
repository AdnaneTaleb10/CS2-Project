from flask import Flask, request, jsonify, send_from_directory
import numpy as np
import tensorflow as tf
from PIL import Image
from flask_cors import CORS
import io

app = Flask(__name__, static_folder='static')
CORS(app)

# Load the trained model
model = tf.keras.models.load_model('mnist_lenet5_model.h5')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'Image not provided'}), 400

        image_file = request.files['image']
        image = Image.open(image_file).convert('L')  # Grayscale

        # Resize image to 28x28 (since it's already in the correct format in the frontend)
        image = image.resize((28, 28))

        # Convert image to numpy array and normalize (ensure values between 0 and 1)
        image_array = np.array(image) / 255.0
        image_array = image_array.reshape(1, 28, 28, 1)

        # Predict the digit
        prediction = model.predict(image_array)
        digit = int(np.argmax(prediction))  # Get the predicted digit

        return jsonify({'digit': digit})  # Return the prediction result as JSON
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
