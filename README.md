# Immunid

Isolated immutable data storage with minor relational niceties.

## Usage

```javascript
var Record  = require('immunid').Record;
var Store   = require('immunid').Store;
var Request = require('proquest');
var Author  = require('./models/author');
var Comment = require('./models/comment');
var Tag     = require('./models/tag');

// Example of a post record declaration with relationship declarations. Only the
// fields that are defined will be extracted. Relation functions such as
// `hasMany` and `hasOne` act as macros for accessing related data from the
// store.
var Post = Record.defRecord({
  id:       Record.attr(),
  category: Record.attr('default'),
  comments: Record.hasMany('comments'),
  tags:     Record.hasMany('tags'),
  author:   Record.hasOne('author')
});

// Instantiate a new store and register type mappings.
var store = new Store().registerTypes({
  author:  Author,
  comment: Comment,
  post:    Post,
  tag:     Tag
});

// A callback to handle change events. In a react application this would
// update the component state and trigger a reflow/render.
store.addChangeListener(function() {
  var posts = store.all('posts'); // all posts from the payload

  posts.forEach(function(post) {
    post.author();         // retrieve the author model
    post.comments.count(); // number of comments
    post.tags.find(201);   // find a specific tag
  });
};

// Make a request to the server and pass the payload to the store's parse
// function, which will unpack all nested data directly into the database.
Request.get('//posts/100').then(function(response) {
  store.parse(response.body);
});
```
