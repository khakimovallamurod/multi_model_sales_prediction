document.addEventListener('DOMContentLoaded', function() {
    // Menu navigation
    const menuButtons = document.querySelectorAll('.menu-btn');
    const contentSections = document.querySelectorAll('.content-section');
    
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // Update active menu button
            menuButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            contentSections.forEach(section => section.classList.remove('active'));
            document.getElementById(target).classList.add('active');
        });
    });
    
    // Model tanlash (Results section)
    const modelCheckboxes = document.querySelectorAll('.model-checkbox');
    const selectedModelElement = document.getElementById('selected-model');
    
    modelCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                selectedModelElement.textContent = this.value;
            }
        });
    });

    // Bashorat tugmasi (Results section)
    const predictBtn = document.getElementById('predict-btn');
    const loader = document.getElementById('loader');
    const resultsContent = document.getElementById('results-content');
    const maeValue = document.getElementById('mae-value');
    const rmseValue = document.getElementById('rmse-value');
    const r2Value = document.getElementById('r2-value');
    
    // Grafik konteksti
    const ctx = document.getElementById('result-chart').getContext('2d');
    let chart;
    
    predictBtn.addEventListener('click', function() {
        // Yuklash animatsiyasini ko'rsatish
        loader.style.display = 'block';
        resultsContent.style.display = 'none';
        
        // Tanlangan model
        const selectedModel = document.querySelector('input[name="model"]:checked').value;
    
        // Flask API ga POST so'rov yuborish
        fetch("http://ai-delay.sampc.uz/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ model_name: selectedModel })
        })
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            resultsContent.style.display = 'flex';
    
            if (data.error) {
                alert("Xato: " + data.error);
                return;
            }
    
            animateValue(maeValue, 0, data.metrics.MAE, 1500);
            animateValue(rmseValue, 0, data.metrics.RMSE, 1500);
            animateValue(r2Value, 0, data.metrics.R2, 1500);
    
            if (data.actual && data.predicted) {
                drawChart(data.actual, data.predicted);
            }
        })
        .catch(error => {
            loader.style.display = 'none';
            alert("Serverga ulanishda xatolik: " + error);
        });
    });
    const calculateBtn = document.getElementById('calculate-btn-1');
    const predictionLoader = document.getElementById('prediction-loader');
    const predictionResult = document.getElementById('prediction-result');
    const quantitySold = document.getElementById('quantity-sold');
    const resultMessage = document.getElementById('result-message');

    calculateBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Form submitni bloklash

        // Loader ko‘rsatish
        predictionLoader.style.display = 'block';
        predictionResult.style.display = 'none';

        // Form qiymatlarni olish
        const payload = {
            day: parseInt(document.getElementById('day').value),
            month: parseInt(document.getElementById('month').value),
            year: parseInt(document.getElementById('year').value),
            product_id: document.getElementById('product-id').value,
            agent_id: document.getElementById('agent-id').value,
            category: parseInt(document.getElementById('category').value),
            week_name: parseInt(document.getElementById('week-name').value),
            holiday: parseInt(document.getElementById('holiday').value),
            unit_price: parseFloat(document.getElementById('unit-price').value),
            model_name: document.getElementById('prediction-model-select').value
        };

        fetch("http://ai-delay.sampc.uz/predict_sold", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            predictionLoader.style.display = 'none';
            predictionResult.style.display = 'block';

            if (data.error) {
                quantitySold.textContent = "Xato";
                resultMessage.textContent = data.error;
            } else {
                quantitySold.textContent = data.predicted_quantity; // backend shu nom bilan qaytaradi deb o‘ylayman
                resultMessage.textContent = `Model: ${payload.model_name} | Bashorat muvaffaqiyatli ✅`;
            }
        })
        .catch(error => {
            predictionLoader.style.display = 'none';
            predictionResult.style.display = 'block';
            quantitySold.textContent = "Xato";
            resultMessage.textContent = "Server xatosi: " + error;
        });
    });

    
    const trainBtn = document.getElementById('train-btn');
    const trainingLoader = document.getElementById('training-loader');
    const trainingResult = document.getElementById('training-result');
    
    trainBtn.addEventListener('click', function() {
        // Yuklash animatsiyasini ko'rsatish
        trainingLoader.style.display = 'block';
        trainingResult.style.display = 'none';
        
        // 5 soniya kutib olish (o'qitish jarayoni)
        setTimeout(() => {
            // Yuklashni yashirish va natijalarni ko'rsatish
            trainingLoader.style.display = 'none';
            trainingResult.style.display = 'block';
            
            // AJAX so'rovni yuborish (simulyatsiya)
            simulateAjaxRequest();
        }, 5000);
    });
    
    // Qiymatlarni animatsiya bilan yangilash
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = progress * (end - start) + start;
            element.textContent = value.toFixed(4);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Grafikni chizish
    function drawChart(actualData, predictedData) {
        // Avvalgi grafikni yo'q qilish
        if (chart) {
            chart.destroy();
        }
        
        // Yangi grafik yaratish
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: actualData.length}, (_, i) => `${i+1}`),
                datasets: [
                    {
                        label: 'Actual values',
                        data: actualData,
                        borderColor: '#4361ee',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        borderWidth: 2,

                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Prediction values',
                        data: predictedData,
                        borderColor: '#4cc9f0',
                        backgroundColor: 'rgba(76, 201, 240, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#000',
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Actual and Prediction Results',
                        color: '#000',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#000'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#000'
                        }
                    }
                }
            }
        });
    }
    
    // AJAX so'rovni simulyatsiya qilish
    function simulateAjaxRequest() {
        console.log("Ma'lumotlar serverga yuborilmoqda...");
        // Bu yerda haqiqiy AJAX so'rov bo'lishi kerak
        // setTimeout(function() {
        //     console.log("Serverdan javob qabul qilindi");
        // }, 2000);
    }
    
    // Dastlabki modelni tanlash
    document.getElementById('mlp').checked = true;
    document.getElementById('pred-mlp').checked = true;
});
