import joblib
import csv
from sklearn.model_selection import train_test_split
from sklearn.ensemble import BaggingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.metrics import accuracy_score, f1_score
import numpy as np

class Prediction:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None

    def read_csv_file(self, file_path='datasets/flight_price_data.csv'):
        """
        Reads a CSV file and returns its content as a list of dictionaries.
        Each dictionary represents a row in the CSV file, with keys as column headers.
        """
        with open(file_path, mode='r', encoding='utf-8') as file:
            reader = csv.reader(file)
            return list(reader)[1:]
        
    def load_xy_from_csv(self, file_path='datasets/flight_price_data.csv'):
        """
        CSV fayldan x va y ni ajratib oladi.
        Oxirgi ustun target (y), qolganlari features (x).
        """
        data = self.read_csv_file(file_path)
        data = np.array(data).astype(np.float32)
        x = data[:, :-1]
        y = data[:, -1]
        return x, y
    
    def normalize_and_filter(self, x, y, threshold=0.25):
        """
        Berilgan x va y ni normalizatsiya qiladi va threshold bo‘yicha filterlaydi.
        """
        x_min, x_max = x.min(axis=0), x.max(axis=0)
        y_min, y_max = y.min(), y.max()

        x = (x - x_min) / (x_max - x_min)
        y = (y - y_min) / (y_max - y_min)

        mask = y < threshold
        x_filter, y_filter = x[mask], y[mask]

        return x_filter, y_filter, x_min, y_min, x_max, y_max

    def data_train_test_split(self):
        x, y = self.load_xy_from_csv()
        x_filter, y_filter, x_min, y_min, x_max, y_max = self.normalize_and_filter(x, y)
        x_train, x_test, y_train, y_test = train_test_split(x_filter, y_filter, test_size=0.038, random_state=42)
        return x_test, y_test, x_min, y_min, x_max, y_max
    
    def load_model(self):
        loaded_model = joblib.load(self.model_path)
        self.model = loaded_model
    
    def model_prediction_orginal(self):
        self.load_model()
        x_test, y_test, x_min, y_min, x_max, y_max = self.data_train_test_split()
        y_pred = self.model.predict(x_test)

        y_pred_original = y_pred * (y_max - y_min) + y_min
        y_test_original = y_test * (y_max - y_min) + y_min

        return y_test_original, y_pred_original
    
    def model_prediction(self):
        self.load_model()
        x_test, y_test, x_min, y_min, x_max, y_max = self.data_train_test_split()
        y_pred = self.model.predict(x_test)

        return y_test, y_pred

    def evaluate_regression(self):
        """
        Regression model baholash metrikalari (RMSE, MAE, R2) ni hisoblaydi.
        """
        y_true, y_pred = self.model_prediction()
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)

        return {
            "RMSE": f'{rmse:.4f}',
            "MAE": f'{mae:.4f}',
            "R2": f'{r2:.4f}'
        }

    def test_data_prediction(self, data: dict):
        self.load_model()
        data_list = list(data.values())
        data_pred = self.model.predict([data_list])
        x_test, y_test, x_min, y_min, x_max, y_max = self.data_train_test_split()
        data_pred_real = data_pred * (y_max - y_min) + y_min
        return data_pred_real




