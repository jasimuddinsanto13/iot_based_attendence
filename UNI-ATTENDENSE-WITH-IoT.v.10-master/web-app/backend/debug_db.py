import psycopg2
from psycopg2 import sql
import os

POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = int(os.getenv('POSTGRES_PORT', 5432))
POSTGRES_DB = os.getenv('POSTGRES_DB', 'attendance_db')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'attendance_user')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'SecurePass123!')

print('connecting to', POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER)
conn = psycopg2.connect(dbname=POSTGRES_DB, user=POSTGRES_USER, password=POSTGRES_PASSWORD, host=POSTGRES_HOST, port=POSTGRES_PORT)
cur = conn.cursor()
for table in ['registration_requests', 'users', 'students']:
    cur.execute(sql.SQL('SELECT to_regclass(%s)'), (table,))
    print(table, cur.fetchone()[0])
cur.close()
conn.close()
