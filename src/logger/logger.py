import logging
from pathlib import Path
from datetime import datetime

# Create logs directory
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Log file
LOG_FILE = LOG_DIR / f"{datetime.now().strftime('%Y_%m_%d_%H_%M_%S')}.log"

# Configure logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
