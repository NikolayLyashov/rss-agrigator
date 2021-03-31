import onChange from 'on-change';

const renderError = ({ name }, { input, feedback }, i18next) => {
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = i18next.t(`errors.${name}`);
};

const deletedError = ({ input, feedback }) => {
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.textContent = '';
};

const renderFinishedForm = ({ feedback, input }, i18next) => {
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.style.color = 'green';
  feedback.textContent = i18next.t('validMessage');
  input.value = '';
  input.focus();
};

const renderFeeds = (stateFeeds, { feeds }) => {
  let titleFeeds;
  let ul;

  if (!feeds.querySelector('h2')) {
    titleFeeds = document.createElement('h2');
    ul = document.createElement('ul');
  } else {
    titleFeeds = feeds.querySelector('h2');
    ul = feeds.querySelector('ul');
  }

  titleFeeds.textContent = 'Feeds';
  feeds.appendChild(titleFeeds);

  ul.classList.add('list-group', 'mb-5');

  stateFeeds.map((feed) => {
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
    return null;
  });

  feeds.appendChild(ul);
};

const renderPosts = (data, { posts }) => {
  let titlePosts;
  let ul;

  if (!posts.querySelector('h2')) {
    titlePosts = document.createElement('h2');
    ul = document.createElement('ul');
  } else {
    titlePosts = posts.querySelector('h2');
    ul = posts.querySelector('ul');
  }

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
    return null;
  });
  posts.appendChild(ul);
};

const renderForm = ({ valid, error }, elements, i18next) => {
  if (valid) {
    deletedError(elements);
  } else {
    console.log(error);
    renderError(error, elements, i18next);
  }
};

const renderDownloadProcess = ({ status, error }, elements, i18next) => {
  const { button, input } = elements;
  switch (status) {
    case 'processing':
      button.disabled = true;
      input.readOnly = true;
      break;
    case 'success':
      button.disabled = false;
      input.readOnly = false;
      renderFinishedForm(elements, i18next);
      break;
    case 'error':
      button.disabled = false;
      renderError(error, elements);
      break;
    default:
      break;
  }
};

const watchedState = (state, elements, i18next) => onChange(state, (path, value) => {
  console.log(state);
  switch (path) {
    case 'form':
      renderForm(value, elements, i18next);
      break;
    case 'posts':
      renderPosts(state.posts, elements);
      break;
    case 'feeds':
      renderFeeds(state.feeds, elements);
      break;
    case 'downloadProcess':
      renderDownloadProcess(value, elements, i18next);
      break;
    default:
      break;
  }
});

export default watchedState;
