import getSite from '../src/site';

describe('resolving invalid strings', () => {
  it('resolves partial urls', () => {
    const azlyrics = getSite('azlyrics');
    const partials = [
      '../lyrics/flume/neverbelikeyou.html',
      '../lyrics/flume/loseit.html',
      '../lyrics/flume/numbgettingcolder.html',
      '../lyrics/flume/sayit.html'
    ];

    const expected = [
      'https://www.azlyrics.com/lyrics/flume/neverbelikeyou.html',
      'https://www.azlyrics.com/lyrics/flume/loseit.html',
      'https://www.azlyrics.com/lyrics/flume/numbgettingcolder.html',
      'https://www.azlyrics.com/lyrics/flume/sayit.html'
    ]

    expect(partials.map(azlyrics.resolvePartialUrl).sort()).toEqual(expected.sort())
  })
})