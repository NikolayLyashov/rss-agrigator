import axios from 'axios';
import * as yup from 'yup';
import _ from 'lodash';
import i18next from 'i18next';
import watchedState from './watchers.js';
import parse from './parser.js';
import en from './locales/en.js';

const validate = (url, urls) => {
  try {
    const schema = yup.string().url('invalidUrl').notOneOf(urls, 'urlExist');
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
    id: _.uniqueId(),
    viewed: false,
  }));

  watch.posts = [...watch.posts, ...posts];
};

const addProxyTo = (url) => {
  const link = new URL('https://hexlet-allorigins.herokuapp.com/get?');
  link.searchParams.set('url', url);
  link.searchParams.set('disableCache', true);
  return link.href;
};

const updateFeeds = (watcher) => {
  const streams = watcher.feeds.map(({ url, feedId }) => axios(addProxyTo(url))
    .then((res) => {
      const { items } = parse(res.data.contents);
      const posts = watcher.posts.filter((post) => post.feedId === feedId);
      const newItems = _.differenceWith(posts.items, items, _.isEqual);

      addPosts(newItems, watcher, feedId);
    })
    .catch(() => {
      watcher.form = {
        ...watcher.form,
        status: 'error',
        error: { message: 'networkError' },
        valid: false,
      };
    }));

  Promise.all(streams).then(() => {
    setTimeout(() => updateFeeds(watcher), 5000);
  });
};

const app = () => {
  const domElements = {
    button: document.querySelector('[aria-label=add]'),
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('input'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    form: document.querySelector('.rss-form'),
    modal: document.querySelector('.modal'),
  };

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


  const watcher = watchedState(state, domElements, t);
  const newInstance = i18next.createInstance();
  newInstance.init({
    fallbackLng: 'en',
    returnObjects: true,
    resources: {
      en,
    },
  }, (err, t) => {
 
    

    domElements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const urls = state.feeds.map(({ url }) => url);

      const formData = new FormData(e.target);
      const url = formData.get('url');
      const getValidError = validate(url, urls);

      if (getValidError) {
        watcher.form = {
          ...watcher.form,
          status: 'error',
          error: { message: getValidError.message },
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

    domElements.posts.addEventListener('click', (event) => {
      if (event.target.tagName === 'BUTTON') {
        const activeItemId = event.target.dataset.id;
        const viewedPost = watcher.posts.find((post) => post.id === activeItemId);
        viewedPost.viewed = true;

        watcher.activeModel = activeItemId;
        watcher.posts = [...watcher.posts];
      }
    });

    domElements.modal.addEventListener('click', (event) => {
      if (
        event.target.tagName === 'SPAN'
        || event.target.tagName === 'BUTTON'
        || event.target.classList.contains('fade')
      ) {
        watcher.activeModel = null;
      }
    });

    updateFeeds(watcher);
  });
};

export default app;
