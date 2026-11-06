"""In-memory sliding-window rate limit.

Enough for one worker on one machine; the counts reset when the API restarts.
"""

import time
from collections import deque
from threading import Lock

HOUR = 3600.0
SHARED = "shared"


class RateLimiter:
    def __init__(self, per_key: int, global_limit: int, window: float = HOUR, clock=time.monotonic) -> None:
        self.per_key = per_key
        self.global_limit = global_limit
        self.window = window
        self.clock = clock
        self._hits: dict[str, deque[float]] = {}
        self._global: deque[float] = deque()
        self._lock = Lock()

    def _trim(self, hits: deque[float], now: float) -> None:
        while hits and now - hits[0] >= self.window:
            hits.popleft()

    def allow(self, key: str) -> bool:
        """Records a hit and says whether it is within the limits.

        Without a visitor IP (key == SHARED) only the global limit applies.
        """
        with self._lock:
            now = self.clock()
            self._trim(self._global, now)
            if len(self._global) >= self.global_limit:
                return False
            if key != SHARED:
                hits = self._hits.setdefault(key, deque())
                self._trim(hits, now)
                if len(hits) >= self.per_key:
                    return False
                hits.append(now)
                # Drop visitors whose window has emptied, so memory stays small.
                for stale in [k for k, v in self._hits.items() if v and now - v[-1] >= self.window]:
                    del self._hits[stale]
            self._global.append(now)
            return True
