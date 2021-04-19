import onChange from 'on-change';

const renderError = ({ message }, { input, feedback }, i18next) => {
  console.log(message);
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = i18next(`errors.${message}`);
};

const creatModal = () => {
  const divModalDialog = document.createElement('div');
  divModalDialog.classList.add('modal-dialog', 'role="document');

  const divModalContent = document.createElement('div');
  divModalContent.classList.add('modal-content');

  const modalHeader = () => {
    const divModalHeader = document.createElement('div');
    divModalHeader.classList.add('modal-header');

    const h5 = document.createElement('h5');
    h5.classList.add('modal-title');
    h5.textContent = 'Циклы / HTML: Препроцессор Pug';

    const buttonClose = document.createElement('button');
    buttonClose.classList.add('close');
    buttonClose.setAttribute('type', 'button');
    buttonClose.setAttribute('aria-label', 'Сlose');
    buttonClose.dataset.dismiss = 'modal';

    const span = document.createElement('span');
    span.textContent = 'x';
    span.setAttribute('aria-hidden', 'true');

    buttonClose.appendChild(span);

    divModalHeader.appendChild(h5);
    divModalHeader.appendChild(buttonClose);
    // Сделать через oHTML
    return divModalHeader;
  };

  const modalBody = () => {
    const divModalBody = document.createElement('div');
    divModalBody.classList.add('modal-body');
    divModalBody.textContent = 'Цель: Научиться перебирать массивы и объекты с использованием циклов Pug.';

    return divModalBody;
  };

  const modalFooter = () => {
    const divFooter = document.createElement('div');
    divFooter.classList.add('modal-footer');
    const a = '<a class="btn btn-primary full-article" href="https://ru.hexlet.io/courses/html-pug/lessons/iteration/theory_unit"role="button"target="_blank"rel="noopener noreferrer">Читать полностью</a>';

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-secondary');
    button.textContent = 'Закрыть';

    divFooter.innerHTML = `${a}`;
    divFooter.appendChild(button);

    return divFooter;
  };

  // <div class="modal-dialog" role="document">
  //     <div class="modal-content">
  //       <div class="modal-header">
  //         <h5 class="modal-title">Циклы / HTML: Препроцессор Pug</h5>
  //         <button
  //           type="button"
  //           class="close"
  //           data-dismiss="modal"
  //           aria-label="Close"
  //         >
  //           <span aria-hidden="true">×</span>
  //         </button>
  //       </div>
  //       <div class="modal-body">
  //         Цель: Научиться перебирать массивы и объекты с использованием циклов Pug.
  //         Изучить конструкцию each else
  //       </div>
  //       <div class="modal-footer">
  //         <a
  //           class="btn btn-primary full-article"
  //           href="https://ru.hexlet.io/courses/html-pug/lessons/iteration/theory_unit"
  //           role="button"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           Читать полностью{" "}
  //         </a>
  //         <button type="button" class="btn btn-secondary" data-dismiss="modal">
  //           Закрыть
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  console.log(modalFooter());
  divModalDialog.appendChild(modalHeader());
  divModalDialog.appendChild(modalBody());
  divModalDialog.appendChild(modalFooter());

  return divModalDialog;
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
    const { link, title } = post;
    const li = document.createElement('li');
    const a = `<a href=${link} class="font-weight-bold" data-id="2" target="_blank" rel="noopener noreferrer">${title}</a>`;
    const buttonPreview = document.createElement('button');
    buttonPreview.classList.add('btn', 'btn-primary', 'btn-sm');
    buttonPreview.textContent = i18next('buttonPreview');
    buttonPreview.addEventListener('click', () => {
      const modal = creatModal();
      console.log(creatModal());
      posts.appendChild(modal);
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
    return null;
  }
  renderError(error, elements, i18next);
  return null;
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
    default:
      break;
  }
});

export default watchedState;
