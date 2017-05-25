import csv
import numpy as np

input_path = 'LayerID_USSchoolDistrict.csv'
output_path = 'output.csv'
count = 0

with open (input_path, 'r') as f:
	reader = csv.reader(f)
	with open (output_path, 'w') as f2:
		writer = csv.writer(f2)
		writer.writerow(['name', 'catID', 'yearOne', 'yearTwo'])
		for line in reader:
			array = np.array(line)
			if array[0] != 'Category':
				if array[0] != '':
					count += 1
				writer.writerow([array[1], count, array[2], array[3]])