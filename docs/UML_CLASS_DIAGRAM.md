# UML Class Diagram

## Complete Class Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CORE CLASSES                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐
│         <<abstract>>            │
│           Sensor                │
├─────────────────────────────────┤
│ - sensorId: String              │
│ - machineId: String             │
│ - sensorType: SensorType        │
│ - lastReading: double           │
│ - timestamp: long               │
│ - threshold: Threshold          │
├─────────────────────────────────┤
│ + read(): double                │
│ + getSensorId(): String         │
│ + getMachineId(): String        │
│ + getLastReading(): double      │
│ + isAnomalous(): boolean        │
└────────────┬────────────────────┘
             │
             │ (inheritance)
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    │                 │              │              │
┌───▼────┐    ┌───────▼────┐  ┌──────▼────┐  ┌──────▼────┐
│Temperature│  │ Vibration │  │ Pressure  │  │    RPM    │
│  Sensor   │  │  Sensor   │  │  Sensor   │  │  Sensor   │
├───────────┤  ├───────────┤  ├───────────┤  ├───────────┤
│ - baseTemp│  │ - baseVib │  │ - basePres│  │ - baseRPM │
│ - drift   │  │ - noise   │  │ - variance│  │ - variance│
└───────────┘  └───────────┘  └───────────┘  └───────────┘

┌─────────────────────────────────┐
│          Machine                │
├─────────────────────────────────┤
│ - machineId: String             │
│ - name: String                  │
│ - status: MachineStatus         │
│ - sensors: List<Sensor>         │
│ - spareParts: List<SparePart>   │
│ - consumables: List<Consumable> │
│ - lastMaintenance: Date         │
│ - operatingHours: long          │
├─────────────────────────────────┤
│ + addSensor(Sensor): void       │
│ + updateStatus(): void          │
│ + getHealthScore(): double      │
│ + getSensors(): List<Sensor>    │
│ + getConsumables(): List<Consumable>│
└────────────┬────────────────────┘
             │
             │ (composition)
             │
┌────────────▼────────────────────┐
│        SparePart                │
├─────────────────────────────────┤
│ - partId: String                │
│ - partName: String              │
│ - installationDate: Date        │
│ - expectedLifetime: long        │
│ - currentWear: double            │
│ - status: PartStatus            │
├─────────────────────────────────┤
│ + calculateWear(): double       │
│ + needsReplacement(): boolean   │
│ + getRemainingLife(): double    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        Consumable               │
├─────────────────────────────────┤
│ - consumableId: String          │
│ - type: ConsumableType          │
│ - currentLevel: double          │
│ - maxLevel: double              │
│ - minLevel: double              │
│ - consumptionRate: double       │
│ - lastRefill: Date              │
├─────────────────────────────────┤
│ + consume(amount): void         │
│ + refill(amount): void          │
│ + getPercentage(): double       │
│ + needsRefill(): boolean        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         DataPoint               │
├─────────────────────────────────┤
│ - timestamp: long               │
│ - sensorId: String              │
│ - machineId: String             │
│ - value: double                 │
│ - sensorType: SensorType        │
├─────────────────────────────────┤
│ + getTimestamp(): long          │
│ + getValue(): double            │
│ + toJSON(): String              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│           Alert                 │
├─────────────────────────────────┤
│ - alertId: String               │
│ - machineId: String             │
│ - severity: AlertSeverity        │
│ - type: AlertType               │
│ - message: String               │
│ - timestamp: long               │
│ - acknowledged: boolean         │
├─────────────────────────────────┤
│ + acknowledge(): void           │
│ + getSeverity(): AlertSeverity  │
│ + isCritical(): boolean         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│       MachineManager            │
│      <<singleton>>              │
├─────────────────────────────────┤
│ - machines: Map<String, Machine>│
│ - instance: MachineManager      │
├─────────────────────────────────┤
│ + getInstance(): MachineManager │
│ + addMachine(Machine): void     │
│ + getMachine(String): Machine   │
│ + getAllMachines(): List<Machine>│
│ + updateMachineData(String, DataPoint): void│
└────────────┬────────────────────┘
             │
             │ (uses)
             │
┌────────────▼────────────────────┐
│       AlertManager              │
│      <<singleton>>              │
├─────────────────────────────────┤
│ - alerts: PriorityQueue<Alert>  │
│ - alertHistory: List<Alert>     │
│ - instance: AlertManager        │
├─────────────────────────────────┤
│ + getInstance(): AlertManager   │
│ + createAlert(Alert): void      │
│ + getActiveAlerts(): List<Alert>│
│ + acknowledgeAlert(String): void│
│ + getAlertsByMachine(String): List<Alert>│
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      PredictionEngine           │
├─────────────────────────────────┤
│ - zScoreThreshold: double       │
│ - failureRate: double           │
│ - survivalLambda: double        │
├─────────────────────────────────┤
│ + detectAnomaly(List<DataPoint>): boolean│
│ + predictFailure(Machine): double│
│ + calculateSurvivalProbability(Machine, long): double│
│ + calculateZScore(double, List<Double>): double│
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      DAA Algorithms             │
├─────────────────────────────────┤
│ + slidingWindow(List<T>, int): List<T>│
│ + binarySearchThreshold(List<DataPoint>, double): int│
│ + greedyMaintenanceSchedule(List<Machine>): List<Machine>│
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      DataRepository             │
├─────────────────────────────────┤
│ - dbPath: String                │
│ - connection: Connection        │
├─────────────────────────────────┤
│ + saveDataPoint(DataPoint): void│
│ + getDataPoints(String, long, long): List<DataPoint>│
│ + saveAlert(Alert): void        │
│ + getAlerts(long, long): List<Alert>│
│ + savePrediction(String, double): void│
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      SensorSimulator            │
├─────────────────────────────────┤
│ - machines: List<Machine>       │
│ - running: boolean              │
│ - interval: long                │
├─────────────────────────────────┤
│ + start(): void                 │
│ + stop(): void                  │
│ + generateData(Machine): JSONObject│
│ + addNoise(double): double      │
│ + addDrift(double, long): double│
│ + addSpike(double): double      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      REST API Controllers       │
├─────────────────────────────────┤
│ + getMachines(): List<Machine>  │
│ + getMachine(String): Machine   │
│ + getAlerts(): List<Alert>      │
│ + getPredictions(String): Map   │
│ + getTrends(String): List       │
│ + getConsumables(String): List<Consumable>│
└─────────────────────────────────┘
```

## Class Relationships

### Inheritance Hierarchy
- `Sensor` (abstract) → `TemperatureSensor`, `VibrationSensor`, `PressureSensor`, `RPMSensor`

### Composition
- `Machine` contains `List<Sensor>`, `List<SparePart>`, `List<Consumable>`
- `Machine` uses `DataPoint` objects

### Aggregation
- `MachineManager` manages `Machine` objects
- `AlertManager` manages `Alert` objects

### Dependencies
- `PredictionEngine` uses `Machine` and `DataPoint`
- `DataRepository` stores `DataPoint` and `Alert`
- `SensorSimulator` generates data for `Machine`
- REST Controllers use `MachineManager`, `AlertManager`, `PredictionEngine`

## Design Principles Applied

1. **Encapsulation**: All classes have private fields with public getters/setters
2. **Abstraction**: `Sensor` is abstract, concrete implementations handle specifics
3. **Inheritance**: Sensor types inherit from base `Sensor` class
4. **Polymorphism**: Different sensor types can be used interchangeably
5. **Single Responsibility**: Each class has one clear purpose
6. **Dependency Injection**: Managers can be injected into controllers

