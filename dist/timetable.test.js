const { extractTimeTable } = require('./timetable');
const htmlMock = require('./timetable-mock');
const expectedMock = require('./timetable-expected-result-mock');

describe('timetable extractTimeTable', () => {
  it('extractTimeTable', async () => {
    const res = await extractTimeTable('test', htmlMock);

    expect(res).toEqual(expectedMock);
  });
});
