import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import watchedState from './watchers.js';
import parse from './parser.js';
import en from './locales/en.js';

const validate = (url, urls) => {
  try {
    const schema = yup.string().url().notOneOf(urls);
    schema.validateSync(url);
    return null;
  } catch (err) {
    return err;
  }
};

const addFeeds = (watch, title, description, url, feedId) => {
  const feed = {
    title,
    description,
    url,
    feedId,
  };

  watch.feeds = [...watch.feeds, feed];
};

const addPosts = (items, watch, feedId) => {
  const posts = items.map(({ title, description, link }) => ({
    title,
    description,
    link,
    feedId,
  }));

  watch.posts = [...watch.posts, ...posts];
};

const addProxyTo = (url) => {
  const link = new URL('https://api.allorigins.win/get?');
  link.searchParams.set('url', url);
  link.searchParams.set('disableCache', true);
  return link.href;
};

const updateFeeds = (watcher) => {
  if (!watcher.feeds.length) {
    return;
  }

  const streams = watcher.feeds.map(({ url }) => axios(addProxyTo(url))
    .then((res) => {
      const { items, description } = parse(res.data.contents);
      const { feedId } = watcher.feeds.find((f) => f.description === description);

      const posts = watcher.posts.filter((post) => post.feedId === feedId);
      const newItems = _.differenceWith(posts.items, items, _.isEqual);

      addPosts(newItems, watcher, feedId);
    })
    .catch((e) => console.log(e)));

  Promise.all(streams).then(() => {
    setTimeout(updateFeeds, 5000);
  });
};

const app = () => {
  const newInstance = i18next.createInstance();
  newInstance.init({
    fallbackLng: 'en',
    returnObjects: true,
    resources: {
      en,
    },
  }, (err, t) => {
    const state = {
      form: {
        status: 'filling',
        valid: false,
        error: null,
      },
      activeModel: null,
      posts: [],
      feeds: [],
      downloadProcess: { status: 'processing', error: null },
    };

    const domElements = {
      button: document.querySelector('.btn'),
      feedback: document.querySelector('.feedback'),
      input: document.querySelector('input'),
      feeds: document.querySelector('.feeds'),
      posts: document.querySelector('.posts'),
      form: document.querySelector('form'),
      preview: document.querySelectorAll('btn-sm'),
    };

    const watcher = watchedState(state, domElements, t);

    domElements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const urls = state.feeds.map(({ url }) => url);

      const formData = new FormData(e.target);
      const url = formData.get('url');
      const getValidError = validate(url, urls);

      // Может быть 2 типа ошибки валидации. 1 валидация , 2 - повторный url

      if (getValidError) {
        const messageError = (getValidError.message === 'this must be a valid URL')
          ? 'validationError'
          : 'urlExist';

        watcher.form = {
          ...watcher.form,
          status: 'error',
          error: { message: messageError },
          valid: false,
        };
        return;
      }

      watcher.form = { ...watcher.form, valid: true };
      watcher.downloadProcess = { ...watcher.downloadProcess, status: 'processing' };

      axios(addProxyTo(url))
        .then((res) => {
          const { items, title, description } = parse(res.data.contents);
          const feedId = _.uniqueId();

          addFeeds(watcher, title, description, url, feedId);
          addPosts(items, watcher, feedId);

          watcher.downloadProcess = { ...watcher.downloadProcess, status: 'success' };
        }).catch((er) => {
          if (er.isAxiosError) {
            watcher.downloadProcess = {
              ...watcher.downloadProcess,
              status: 'error',
              error: { message: 'axios' },
            };
            return;
          }

          watcher.downloadProcess = { ...watcher.downloadProcess, status: 'error', error: er };
        });
    });

    console.log(domElements);

    updateFeeds(watcher);
  });
};

export default app;
