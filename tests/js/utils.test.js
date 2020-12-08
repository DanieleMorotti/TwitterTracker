import * as util from '../../static/js/utils.js';

test('split coordinates', () => {
    let coordinates = "41.213,11.315";
    let p = util.splitCoordinatesIntoLatLng(coordinates);

    expect(p.lat).toBeCloseTo(41.213);
    expect(p.lng).toBeCloseTo(11.315);

    let wrong1 = "42.235";
    expect(util.splitCoordinatesIntoLatLng(wrong1)).toBeNull();
    let wrong2 = "hello";
    expect(util.splitCoordinatesIntoLatLng(wrong2)).toBeNull();
});

test('date as a string', () => {
    expect(util.getDateString()).toMatch(/\d+\/\d+\/\d+/);
});

test('twitter embedded url', () => {
    expect(util.getEmbeddedTweetUrl("test", "12345")).toMatch("https://twitter.com/test/status/12345");
    expect(util.getEmbeddedTweetUrl("test", "")).toBeNull();
});

test('image request', () => {
    util.imageRequest("http://127.0.0.1:5000/postPreview").then( (url) => {
        expect(url).not.toBeNull();
    })
});

