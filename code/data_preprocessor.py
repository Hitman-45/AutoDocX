def clean_data(data):
    return [item.strip().lower() for item in data if isinstance(item, str)]

def compute_average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

def filter_outliers(data, threshold=2):
    mean = compute_average(data)
    return [x for x in data if abs(x - mean) < threshold]
