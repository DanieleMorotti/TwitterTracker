import pytest

import os
from tweets import *

#Test that ids are unique
def test_get_next_id():
    ids = set()
    for i in range(50):
        new_id = get_next_id()
        assert new_id not in ids
        ids.add(new_id)

#Test that info returns valid values and that they refer to accessible files
def test_get_stored_tweets_info():
    info = get_stored_tweets_info()
    for i in info:
        assert "id" in i
        assert "name" in i
        assert "count" in i

        path = get_tweets_path_from_id(i["id"])
        assert os.access(path, os.R_OK | os.W_OK)

#Test operations on tweets
def test_create_update_delete():
    info = {
        "name": "test name",
        "data": [ 
            {"id": "1234", "text": "test"}, 
            {"id": "4321", "text": "other"}
        ]
    }
    
    #test storing of a new collection
    store_tweets(info)
    assert "id" in info and info["count"] == 2
    id = info["id"]

    #test updating the name of the collection
    success = update_tweets_name(id, "new name")
    assert success
    
    stored = get_stored_tweet(id)
    assert stored and stored["id"] == id
    assert stored["name"] == "new name"
    assert len(stored["data"]) == 2

    #test adding tweets
    tweets_to_add = [ 
        {"id": "5679", "text": "test"}, #new tweet
        {"id": "4321", "text": "other"} #old tweet, should not be added because of the same id
    ]
    success = add_tweets(id, tweets_to_add)
    assert success
    stored = get_stored_tweet(id)
    assert stored and stored["count"] == 3

    #test that the new tweet has been added and it's there only once
    new_found = False
    for t in stored["data"]:
        if t["id"] == "5679":
            assert not new_found
            new_found = True
    assert new_found

    #test deleting tweets
    success = delete_stored_tweet(id)
    assert success
    old_path = get_tweets_path_from_id(id)
    assert not os.path.exists(old_path)






        