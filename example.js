var React   = require('react');
var Store   = require('fluxed').Store;
var Model   = require('fluxed').Model;
var Request = require('fluxed').Request;
var Routes  = require('react-router').Routes;
var Route   = require('react-router').Route;

var Post = Model.extend({
  author:   Model.hasOne('author'),
  comments: Model.hasMany('comments')
});

// Where payload looks like this:
// { "posts": [
//   { "id": 100,
//     "comment_ids": [1, 2, 3],
//     "author_id": 1,
//     "body": "This is the post body"
//   },
//   "comments": [],
//   "authors": []
// }
//

var AppComponent = React.createClass({
  render: function() {
    return (
      <div></div>
    );
  }
});

var PostListComponent = React.createClass({
  render: function() {
    var item = function(post) {
      <li key={post.id}>
        <h2>{post.title}</h2>
        <h3>{post.author().name}</h3>
        <p>{post.body}</p>

        <CommentList comments={post.comments.all()} />
      </li>
    };

    return (
      <ul>
        this.props.posts.map(item);
      </ul>
    );
  }
});

var PostComponent = React.createClass({
  componentDidMount: function() {
    Store.addChangeListener(this._onChange);

    Request.get('//posts/' + this.props.id).then(function(payload) {
      Store.parse(payload);
    });
  },

  componentWillUnmount: function() {
    Store.removeChangeListener(this._onChange);
  },

  render: function() {
    return (
      <div>
        <Header />
        <PostList posts={this.state.posts} />
      </div>
    );
  },

  _onStoreChange: function() {
    this.setState({posts: Post.all()});
  }
});

React.renderComponent((
  <Routes>
    <Route handler={AppComponent}>
      <Route name='post' path='/post/:id' handler={PostComponent}/>
    </Route>
  </Routes>
), document.body);
