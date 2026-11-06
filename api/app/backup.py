"""python -m app.backup /backups/contact-2026-11-06.db

Writes a consistent copy of the live database with VACUUM INTO.
"""

import sys

from app import db
from app.config import Settings

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python -m app.backup DESTINATION")
    db.backup(Settings.from_env().database_path, sys.argv[1])
    print(f"backup written to {sys.argv[1]}")
