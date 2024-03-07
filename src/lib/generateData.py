import csv 
import numpy as np
import pandas as pd

num_points = 50

time = np.arange(0, num_points)


ignition_at = 12
cutoff_at = 37
anomaly_at = 43
nozzleTemperature = np.zeros(num_points)
chamberTemperature = np.zeros(num_points)
nozzlePressure = np.zeros(num_points)
chamberPressure = np.zeros(num_points)
thrust = np.zeros(num_points)
fuelFlowRate = np.zeros(num_points)

for i in range(ignition_at, cutoff_at):
    scale_factor = (i - ignition_at) / (cutoff_at - ignition_at)
    nozzleTemperature[i] = scale_factor * np.random.normal(loc=2500, scale=100)
    chamberTemperature[i] = scale_factor * np.random.normal(loc=3300, scale=150)

nozzlePressure[ignition_at:cutoff_at] = np.random.normal(loc=50, scale=5, size=cutoff_at-ignition_at)
chamberPressure[ignition_at:cutoff_at] = np.random.normal(loc=70, scale=5, size=cutoff_at-ignition_at)
thrust[ignition_at:cutoff_at] = np.random.normal(loc=150, scale=10, size=cutoff_at-ignition_at)
fuelFlowRate[ignition_at:cutoff_at] = np.random.normal(loc=1, scale=0.1, size=cutoff_at-ignition_at)

for i in range(anomaly_at, num_points):
    #nozzleTemperature[i] = np.random.normal(loc=2700 + (i - anomaly_at) * 10, scale=200)
    #chamberTemperature[i] = np.random.normal(loc=3500 + (i - anomaly_at) * 12, scale=200)
    nozzlePressure[i] = np.random.normal(loc=30 - (i - anomaly_at) * 0.5, scale=5)
    chamberPressure[i] = np.random.normal(loc=45 - (i - anomaly_at) * 0.75, scale=5)
    thrust[i] = np.random.normal(loc=100 - (i - anomaly_at) * 2, scale=15)
    fuelFlowRate[i] = np.random.normal(loc=1.2 + (i - anomaly_at) * 0.02, scale=0.2)

gradual_df = pd.DataFrame({
    'time': time,
    'nozzleTemperature': nozzleTemperature,
    'chamberTemperature': chamberTemperature,
    'nozzlePressure': nozzlePressure,
    'chamberPressure': chamberPressure,
    'thrust': thrust,
    'fuelFlowRate': fuelFlowRate
})



gradual_df.to_csv('/Users/elyasmasrour/Documents/localRepos/annotate-anomalies/src/lib/data.csv', index=False)
