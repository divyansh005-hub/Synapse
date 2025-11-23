# Probability Models and Formulas

> [!NOTE]
> **Future Work**: These probability models are documented as reference material for future enhancements. The current implementation uses simple threshold-based anomaly detection. These models can be integrated when adding features like machine learning-based failure prediction, survival analysis, and advanced statistical monitoring.

## 1. Normal Distribution (Z-Score) Anomaly Detection

### Purpose
Detect anomalies in sensor readings using statistical methods.

### Formula
```
Z-score = (X - μ) / σ

Where:
- X = current reading
- μ = mean of historical readings
- σ = standard deviation of historical readings
```

### Anomaly Detection Rule
```
IF |Z-score| > threshold THEN
    anomaly = true
ELSE
    anomaly = false
END IF
```

### Typical Thresholds
- |Z| > 2: Mild anomaly (95% confidence)
- |Z| > 3: Strong anomaly (99.7% confidence)
- |Z| > 4: Extreme anomaly (99.99% confidence)

### Code Skeleton
```java
public class AnomalyDetector {
    private static final double Z_THRESHOLD = 3.0; // 3-sigma rule
    
    public double calculateZScore(double value, List<Double> historicalData) {
        double mean = calculateMean(historicalData);
        double stdDev = calculateStandardDeviation(historicalData, mean);
        
        if (stdDev == 0) return 0;
        
        return (value - mean) / stdDev;
    }
    
    public boolean isAnomalous(double value, List<Double> historicalData) {
        double zScore = calculateZScore(value, historicalData);
        return Math.abs(zScore) > Z_THRESHOLD;
    }
    
    private double calculateMean(List<Double> data) {
        return data.stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);
    }
    
    private double calculateStandardDeviation(List<Double> data, double mean) {
        double variance = data.stream()
            .mapToDouble(x -> Math.pow(x - mean, 2))
            .average()
            .orElse(0.0);
        return Math.sqrt(variance);
    }
}
```

---

## 2. Poisson Failure Prediction

### Purpose
Model the probability of machine failures using Poisson process.

### Formula
```
P(k failures in time t) = (λt)^k * e^(-λt) / k!

Where:
- λ (lambda) = failure rate (failures per unit time)
- t = time period
- k = number of failures
```

### Expected Number of Failures
```
E[Failures] = λt
```

### Probability of At Least One Failure
```
P(at least 1 failure) = 1 - P(0 failures)
                     = 1 - e^(-λt)
```

### Failure Rate Calculation
```
λ = total_failures / total_operating_time

Or from historical data:
λ = Σ(failures) / Σ(operating_hours)
```

### Code Skeleton
```java
public class PoissonFailurePredictor {
    
    public double calculateFailureRate(Machine machine) {
        long totalFailures = machine.getFailureHistory().size();
        long totalOperatingHours = machine.getOperatingHours();
        
        if (totalOperatingHours == 0) return 0.0;
        
        // Failures per hour
        return (double) totalFailures / totalOperatingHours;
    }
    
    public double predictFailureProbability(Machine machine, double timeHours) {
        double lambda = calculateFailureRate(machine);
        
        // P(at least 1 failure in time t)
        return 1 - Math.exp(-lambda * timeHours);
    }
    
    public double probabilityOfKFailures(double lambda, double timeHours, int k) {
        double lambdaT = lambda * timeHours;
        
        // P(k failures) = (λt)^k * e^(-λt) / k!
        double numerator = Math.pow(lambdaT, k) * Math.exp(-lambdaT);
        double denominator = factorial(k);
        
        return numerator / denominator;
    }
    
    private long factorial(int n) {
        if (n <= 1) return 1;
        long result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}
```

---

## 3. Survival Analysis Model

### Purpose
Calculate the probability that a machine will survive (not fail) until time t.

### Formula
```
P(survival until time t) = e^(-λt)

Where:
- λ (lambda) = failure rate (hazard rate)
- t = time period
```

### Hazard Rate (λ)
```
λ = -ln(S(t)) / t

Where S(t) is the survival probability at time t
```

### Mean Time To Failure (MTTF)
```
MTTF = 1 / λ
```

### Remaining Life Estimation
```
If current age = t0 and survival probability at t0 = S(t0)
Then remaining life = -ln(S(t0)) / λ
```

### Code Skeleton
```java
public class SurvivalAnalyzer {
    
    public double calculateSurvivalProbability(Machine machine, double timeHours) {
        double lambda = calculateHazardRate(machine);
        
        // P(survival) = e^(-λt)
        return Math.exp(-lambda * timeHours);
    }
    
    public double calculateHazardRate(Machine machine) {
        // From historical failure data
        List<FailureEvent> failures = machine.getFailureHistory();
        long totalOperatingHours = machine.getOperatingHours();
        
        if (totalOperatingHours == 0 || failures.isEmpty()) {
            // Default hazard rate based on machine type
            return getDefaultHazardRate(machine.getType());
        }
        
        // λ = number of failures / total operating time
        return (double) failures.size() / totalOperatingHours;
    }
    
    public double estimateRemainingLife(Machine machine) {
        double lambda = calculateHazardRate(machine);
        double currentAge = machine.getOperatingHours();
        
        // Current survival probability
        double currentSurvival = calculateSurvivalProbability(machine, currentAge);
        
        // Remaining life = -ln(S(t)) / λ
        if (currentSurvival > 0 && lambda > 0) {
            return -Math.log(currentSurvival) / lambda;
        }
        
        return Double.MAX_VALUE; // Infinite if no failures expected
    }
    
    public double meanTimeToFailure(Machine machine) {
        double lambda = calculateHazardRate(machine);
        
        if (lambda == 0) return Double.MAX_VALUE;
        
        // MTTF = 1 / λ
        return 1.0 / lambda;
    }
    
    private double getDefaultHazardRate(MachineType type) {
        // Default failure rates (failures per hour) by machine type
        switch (type) {
            case CRITICAL: return 0.0001; // 1 failure per 10,000 hours
            case STANDARD: return 0.00005; // 1 failure per 20,000 hours
            default: return 0.00001; // 1 failure per 100,000 hours
        }
    }
}
```

---

## 4. Combined Prediction Model

### Purpose
Combine multiple probability models for comprehensive failure prediction.

### Formula
```
P(failure) = w1 * P_anomaly + w2 * P_poisson + w3 * (1 - P_survival)

Where:
- w1, w2, w3 are weights (w1 + w2 + w3 = 1)
- P_anomaly = probability from anomaly detection
- P_poisson = probability from Poisson model
- P_survival = survival probability
```

### Code Skeleton
```java
public class CombinedPredictor {
    private static final double WEIGHT_ANOMALY = 0.3;
    private static final double WEIGHT_POISSON = 0.4;
    private static final double WEIGHT_SURVIVAL = 0.3;
    
    private AnomalyDetector anomalyDetector;
    private PoissonFailurePredictor poissonPredictor;
    private SurvivalAnalyzer survivalAnalyzer;
    
    public double predictFailureProbability(Machine machine, double timeHours) {
        // Get anomaly probability
        List<DataPoint> recentReadings = getRecentReadings(machine, 100);
        double anomalyProb = calculateAnomalyProbability(machine, recentReadings);
        
        // Get Poisson probability
        double poissonProb = poissonPredictor.predictFailureProbability(machine, timeHours);
        
        // Get survival probability
        double survivalProb = survivalAnalyzer.calculateSurvivalProbability(machine, timeHours);
        double failureFromSurvival = 1 - survivalProb;
        
        // Weighted combination
        double combinedProb = WEIGHT_ANOMALY * anomalyProb +
                             WEIGHT_POISSON * poissonProb +
                             WEIGHT_SURVIVAL * failureFromSurvival;
        
        return Math.min(1.0, Math.max(0.0, combinedProb)); // Clamp to [0, 1]
    }
    
    private double calculateAnomalyProbability(Machine machine, List<DataPoint> readings) {
        if (readings.isEmpty()) return 0.0;
        
        int anomalyCount = 0;
        List<Double> historicalValues = readings.stream()
            .map(DataPoint::getValue)
            .collect(Collectors.toList());
        
        for (DataPoint point : readings) {
            if (anomalyDetector.isAnomalous(point.getValue(), historicalValues)) {
                anomalyCount++;
            }
        }
        
        return (double) anomalyCount / readings.size();
    }
}
```

---

## 5. Model Validation and Calibration

### Cross-Validation
```
1. Split historical data into training and test sets
2. Train models on training set
3. Validate on test set
4. Adjust parameters based on accuracy
```

### Calibration Metrics
```
Accuracy = (True Positives + True Negatives) / Total
Precision = True Positives / (True Positives + False Positives)
Recall = True Positives / (True Positives + False Negatives)
F1-Score = 2 * (Precision * Recall) / (Precision + Recall)
```

### Threshold Tuning
```
For anomaly detection:
- Adjust Z_THRESHOLD based on false positive rate
- Lower threshold = more sensitive, more false positives
- Higher threshold = less sensitive, more false negatives
```

---

## 6. Real-Time Application

### Update Frequency
- Sensor readings: Every 1 second
- Anomaly detection: Every reading
- Poisson prediction: Every 10 seconds
- Survival analysis: Every 60 seconds
- Combined prediction: Every 10 seconds

### Performance Optimization
- Use sliding window for historical data (last N readings)
- Cache mean and standard deviation
- Update incrementally rather than recalculating
- Use exponential moving average for trend detection

