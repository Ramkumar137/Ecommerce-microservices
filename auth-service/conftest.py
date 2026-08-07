import sys
import os

# Add parent directory to sys.path so shared_testing can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from shared_testing.fixtures import *  # noqa: F401, F403
