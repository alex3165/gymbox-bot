const { parser } = require('./timetable-parser');
const htmlMock = require('./timetable-mock');

describe('timetable parser', () => {
  it('should parse html and return json', async () => {
    const res = await parser(htmlMock);

    expect(Array.isArray(res)).toBeTruthy();

    expect(res[0]).toEqual('Saturday - 11 January 2020');

    expect(res[2]).toEqual({
      time: '11:00',
      name: 'Rolling with my Yogis',
      category: '',
      instructor: 'Leanne Blossom',
      duration: '60 mins',
      price: '',
      action: 'Book',
      slot: '1281364'
    });
  });
});
