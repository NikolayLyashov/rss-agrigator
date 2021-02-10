/* eslint-disable array-callback-return */
/* eslint-disable no-undef */

import onChange from 'on-change';

const renderErrorForm = (error, elements) => {
  const { input, feedback } = elements;
  const textError = `${error[0].toUpperCase()}${error.slice(1)}`;
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = textError;
};

const deletedError = (elements) => {
  const { input, feedback } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.textContent = '';
};

const renderFinishedForm = (elements) => {
  const { feedback, input } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.style.color = 'green';
  feedback.textContent = 'Rss has been loaded';
  input.value = '';
  input.focus();
};

const renderFeeds = (data, elements) => {
  const { feeds } = elements;
  const titleFeeds = document.createElement('h2');
  const ul = document.createElement('ul');

  titleFeeds.textContent = 'Feeds';
  feeds.appendChild(titleFeeds);

  ul.classList.add('list-group', 'mb-5');

  data.map((feed) => {
    const { title, description } = feed;
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');

    h3.textContent = title;
    p.textContent = description;

    li.classList.add('list-group-item');
    li.appendChild(h3);
    li.appendChild(p);

    ul.appendChild(li);
  });

  feeds.appendChild(ul);
};

const renderPosts = (data, elements) => {
  const { posts } = elements;
  const titlePosts = document.createElement('h2');
  const ul = document.createElement('ul');

  titlePosts.textContent = 'Posts';
  posts.appendChild(titlePosts);

  ul.classList.add('list-group');

  data.map((post) => {
    const { link, title } = post;
    const li = document.createElement('li');
    const a = `<a href=${link} class="font-weight-bold" data-id="2" target="_blank" rel="noopener noreferrer">${title}</a>`;
    const buttonPreview = document.createElement('button');
    buttonPreview.classList.add('btn', 'btn-primary', 'btn-sm');
    buttonPreview.textContent = 'Preview';
    buttonPreview.addEventListener('click', () => {
    });
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    li.innerHTML = a;
    li.appendChild(buttonPreview);
    ul.appendChild(li);
  });
  posts.appendChild(ul);
};

const renderForm = ({ valid, error }, elements) => {
  if (valid) {
    deletedError(elements);
  }
  renderErrorForm(error, elements);
};

const renderDownloadProcess = ({ status, error }, elements) => {
  const { button, input } = elements;
  switch (status) {
    case 'processing':
      button.disabled = true;
      input.readOnly = true;
      break;
    case 'success':
      button.disabled = false;
      input.readOnly = false;
      renderFinishedForm(elements);
      break;
    case 'error':
      button.disabled = false;
      renderErrorForm(error, elements);
      break;
    default:
      break;
  }
};

const watchedState = (state, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'form':
      renderForm(value, elements);
      break;
    case 'posts':
      renderPosts(state.posts, elements);
      break;
    case 'feeds':
      renderFeeds(state.feeds, elements);
      break;
    case 'downloadProcess':
      renderDownloadProcess(value, elements);
      break;
    default:
      break;
  }
});

export default watchedState;
