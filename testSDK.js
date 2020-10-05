const visearch = require('./js/index');

// TODO: insert your app key here
visearch.set('app_key', 'YOUR_APP_KEY');
// TODO: insert your tracker code here
visearch.set('tracker_code', 'YOUR_TRACKER_CODE');
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


// Test tracking function
visearch.send('click', {
  queryId: 'fake-query-id',
  pid: IM_NAME,
});
