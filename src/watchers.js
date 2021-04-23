import onChange from 'on-change';

const renderError = ({ message }, { input, feedback }, i18next) => {
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = i18next(`errors.${message}`);
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
  feedback.textContent = i18next('validMessage');
  input.value = '';
  input.focus();
};

const renderFeeds = (stateFeeds, { feeds }, i18next) => {
  let titleFeeds;
  let ul;

  if (!feeds.querySelector('h2')) {
    titleFeeds = document.createElement('h2');
    ul = document.createElement('ul');
  } else {
    titleFeeds = feeds.querySelector('h2');
    ul = feeds.querySelector('ul');
  }

  ul.innerHTML = '';

  titleFeeds.textContent = i18next('titleFeeds');
  feeds.appendChild(titleFeeds);

  ul.classList.add('list-group', 'mb-5');

  stateFeeds.forEach((feed) => {
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

const renderPosts = (data, { posts }, i18next) => {
  let titlePosts;
  let ul;

  if (!posts.querySelector('h2')) {
    titlePosts = document.createElement('h2');
    ul = document.createElement('ul');
  } else {
    titlePosts = posts.querySelector('h2');
    ul = posts.querySelector('ul');
  }

  ul.innerHTML = '';

  titlePosts.textContent = i18next('titlePosts');
  posts.appendChild(titlePosts);

  ul.classList.add('list-group');

  data.forEach((post) => {
    const {
      link, title, id, viewed,
    } = post;
    const li = document.createElement('li');
    const fontWeight = (viewed) ? 'font-weight-normal' : 'font-weight-bold';
    const a = `<a href=${link} class="${fontWeight}" data-id="${id}" target="_blank" rel="noopener noreferrer">${title}</a>`;
    const buttonPreview = document.createElement('button');
    buttonPreview.classList.add('btn', 'btn-primary', 'btn-sm');
    buttonPreview.textContent = i18next('buttonPreview');
    buttonPreview.dataset.id = id;

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
    return null;
  }
  renderError(error, elements, i18next);
  return null;
};

const closeModal = (modal) => {
  modal.classList.remove('show');
  modal.style.display = 'none';
  modal.style.paddingRight = '';
  modal.setAttribute('aria-hidden', true);
  modal.removeAttribute('role');

  document.body.classList.remove('modal-open');
  document.body.style.paddingRight = '';
  document.body.querySelector('.modal-backdrop').remove();
};

const openModal = (id, posts, elements) => {
  const { modal, posts: postsElements } = elements;
  const post = posts.find((p) => p.id === id);

  const { title, description } = post;

  const p = postsElements.querySelector(`a[data-id="${id}"]`);
  p.classList.remove('font-weight-bold');
  p.classList.add('font-weight-normal');

  modal.querySelector('.modal-title').textContent = title;
  modal.querySelector('.modal-body').textContent = description;

  modal.classList.add('show');
  modal.style.display = 'block';
  modal.style.paddingRight = '15px';
  modal.removeAttribute('aria-hidden');
  modal.setAttribute('aria-modal', true);
  modal.setAttribute('role', 'dialog');

  document.body.classList.add('modal-open');

  const backDrop = document.createElement('div');
  backDrop.classList.add('modal-backdrop', 'fade', 'show');

  document.body.appendChild(backDrop);
  document.body.style.paddingRight = '15px';
};

const renderModal = (id, posts, elements) => {
  const { modal } = elements;
  const backDrop = document.createElement('div');
  backDrop.classList.add('modal-backdrop', 'fade', 'show');

  if (!id) {
    closeModal(modal);
    return;
  }
  openModal(id, posts, elements);
};

const renderDownloadProcess = ({ status, error }, elements, i18next) => {
  const { button, input } = elements;
  switch (status) {
    case 'processing':
      button.disabled = true;
      input.readOnly = true;
      break;
    case 'success':
      button.removeAttribute('disabled');
      input.removeAttribute('readonly');
      renderFinishedForm(elements, i18next);
      break;
    case 'error':
      button.removeAttribute('disabled');
      renderError(error, elements, i18next);
      break;
    default:
      throw new Error(`Unknown status: ${status}`);
  }
};

const watchedState = (state, elements, i18next) => onChange(state, (path, value) => {
  switch (path) {
    case 'form':
      renderForm(value, elements, i18next);
      break;
    case 'posts':
      renderPosts(state.posts, elements, i18next);
      break;
    case 'feeds':
      renderFeeds(state.feeds, elements, i18next);
      break;
    case 'downloadProcess':
      renderDownloadProcess(value, elements, i18next);
      break;
    case 'activeModel':
      renderModal(value, state.posts, elements);
      break;
    default:
      break;
  }
});

export default watchedState;
