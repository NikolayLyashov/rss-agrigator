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

const addFeeds = ({ title, description }, watch) => {
  const feed = { title, description };

  watch.feeds = [...watch.feeds, feed];
};

const addPosts = ({ items }, watch) => {
  const posts = items.map(({ title, description, link }) => ({ title, description, link }));
  watch.posts = [...watch.posts, ...posts];
};

const getStream = (url) => axios(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);

const app = () => {
  const newInstance = i18next.createInstance({
    fallbackLng: 'en',
    returnObjects: true,
    resources: {
      en,
    },
  }, (__, t) => t('key'));

  const state = {
    form: {
      processState: 'filling',
      valid: false,
      error: null,
    },
    links: [],
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

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const getValidError = validate(url);

    if (state.links.indexOf(url) >= 0) {
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

    getStream(url)
      .then((res) => {
        const parserData = parser(res.data.contents);

        addFeeds(parserData, watcher);
        addPosts(parserData, watcher);

        watcher.downloadProcess = { ...watcher.downloadProcess, status: 'success' };
        state.links.push(url);
      }).catch((err) => {
        watcher.downloadProcess = { ...watcher.downloadProcess, status: 'error', error: err };
      });
  });

  const compareStream = () => {
    const fn = () => {
      const streams = state.links.map((link) => getStream(link)
        .then((res) => {
          const steamData = parser(res.data.contents);
          const newItems = _.differenceWith(steamData, state.posts, _.isEqual);

          if (newItems.length) {
            addPosts(newItems);
          }
        })
        .catch((e) => console.log(e)));

      return Promise.all(streams);
    };
    fn().then(() => {
      setTimeout(function tick() {
        console.log('tick');
        fn();
        setTimeout(tick, 5000);
      }, 0);
    });
  };
  compareStream();
};

export default app;
