"""
Root conftest.py — ensures the test database has pgvector extension
BEFORE Django migrations run. This is necessary because some migrations
reference the vector type.
"""
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import pytest


def _ensure_pgvector_on_test_db():
    """
    Ensure pgvector is installed on template1 so that every database
    Postgres creates from it (including the one Django's setup_databases
    creates fresh each run) automatically has the extension available.
    """
    from dotenv import load_dotenv
    load_dotenv()

    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')

    # Connect to template1 and install pgvector there.
    # Every database created afterward (via CREATE DATABASE) will
    # inherit this extension automatically.
    conn = psycopg2.connect(
        dbname='template1',
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port,
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    try:
        cur.execute('CREATE EXTENSION IF NOT EXISTS vector;')
    except psycopg2.errors.InsufficientPrivilege:
        # db_user is not a superuser and cannot modify template1.
        # This is only a hard failure if vector isn't ALREADY on template1
        # (verify manually: psql -U postgres -d template1 -c "\dx").
        # If it's missing, run once as a superuser:
        #   psql -U postgres -d template1 -c "CREATE EXTENSION IF NOT EXISTS vector;"
        print(
            "\n!!! WARNING: could not install 'vector' extension on template1 "
            f"(user '{db_user}' lacks privilege). If it's not already installed "
            "there, migrations using VectorField will fail. Run manually as a "
            "superuser: psql -U postgres -d template1 -c "
            "\"CREATE EXTENSION IF NOT EXISTS vector;\"\n"
        )
    finally:
        cur.close()
        conn.close()


@pytest.fixture(scope='session')
def django_db_setup(django_test_environment, django_db_blocker):
    """
    Override default DB setup to install pgvector BEFORE migrations.
    """
    from django.test.utils import setup_databases, teardown_databases

    # Install pgvector on template1 before Django creates the test DB
    _ensure_pgvector_on_test_db()

    with django_db_blocker.unblock():
        db_cfg = setup_databases(
            verbosity=0,
            interactive=False,
            keepdb=False,
        )

    yield

    with django_db_blocker.unblock():
        teardown_databases(db_cfg, verbosity=0)