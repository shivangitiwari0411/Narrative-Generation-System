# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# Manually install pydantic, loguru, pytest since they might not be in the original requirements.txt if it wasn't updated
RUN pip install --no-cache-dir pydantic pydantic-settings loguru pytest pytest-mock

# Define environment variable
# ENV OPENROUTER_API_KEY=your_api_key_here

# Expose the port the app runs on
EXPOSE 10000

# Run the FastAPI server using Uvicorn
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "10000"]
