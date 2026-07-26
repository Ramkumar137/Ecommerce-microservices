import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from mangum import Mangum
from config.asgi import application

lambda_handler = Mangum(application, lifespan="off")