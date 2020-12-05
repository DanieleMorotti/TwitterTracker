import pytest

from scheduler import *


def test_scheduler():
    global active_jobs
    init_scheduler()

    # Test adding jobs t
    args = {
        "params": { 
            "query": "test",
            "location": None,
            "coordinates_only": False,
            "count": 10,
        },
        "mess": "message"
    }

    assert not add_autopost_job("wrong_kind", args, 1, 3, "name")
    assert add_autopost_job("wordcloud", args, 1, 3, "name")
    assert add_autopost_job("histogram_week", args, 1, 3, "name")
    assert add_autopost_job("histogram_perc", args, 1, 3, "name")

    args["center"] = "41.3,11.2"
    args["zoom"] = 8
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

    #Delete the remaining 3 obs
    delete_job(active_jobs[0]["id"])    
    delete_job(active_jobs[0]["id"])
    delete_job(active_jobs[0]["id"])

    assert len(active_jobs) == 0

    