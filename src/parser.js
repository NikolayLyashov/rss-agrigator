/* eslint-disable no-undef */

const parser = (data) => {
  const domParser = new DOMParser();
  return domParser.parseFromString(data, 'text/xml');
};

export default parser;
