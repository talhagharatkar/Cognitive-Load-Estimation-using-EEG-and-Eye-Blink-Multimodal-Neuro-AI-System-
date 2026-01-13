# Cognitive-Load-Estimation-using-EEG-and-Eye-Blink-Multimodal-Neuro-AI-System-
# Cognitive Load Estimation using Eye Blink and EEG Fusion

## 📌 Project Overview

This project focuses on **estimating a person's cognitive load (mental effort)** by combining **eye blink behavior** and **EEG (brain signal) data**. The system uses **Artificial Intelligence and Machine Learning** techniques to determine whether a person is **relaxed, focused, or mentally overloaded**.

The project is useful in real-world applications such as **driver safety systems** and **intelligent learning platforms**.

---

## 🧠 What is Cognitive Load?

Cognitive load refers to **how much mental effort the brain is using at a given time**.

### Examples:

* Watching a movie → Low cognitive load
* Solving problems → Medium cognitive load
* Driving in heavy traffic while distracted → High cognitive load

When cognitive load becomes too high, it can lead to **fatigue, loss of focus, and mistakes**.

---

## 👁 Eye Blink Analysis

Eye behavior changes based on mental state. The system uses a camera to analyze eye movements.

### Key Eye Features:

* Blink rate
* Blink duration
* Eye Aspect Ratio (EAR)

### Simple Interpretation:

* Normal blinking → Relaxed state
* Fast or long blinks → Stress or fatigue

Technologies used:

* OpenCV
* Dlib / MediaPipe

---

## 🧠 EEG Signal Analysis

EEG (Electroencephalography) measures electrical signals produced by the brain.

### Brain Waves Used:

* Alpha waves → Relaxed state
* Beta waves → Focused thinking
* Theta waves → Mental fatigue or overload

Changes in these signals help determine the cognitive load level.

---

## 🔗 Feature Fusion

Both eye blink features and EEG features are combined to improve accuracy.

### Why Fusion?

* Eye data alone can be affected by lighting or camera issues
* EEG data alone may contain noise

Combining both gives **more reliable results**.

---

## 🤖 Machine Learning Model

The fused data is passed to a machine learning model which classifies cognitive load into:

* Low Load
* Medium Load
* High Load

### Models Used:

* Support Vector Machine (SVM)
* Random Forest
* CNN / LSTM (for advanced versions)

---

## 🚗 Application 1: Driver Safety System

### Problem:

Drivers may become mentally overloaded or drowsy, increasing accident risk.

### Solution:

The system monitors eye blinking and brain signals in real time and:

* Detects fatigue
* Sends alerts
* Suggests breaks

---

## 🎓 Application 2: Intelligent Learning System

### Problem:

Students may feel overwhelmed during online learning.

### Solution:

The system adapts learning content based on the student's mental load by:

* Pausing lessons
* Simplifying explanations
* Suggesting rest

---

## 🛠 Technologies Used

* Python
* OpenCV
* Dlib / MediaPipe
* EEG Datasets (DEAP / SEED)
* Machine Learning
* Deep Learning (CNN, LSTM)

---

## 📊 System Architecture

```
Camera + EEG Headset
        ↓
Data Preprocessing
        ↓
Feature Extraction
        ↓
Feature Fusion
        ↓
ML / DL Model
        ↓
Cognitive Load Output
```

---

## 🎯 Project Advantages

* Real-time monitoring
* High accuracy using multimodal data
* Useful in safety and education
* Research and industry relevant

---

## 🧾 Conclusion

This project demonstrates how **AI can understand human mental states** using biological signals. By combining eye blink detection and EEG analysis, the system provides an effective way to monitor and manage cognitive load in real-world scenarios.

---

## 👨‍💻 Author

**Talha Gharatkar**
