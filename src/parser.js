const parse = (data) => {
  const domParser = new DOMParser();
  const document = domParser.parseFromString(data, 'text/xml');

  const error = document.querySelector('parsererror');

  if (error) {
    throw new Error('p');
  }

  const title = document.querySelector('title').textContent;
  const description = document.querySelector('description').textContent;

  const items = [...document.querySelectorAll('item')].map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemDescription = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return { title: itemTitle, description: itemDescription, link };
  });

  return {
    title,
    description,
    items,
  };
};

export default parse;
