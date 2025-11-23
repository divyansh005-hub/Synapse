# DAA Algorithms - Pseudocode and Implementation

> [!NOTE]
> **Future Work**: These algorithms are documented as reference material for future enhancements. The current implementation uses a simpler WebSocket streaming architecture. These algorithms can be integrated when adding features like advanced prediction, maintenance scheduling, and historical data analysis.

## 1. Priority Queue for Alerts

### Purpose
Maintain alerts sorted by severity and timestamp for efficient retrieval.

### Pseudocode
```
ALGORITHM PriorityQueueAlerts
BEGIN
    PriorityQueue<Alert> alertQueue
    
    FUNCTION addAlert(alert)
        alertQueue.insert(alert) // O(log n)
    END FUNCTION
    
    FUNCTION getHighestPriorityAlert()
        RETURN alertQueue.peek() // O(1)
    END FUNCTION
    
    FUNCTION removeAlert(alertId)
        FOR each alert in alertQueue
            IF alert.id == alertId THEN
                alertQueue.remove(alert) // O(n)
                BREAK
            END IF
        END FOR
    END FUNCTION
    
    FUNCTION getAllAlerts()
        RETURN alertQueue.toList() // O(n)
    END FUNCTION
END
```

### Comparator Logic
```
COMPARATOR AlertComparator
    FUNCTION compare(alert1, alert2)
        // First compare by severity (CRITICAL > HIGH > MEDIUM > LOW)
        IF alert1.severity != alert2.severity THEN
            RETURN severityOrder(alert1.severity) - severityOrder(alert2.severity)
        END IF
        
        // Then by timestamp (older first)
        RETURN alert1.timestamp - alert2.timestamp
    END FUNCTION
END
```

### Time Complexity
- Insert: O(log n)
- Peek: O(1)
- Remove: O(n) - can be optimized with HashMap index
- GetAll: O(n)

---

## 2. Sliding Window Algorithm for Last N Readings

### Purpose
Efficiently maintain the last N sensor readings for trend analysis.

### Pseudocode
```
ALGORITHM SlidingWindow
BEGIN
    Queue<DataPoint> window
    INT maxSize = N
    
    FUNCTION addReading(dataPoint)
        window.enqueue(dataPoint) // O(1)
        
        IF window.size() > maxSize THEN
            window.dequeue() // O(1)
        END IF
    END FUNCTION
    
    FUNCTION getLastNReadings()
        RETURN window.toList() // O(n)
    END FUNCTION
    
    FUNCTION getAverage()
        sum = 0
        FOR each point in window
            sum += point.value
        END FOR
        RETURN sum / window.size() // O(n)
    END FUNCTION
    
    FUNCTION getMax()
        max = -INFINITY
        FOR each point in window
            IF point.value > max THEN
                max = point.value
            END IF
        END FOR
        RETURN max // O(n)
    END FUNCTION
    
    FUNCTION getMin()
        min = INFINITY
        FOR each point in window
            IF point.value < min THEN
                min = point.value
            END IF
        END FOR
        RETURN min // O(n)
    END FUNCTION
END
```

### Circular Buffer Optimization
```
ALGORITHM CircularBufferSlidingWindow
BEGIN
    DataPoint[] buffer
    INT head = 0
    INT tail = 0
    INT size = 0
    INT capacity = N
    
    FUNCTION addReading(dataPoint)
        buffer[tail] = dataPoint
        tail = (tail + 1) % capacity
        
        IF size < capacity THEN
            size++
        ELSE
            head = (head + 1) % capacity
        END IF
    END FUNCTION
    
    FUNCTION getLastNReadings()
        result = []
        FOR i = 0 TO size - 1
            index = (head + i) % capacity
            result.add(buffer[index])
        END FOR
        RETURN result // O(n)
    END FUNCTION
END
```

### Time Complexity
- Add: O(1)
- GetLastN: O(n)
- Average/Max/Min: O(n)

---

## 3. Greedy Scheduling Algorithm for Maintenance Order

### Purpose
Schedule maintenance tasks to minimize downtime and maximize machine availability.

### Pseudocode
```
ALGORITHM GreedyMaintenanceScheduler
BEGIN
    FUNCTION scheduleMaintenance(machines)
        // Sort machines by urgency score (greedy choice)
        sortedMachines = sortByUrgency(machines)
        
        maintenanceSchedule = []
        currentTime = 0
        
        FOR each machine in sortedMachines
            urgency = calculateUrgency(machine)
            maintenanceTime = estimateMaintenanceTime(machine)
            
            scheduleEntry = {
                machine: machine,
                startTime: currentTime,
                endTime: currentTime + maintenanceTime,
                urgency: urgency
            }
            
            maintenanceSchedule.add(scheduleEntry)
            currentTime += maintenanceTime
        END FOR
        
        RETURN maintenanceSchedule
    END FUNCTION
    
    FUNCTION calculateUrgency(machine)
        // Higher score = more urgent
        healthScore = machine.getHealthScore()
        failureProbability = predictionEngine.predictFailure(machine)
        consumableUrgency = calculateConsumableUrgency(machine)
        
        urgency = (1 - healthScore) * 0.4 + 
                  failureProbability * 0.4 + 
                  consumableUrgency * 0.2
        
        RETURN urgency
    END FUNCTION
    
    FUNCTION calculateConsumableUrgency(machine)
        maxUrgency = 0
        FOR each consumable in machine.getConsumables()
            percentage = consumable.getPercentage()
            IF percentage < 20 THEN
                urgency = (20 - percentage) / 20
                maxUrgency = MAX(maxUrgency, urgency)
            END IF
        END FOR
        RETURN maxUrgency
    END FUNCTION
END
```

### Greedy Choice Strategy
1. **Urgency-based**: Machines with higher failure probability first
2. **Time-based**: Shortest maintenance time first (alternative)
3. **Cost-based**: Highest cost of failure first (alternative)

### Time Complexity
- Sort: O(n log n)
- Schedule: O(n)
- Total: O(n log n)

---

## 4. Binary Search for Threshold Crossings

### Purpose
Efficiently find when sensor values crossed a threshold in historical data.

### Pseudocode
```
ALGORITHM BinarySearchThreshold
BEGIN
    FUNCTION findThresholdCrossing(readings, threshold, direction)
        // readings must be sorted by timestamp
        left = 0
        right = readings.length - 1
        result = -1
        
        WHILE left <= right
            mid = (left + right) / 2
            
            IF direction == "ABOVE" THEN
                IF readings[mid].value >= threshold THEN
                    // Check if previous value was below
                    IF mid == 0 OR readings[mid-1].value < threshold THEN
                        result = mid
                        BREAK
                    END IF
                    right = mid - 1
                ELSE
                    left = mid + 1
                END IF
            ELSE IF direction == "BELOW" THEN
                IF readings[mid].value <= threshold THEN
                    // Check if previous value was above
                    IF mid == 0 OR readings[mid-1].value > threshold THEN
                        result = mid
                        BREAK
                    END IF
                    right = mid - 1
                ELSE
                    left = mid + 1
                END IF
            END IF
        END WHILE
        
        RETURN result
    END FUNCTION
    
    FUNCTION findAllCrossings(readings, threshold)
        crossings = []
        currentDirection = null
        
        FOR i = 1 TO readings.length - 1
            prevValue = readings[i-1].value
            currValue = readings[i].value
            
            IF prevValue < threshold AND currValue >= threshold THEN
                crossings.add({
                    index: i,
                    timestamp: readings[i].timestamp,
                    direction: "ABOVE"
                })
            ELSE IF prevValue > threshold AND currValue <= threshold THEN
                crossings.add({
                    index: i,
                    timestamp: readings[i].timestamp,
                    direction: "BELOW"
                })
            END IF
        END FOR
        
        RETURN crossings
    END FUNCTION
    
    FUNCTION findFirstCrossingAfter(readings, threshold, startTime)
        // Binary search for first reading after startTime
        left = 0
        right = readings.length - 1
        startIndex = -1
        
        WHILE left <= right
            mid = (left + right) / 2
            IF readings[mid].timestamp >= startTime THEN
                startIndex = mid
                right = mid - 1
            ELSE
                left = mid + 1
            END IF
        END WHILE
        
        IF startIndex == -1 THEN
            RETURN -1
        END IF
        
        // Linear search from startIndex for crossing
        FOR i = startIndex TO readings.length - 1
            IF i > 0 AND isCrossing(readings[i-1], readings[i], threshold) THEN
                RETURN i
            END IF
        END FOR
        
        RETURN -1
    END FUNCTION
END
```

### Time Complexity
- Binary search: O(log n)
- Find all crossings: O(n)
- Find first after timestamp: O(log n + k) where k is distance to crossing

---

## 5. Combined Algorithm Usage Example

```
ALGORITHM RealTimeMonitoring
BEGIN
    // Initialize
    slidingWindow = new SlidingWindow(100) // Last 100 readings
    alertQueue = new PriorityQueue<Alert>(new AlertComparator())
    
    // Process incoming data
    FUNCTION processSensorData(dataPoint)
        // Add to sliding window
        slidingWindow.addReading(dataPoint)
        
        // Check threshold crossing
        IF dataPoint.value > dataPoint.threshold THEN
            crossingIndex = binarySearchThreshold.findFirstCrossingAfter(
                historicalReadings, 
                dataPoint.threshold, 
                lastCheckTime
            )
            
            IF crossingIndex != -1 THEN
                alert = new Alert(
                    machineId: dataPoint.machineId,
                    severity: calculateSeverity(dataPoint),
                    message: "Threshold crossed"
                )
                alertQueue.addAlert(alert)
            END IF
        END IF
        
        // Analyze trends using sliding window
        recentReadings = slidingWindow.getLastNReadings()
        average = slidingWindow.getAverage()
        
        // Update last check time
        lastCheckTime = dataPoint.timestamp
    END FUNCTION
    
    // Schedule maintenance
    FUNCTION scheduleMaintenance()
        machines = machineManager.getAllMachines()
        schedule = greedyScheduler.scheduleMaintenance(machines)
        RETURN schedule
    END FUNCTION
END
```

---

## Algorithm Selection Rationale

1. **Priority Queue**: Essential for alert management with O(log n) insertion
2. **Sliding Window**: Efficient for real-time trend analysis with O(1) updates
3. **Greedy Scheduling**: Provides near-optimal maintenance scheduling in O(n log n)
4. **Binary Search**: Fast threshold detection in O(log n) for sorted data

