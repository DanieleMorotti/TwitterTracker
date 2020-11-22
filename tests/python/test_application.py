import pytest
from application import application as app

@pytest.fixture
def client():
    app.config["TESTING"] = True;

    with app.test_client() as client:
        yield client

def test_home(client):
    rv = client.get('/')
    assert rv.status_code == 200
