const moment = require('moment');
const cheerio = require('cheerio');
const parseString = require('xml2js').parseString;
const dateFormat = "YYYY-MM-DD";

const extractBookableClubs = (body) => {
  return new Promise((res, reject) => {
    //TODO: Fix when no dropdown is found - .test()?
    const clubsList = /<select onchange="publicTimetableHref\(this\)"[\s\S]*?<\/select>/.exec(body)[0];
    const $ = cheerio.load(clubsList);
    var list = [];
    
    $('option').each(function (index, element) {
        list.push($(this).val().replace('MemberTimetable?clubId=', ''));
    });

    console.log(`Extracted list of club ids: ${list}`);

    res();
  });
};

const extractTimeTable = (body) => {
  return new Promise((res, reject) => {
    const timeTable = /<table id=\'MemberTimetable\'.*<\/table>/.exec(body)[0];

    //TODO: Fix when no dropdown is found - .test()?
    const selectedClub = /<option selected=\'selected\'.*?<\/option>/g.exec(body)[0];

    const clubName = cheerio.load(selectedClub).text();
    const clubId = cheerio.load(selectedClub)('option').val().replace('MemberTimetable?clubId=', '');

    parseString(cheerio.load(timeTable).xml(), (err, result) => {
      if(!err) {
        console.log('Extracted time table');
        return res(formatTimeTable(clubName, clubId, result));
      }

      return reject(err);
    });
  });
};

const formatTimeTable = (clubName, clubId, timeTable) => {
  return timeTable.table.tr.reduce((acc, tr) => {

    if (tr.$ && tr.$.class === 'dayHeader') {
      const date = moment(tr.td[0].h5[0].trim(), "dddd - DD MMMM YYYY");
      acc[date.format(dateFormat)] = [];
    }

    if (!tr.$ || tr.$.class === 'altRow') {
      const lastKey = Object.keys(acc).pop();

      acc[lastKey].push({
        id: parseInt(tr.td[5].span[0].a[0].$.rel.split('=')[1]),
        className: tr.td[1].span[0].a[0]._,
        time: tr.td[0].span[0]._,
        clubName: clubName || '',
        clubId: clubId || '',
        canBook: !(tr.td[6] === 'Full' || tr.td[6] === 'Past')
      });
    }

    return acc;

  }, {});
};

module.exports = {
  extractTimeTable,
  extractBookableClubs,
  dateFormat
};