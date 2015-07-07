/* jshint expr:true */
import { it } from 'ember-mocha';
import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Session from 'ember-simple-auth/session';
import EphemeralStore from 'ember-simple-auth/stores/ephemeral';

describe('AuthenticatedRouteMixin', function() {
  describe('#beforeModel', function() {
    beforeEach(function() {
      let Route = Ember.Route.extend({
        beforeModel() {
          let routeContext = this;

          return new Ember.RSVP.Promise((resolve) => {
            Ember.run.next(() => {
              resolve(routeContext.beforeModelReturnValue);
            });
          });
        }
      }, AuthenticatedRouteMixin);

      this.session = Session.create();
      this.session.setProperties({ store: EphemeralStore.create() });
      this.transition = {
        abort() {},
        send() {}
      };
      this.route      = Route.create({ session: this.session });
      sinon.spy(this.transition, 'abort');
      sinon.spy(this.transition, 'send');
    });

    describe('if the session is authenticated', function() {
      beforeEach(function() {
        this.session.set('isAuthenticated', true);
      });

      it('returns the upstream promise', function() {
        this.route.beforeModelReturnValue = 'authenticated';

        return this.route.beforeModel(this.transition)
          .then(function(result) {
            expect(result).to.equal('authenticated');
          });
      });

      it('does not abort the transition', function() {
        this.route.beforeModel(this.transition);

        expect(this.transition.abort).to.not.have.been.called;
      });

      it('does not invoke the "sessionRequiresAuthentication" action', function() {
        this.route.beforeModel(this.transition);

        expect(this.transition.send).to.not.have.been.calledWith('sessionRequiresAuthentication');
      });
    });

    describe('if the session is not authenticated', function() {
      it('returns the upstream promise', function() {
        this.route.beforeModelReturnValue = 'unauthenticated';

        return this.route.beforeModel(this.transition)
          .then(function(result) {
            expect(result).to.equal('unauthenticated');
          });
      });

      it('aborts the transition', function() {
        this.route.beforeModel(this.transition);

        expect(this.transition.abort).to.have.been.called;
      });

      it('invokes the "sessionRequiresAuthentication" action', function() {
        this.route.beforeModel(this.transition);

        expect(this.transition.send).to.have.been.calledWith('sessionRequiresAuthentication');
      });
    });
  });
});
