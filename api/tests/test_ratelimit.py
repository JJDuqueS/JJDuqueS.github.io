from app.ratelimit import SHARED, RateLimiter


def test_window_slides() -> None:
    now = [0.0]
    limiter = RateLimiter(per_key=2, global_limit=10, window=60, clock=lambda: now[0])
    assert [limiter.allow("a") for _ in range(3)] == [True, True, False]
    now[0] = 61
    assert limiter.allow("a") is True


def test_shared_key_only_counts_against_the_global_limit() -> None:
    limiter = RateLimiter(per_key=1, global_limit=3)
    assert [limiter.allow(SHARED) for _ in range(4)] == [True, True, True, False]
