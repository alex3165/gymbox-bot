const cheerio = require('cheerio');
const { parse } = require('html-to-json');

const getId = $item => {
  if ($item.find('.col6Item').attr('id')) {
    return $item
      .find('.col6Item')
      .attr('id')
      .replace('slot', '');
  }

  if (
    $item
      .find('.col5Item')
      .find('a')
      .attr('id')
  ) {
    return $item
      .find('.col5Item')
      .find('a')
      .attr('id')
      .replace('price', '');
  }

  return undefined;
};

const parser = body => {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(body);

    parse($('#MemberTimetable').html(), function() {
      return this.map('tr', function($item) {
        if (!!$item.find('h5').text()) {
          return $item
            .find('h5')
            .text()
            .trim();
        }

        if ($item.find('.col0Item').text()) {
          return {
            time: $item.find('.col0Item').text(),
            name: $item.find('.col1Item').text(),
            category: $item.find('.col2Item').text(),
            instructor: $item.find('.col3Item').text(),
            duration: $item.find('.col4Item').text(),
            price: $item.find('.col5Item').text(),
            action: $item.find('.col6Item').text(),
            slot: getId($item)
          };
        }

        return $item.text();
      });
    }).done(
      items => {
        resolve(items);
      },
      err => {
        reject(err);
      }
    );
  });
};

module.exports = {
  parser
};
