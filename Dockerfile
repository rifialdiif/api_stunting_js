# 1. Gunakan base image Python resmi
FROM python:3.9-slim

# 2. Atur direktori kerja di dalam container
WORKDIR /code

# 3. Salin file requirements dan install dependensi
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 4. Salin semua file proyek Anda ke dalam container
COPY . /code/

# 5. Jalankan server Uvicorn saat container dimulai
# Hugging Face Spaces menggunakan port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]