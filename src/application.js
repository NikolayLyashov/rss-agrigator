import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import watchedState from './watchers.js';
import parser from './parser.js';
import en from './locales/en.js';

const validate = (url) => {
  try {
    const schema = yup.string().url();
    schema.validateSync(url);
    return null;
  } catch (err) {
    return err;
  }
};

const addFeeds = ({ title, description }, watch) => {
  let feeds = [];
  const feed = { title, description };

  feeds = [...feeds, feed];
  watch.feeds = [...feeds];
};

const addPosts = ({ items }, watch) => {
  let posts = [];

  items.forEach(({ title, description, link }) => {
    const post = { title, description, link };

    posts = [...posts, post];
  });
  watch.posts = [...posts];
};

const getStream = (url) => axios(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);

const app = () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  });

  const state = {
    form: {
      processState: 'filling',
      valid: false,
      error: null,
    },
    // processState: 'filling',
    posts: [],
    feeds: [],
    downloadProcess: { status: 'filling', error: null },
  };

  const domElements = {
    button: document.querySelector('.btn'),
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('input'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    form: document.querySelector('form'),
  };

  const watcher = watchedState(state, domElements);

  domElements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');

    const getValidError = validate(url);

    if (getValidError) {
      watcher.form = { ...watcher.form, processState: 'error', error: getValidError };
      return;
    }
    watcher.form = { ...watcher.form, valid: true };
    watcher.downloadProcess = { ...watcher.downloadProcess, status: 'processing' };

    getStream(url)
      .then((res) => {
        const parserData = parser(res.data.contents);
        console.log(parserData);
        addFeeds(parserData, watcher);
        addPosts(parserData, watcher);
        watcher.downloadProcess = { ...watcher.downloadProcess, status: 'success' };
      }).catch((err) => {
        watcher.downloadProcess = { ...watcher.downloadProcess, status: 'error', error: err };
      });
  });
};

export default app;
