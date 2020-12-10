import pytest

from scheduler import *


def test_scheduler():
    global active_jobs
    init_scheduler()

    # Test adding jobs t
    args = [
        { 
            "query": "test",
            "location": None,
            "coordinates_only": False,
            "count": 10,
        },
        "message"
    ]

    assert not add_autopost_job("wrong_kind", list(args), 1, 3, "name")
    assert add_autopost_job("wordcloud", list(args), 1, 3, "name")
    assert add_autopost_job("histogram_week", list(args), 1, 3, "name")
    assert add_autopost_job("histogram_perc", list(args), 1, 3, "name")

    args.append("41.3,11.2")
    args.append(8)
    args.append("hybrid")
    assert add_autopost_job("map", args, 1, 3, "name")

    assert len(active_jobs) == 4

    #Test that the added jobs have valid fields and unique ids
    ids = set()
    for j in active_jobs:
        assert j["name"] == "name"
        assert j["id"] not in ids
        ids.add(j["id"])

    #Test deleting jobs
    delete_job(active_jobs[3]["id"])
    assert len(active_jobs) == 3

    #Test decrementing jobs
    decrement_job_count(active_jobs[0]["id"])
    assert len(active_jobs) == 3
    decrement_job_count(active_jobs[0]["id"])
    assert len(active_jobs) == 3
    decrement_job_count(active_jobs[0]["id"])
    assert len(active_jobs) == 2

    #Delete the remaining 2 jobs
    delete_job(active_jobs[0]["id"])
    delete_job(active_jobs[0]["id"])

    assert len(active_jobs) == 0

    