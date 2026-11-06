"""Read-only facts about the laptop for /api/health: uptime, load and memory.

Nothing that identifies the machine: no hostname, IPs, versions or paths.
"""

import os
from pathlib import Path


def host_uptime_seconds() -> int | None:
    try:
        return int(float(Path("/proc/uptime").read_text().split()[0]))
    except (OSError, ValueError, IndexError):
        return None


def load_average() -> list[float] | None:
    try:
        return [round(value, 2) for value in os.getloadavg()]
    except OSError:
        return None


def memory_mb() -> dict[str, int] | None:
    try:
        fields = {}
        for line in Path("/proc/meminfo").read_text().splitlines():
            key, value = line.split(":", 1)
            fields[key] = int(value.split()[0])
        return {"total": fields["MemTotal"] // 1024, "available": fields["MemAvailable"] // 1024}
    except (OSError, ValueError, KeyError):
        return None
