/* eslint-disable array-callback-return */
/* eslint-disable no-undef */
import onChange from 'on-change';

const submitButton = document.querySelector('.btn');
const feedback = document.querySelector('.feedback');
const input = document.querySelector('input');
const feeds = document.querySelector('.feeds');
const posts = document.querySelector('.posts');

const renderErrorForm = (error) => {
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = error;
};

const deletedError = () => {
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.textContent = '';
};

const renderFinishedForm = () => {
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.style.color = 'green';
  feedback.textContent = 'Rss has been loaded';
  input.value = '';
  input.focus();
};

const renderFeeds = (data) => {
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

    console.log(title, description);
  });

  feeds.appendChild(ul);
};

const renderPosts = (data) => {
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
      console.log('alert');
    });
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    li.innerHTML = a;
    li.appendChild(buttonPreview);
    ul.appendChild(li);
  });
  posts.appendChild(ul);
};

const renderForm = ({ valid, error }) => (valid ? deletedError() : renderErrorForm(error));

const renderDownloadProcess = ({ status, error }) => {
  switch (status) {
    case 'processing':
      submitButton.disabled = true;
      input.readOnly = true;
      break;
    case 'success':
      submitButton.disabled = false;
      input.readOnly = false;
      renderFinishedForm();
      break;
    case 'error':
      submitButton.disabled = false;
      renderErrorForm(error);
      break;
    default:
      break;
  }
};

const watchedState = (state) => onChange(state, (path, value) => {
  switch (path) {
    case 'form':
      renderForm(value);
      break;
    case 'posts':
      renderPosts(state.posts);
      break;
    case 'feeds':
      renderFeeds(state.feeds);
      break;
    case 'downloadProcess':
      renderDownloadProcess(value);
      break;
    default:
      break;
  }
});

export default watchedState;
