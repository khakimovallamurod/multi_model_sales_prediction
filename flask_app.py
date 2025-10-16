from flask import Flask, request, jsonify, render_template
from data_prediction import Prediction
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    model_name = data.get("model_name")

    if not model_name:
        return jsonify({"error": "model_name kiritilmadi"}), 400
    model_path = f"models/{model_name}_model.pkl"
    pred_obj = Prediction(model_path)

    y_true, y_pred = pred_obj.model_prediction_orginal()
    metrics = pred_obj.evaluate_regression()
    return jsonify({
        "model": model_name,
        "metrics": metrics,
        "actual": y_true[:30].tolist(),    
        "predicted": y_pred[:30].tolist()
    })

@app.route('/predict_sold', methods=["POST"])
def data_predict_price():
    data = request.get_json()
    print(data)
    model_name = data.pop('model_name')
    model_path = f"models/{model_name}_model.pkl"
    pred_obj = Prediction(model_path)
    pred_data = pred_obj.test_data_prediction(data= data)
    return jsonify({
        "predicted_quantity": pred_data[0]
    })

if __name__ == "__main__":
    app.run(debug=True, port=8000)