const visearch = require('./js/index');

// TODO: insert your app key here
visearch.set('app_key', 'YOUR_APP_KEY');
visearch.set('timeout', 2000);

// TODO: insert the image name here
const IM_NAME = 'im_name';
visearch.search({
  im_name: IM_NAME,
  fl: ['im_url'],
}, (res) => {
  console.log(res);
}, (err) => {
  console.error(err);
});
