FROM python:3.11

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY . .
COPY entrypoint.sh .
COPY requirements.txt .

RUN chmod +x /app/entrypoint.sh

RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]