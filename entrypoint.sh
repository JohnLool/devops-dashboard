#!/bin/bash


echo "Waiting for the database to be ready..."
while ! pg_isready -h db -U $DB_USER; do
  sleep 2
done


echo "Applying migrations..."
alembic upgrade head


echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload