import pytest

from twitter import get_tweets
from application import application as app
import json


# Fixture to provide flask client for testing routes
@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client

# Fixture to provide tweets json for requests
@pytest.fixture
def tweets():
    tweets = get_tweets("test", None, False, 50)
    yield json.dumps(tweets, ensure_ascii=False)

# Fixture to provide json headers for requests
@pytest.fixture
def json_headers():
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    yield headers

# Test homepage
def test_home(client):
    rv = client.get('/')
    assert rv.status_code == 200

# Test trends api
def test_trends(client):
    rv = client.get('/trends')
    assert rv.status_code == 200

# Test frequency api
def test_get_frequency(client, tweets, json_headers):
    rv = client.post('/frequency/10', data=tweets, headers=json_headers)
    assert rv.status_code == 200

# Test collections api
def test_collections(client, tweets, json_headers):
    rv = client.get("/collections")    
    assert rv.status_code == 200

    collections = rv.get_json()
    assert collections

    data = {
        "name": "Test collection",
        "filters": {"word" : "test"},
        "data": json.loads(tweets),
        "date": "1/1/2001"
    }
    rv = client.post("/collections", data=json.dumps(data, ensure_ascii=False), headers=json_headers)
    assert rv.status_code == 200

    id = None
    new_collections = client.get("/collections").get_json()
    old_ids = set([c["id"] for c in collections])
    for c in new_collections:
        if c["id"] not in old_ids:
            assert id is None
            id = c["id"]

    rv = client.post("/collections/" + str(id) + "/add", data=json.dumps(data, ensure_ascii=False), headers=json_headers)
    assert rv.status_code == 200

    rv = client.post("/collections/" + str(id)+ "/name", data=json.dumps({"name" : "new test name"}), headers=json_headers)
    assert rv.status_code == 200

    rv = client.get("/collections/" + str(id))
    assert rv.status_code == 200

    c = rv.get_json()
    assert c["id"] == id
    assert c["name"] == "new test name"

    rv = client.delete("/collections/" + str(id))
    assert rv.status_code == 200

#Test stream api
def test_stream(client):
    #Start a stream without parameters expecting to fail
    rv = client.get("/streamStart")
    assert rv.status_code == 400

    rv = client.get("/streamStart?keyword=test")
    assert rv.status_code == 200

    rv = client.get("/streamUpdate/0")
    assert rv.status_code == 200

    #Ask for data too far into the stream expecting to fail
    rv = client.get("/streamUpdate/9999")
    assert rv.status_code == 400

    rv = client.get("/streamStop")
    assert rv.status_code == 200

#Test search api
def test_search(client):
    rv = client.get("/search", query_string={"keyword": "test"})
    assert rv.status_code == 200

#Test autopost api
def test_active_post(client):
    rv = client.get("/getActivePost")
    assert rv.status_code == 200
