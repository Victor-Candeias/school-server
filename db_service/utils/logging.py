"""
logging.py

This module sets up the logging configuration for the application. It ensures that all logs
are written to a file in a structured format, including timestamps, log levels, and messages.

Features:
    - Automatically creates a log directory if it doesn't exist.
    - Generates a log file with the current date in its name.
    - Configures logging to append messages to the log file.
    - Handles exceptions during the logging setup process.

Dependencies:
    - logging: For logging messages to a file.
    - os: For working with file paths and directories.
    - pathlib.Path: For managing paths in a platform-independent way.
    - datetime: For generating timestamps and log file names.
"""

import logging  # Import the logging module to enable logging throughout the application
import os  # Import os for working with file paths and directories
from pathlib import Path  # Import Path to easily manage paths in a platform-independent way
from datetime import datetime  # Import datetime to generate timestamps for log files

try:
    # Define the log directory path by joining the current working directory with a 'log' folder
    log_directory = os.path.join(Path.cwd(), 'log')

    # Ensure the log directory exists. If not, it will be created.
    os.makedirs(log_directory, exist_ok=True)  # 'exist_ok=True' ensures no error if the directory already exists

    # Generate the log file name based on the current date (format: YYYYMMDD_log.log)
    log_file_name = datetime.now().strftime('%Y%m%d') + '_log.log'

    # Define the full log file path by joining the log directory with the generated log file name
    log_file_path = os.path.join(log_directory, log_file_name)

    # Set up the logging configuration
    logging.basicConfig(
        filename=log_file_path,  # Log file location
        filemode='a',  # File mode: 'a' for append, 'w' to overwrite the file on each run
        format='%(asctime)s - %(levelname)s - %(message)s',  # Log message format: includes timestamp, log level, and the message
        level=logging.INFO  # Log level: INFO (can also be DEBUG, WARNING, ERROR, CRITICAL)
    )

    # Log that logging has been set up successfully
    logging.info("Logging setup successfully.")
    
except Exception as e:
    # Handle any exceptions that occur during the setup process and print an error message
    print(f"Failed to set up logging: {e}")
