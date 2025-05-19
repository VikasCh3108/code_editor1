# Dockerfile for Django Backend
FROM python:3.11.8-slim

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port (default Django)
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "python core/manage.py migrate && python core/manage.py runserver 0.0.0.0:8000"]
