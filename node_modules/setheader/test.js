describe('setHeader', function () {
  'use strict';

  var request = require('request')
    , assume = require('assume')
    , setHeader = require('./')
    , http = require('http')
    , port = 9000;

  it('is exported as function', function () {
    assume(setHeader).to.be.a('function');
  });

  it('prevents header from being overridden', function (done) {
    var server = http.createServer(function (req, res) {
      // control
      res.setHeader('Foo', 'bar');
      assume(res.getHeader('Foo')).to.equal('bar');

      // set
      setHeader(res, 'Foo', 'baz');
      assume(res.getHeader('Foo')).to.equal('baz');

      // ensure no change
      res.setHeader('Foo', 'bar');
      assume(res.getHeader('Foo')).to.equal('baz');

      // set
      setHeader(res, 'Foo', 'bazz');
      assume(res.getHeader('Foo')).to.equal('baz');

      res.end('foo');
    }), connect = ++port;

    server.listen(connect, function () {
      request('http://localhost:'+ connect, function (err, res) {
        server.close();

        if (err) return done(err);

        assume(res.headers.foo).to.equal('baz');
        done();
      });
    });
  });
});
