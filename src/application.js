/* eslint-disable object-curly-newline */
import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
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

const addFeeds = (title, description, watch, feedId, url) => {
  const feed = { title, description, url, feedId };

  watch.feeds = [...watch.feeds, feed];
};

const addPosts = (items, watch, feedId) => {
  console.log(items);
  if (!items.length) {
    console.log('hi');
    return null;
  }

  const posts = items.map(({ title, description, link }) => ({ title, description, link }));

  watch.posts = [...watch.posts, { items: [...watch.posts, ...posts], id: feedId }];
};

const addProxyTo = (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

const app = () => {
  const newInstance = i18next.createInstance({
    fallbackLng: 'en',
    returnObjects: true,
    resources: {
      en,
    },
  }, (__, t) => t('key'));
  // Без колбека не работает

  const state = {
    form: {
      processState: 'filling',
      valid: false,
      error: null,
    },
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

  const watcher = watchedState(state, domElements, newInstance);

  domElements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const urls = state.feeds.map(({ url }) => url);

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const getValidError = validate(url);

    if (urls.includes(url)) {
      watcher.form = {
        ...watcher.form,
        processState: 'error',
        error: { name: 'exists' },
        valid: false,
      };
      return;
    }

    if (getValidError) {
      watcher.form = {
        ...watcher.form,
        processState: 'error',
        error: getValidError,
        valid: false,
      };
      return;
    }

    watcher.form = { ...watcher.form, valid: true };
    watcher.downloadProcess = { ...watcher.downloadProcess, status: 'processing' };

    axios(addProxyTo(url))
      .then((res) => {
        const { items, title, description } = parser(res.data.contents);
        const feedId = _.uniqueId();

        addFeeds(title, description, watcher, feedId, url);
        addPosts(items, watcher, feedId);

        watcher.downloadProcess = { ...watcher.downloadProcess, status: 'success' };
      }).catch((err) => {
        watcher.downloadProcess = { ...watcher.downloadProcess, status: 'error', error: err };
      });
  });

  const compareStream = () => {
    const streams = state.feeds.map(({ url }) => axios(addProxyTo(url))
      .then((res) => {
        const { items, description } = parser(res.data.contents);
        const { feedId } = state.feeds.find((f) => f.description === description);

        const posts = state.posts.filter(({ id }) => id === feedId);
        console.log(posts);
        const newItems = _.differenceWith(posts.items, items, _.isEqual);
        console.log(newItems, state.posts);
        // add id feed
        addPosts(newItems, watcher, feedId);
      })
      .catch((e) => console.log(e)));

    Promise.all(streams).then(() => {
      setTimeout(compareStream, 5000);
    });
  };

  compareStream();
};

export default app;
