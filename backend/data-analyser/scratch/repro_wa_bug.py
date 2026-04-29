import os
import sys

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from data_analyser.data_average import DataAverage

def test_data_average_fix():
    # Mock analysis results
    # Log 1: injector1=1.0, idle_sec=100
    # Log 2: injector1=None, idle_sec=200
    analyses = [
        {
            "overall": {"duration": {"idle_sec": 100}},
            "engine": {"injector": {"injector1": 1.0}}
        },
        {
            "overall": {"duration": {"idle_sec": 200}},
            "engine": {"injector": {"injector1": None}}
        }
    ]
    
    # Initialize DataAverage
    da = DataAverage(analyses)
    
    # Check injector1 average
    # Expected: 1.0 (since only Log 1 has data)
    # Old behavior: 1.0 * 100 / (100 + 200) = 0.33
    result = da.result["engine"]["injector"]["injector1"]
    print(f"Injector1 Average: {result}")
    
    if result == 1.0:
        print("SUCCESS: Fix verified!")
    else:
        print(f"FAILURE: Expected 1.0, got {result}")

if __name__ == "__main__":
    test_data_average_fix()
