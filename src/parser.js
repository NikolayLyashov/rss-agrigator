const parser = (data) => {
  const domParser = new DOMParser();
  const document = domParser.parseFromString(data, 'text/xml');

  const title = document.querySelector('title').textContent;
  const description = document.querySelector('description').textContent;
  const items = [...document.querySelectorAll('item')];

  const newItems = items.map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemDescription = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return { title: itemTitle, description: itemDescription, link };
  });

  console.log(newItems);
  return {
    title,
    description,
    items: newItems,
  };
};

export default parser;
