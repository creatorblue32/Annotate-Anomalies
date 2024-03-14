import csv
import random

# Define the headers
headers = ['time', 'a', 'b', 'c', 'd', 'e', 'f']

print("Generating!")

# Generate random integers for 50 rows
rows = [[i] + [random.randint(0, 10) for _ in range(6)] for i in range(1000000)]

# Create and write to the csv file
csv_file_path = '/Users/elyasmasrour/Documents/localRepos/annotate-anomalies/src/lib/testDataLarge.csv'
with open(csv_file_path, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(headers)
    writer.writerows(rows)
