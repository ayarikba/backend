FROM python:3.9.12

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the requirements file into the container at /usr/src/app/
COPY requirements.txt .
COPY ft_transcendence .

# Upgrade pip and install dependencies --no-cache-dir
RUN python3 -m pip install --upgrade pip \
    && pip install -r requirements.txt

# Set the Django settings module
ENV DJANGO_SETTINGS_MODULE ft_transcendence.settings

# Make migrations and expose port
EXPOSE 8000
RUN python3 manage.py collectstatic --noinput
RUN python3 manage.py makemigrations


CMD python manage.py migrate && python manage.py collectstatic --noinput && uvicorn ft_transcendence.asgi:application  --host 0.0.0.0 --ssl-keyfile=localhost.key --ssl-certfile=localhost.crt --port 8000 --ws 'websockets'
