
/**
 * @file
 * All factories for use with chat.
 */

/**
 * Controllers may use this factory to request a client id from the chat
 * server. The id may then be used by the controller to send further
 * communications, and will be used by the factory to route all incoming
 * messages back to the correct controller.
 */
cstApp.factory('chat', ['$rootScope', 'appMeta', function($rootScope, appMeta) {
    /**
     * Private data and methods.
     */
    var pvt = {};
    /**
     * Manage all clients. A client is basically a controller that as subscribed
     * to a specific chat room.
     */
    pvt.clients = [];
    /**
     * Talk to the server.
     */
    pvt.talk = function(message, callback) {
        
    }
    pvt.getClientById = function(id) {

    }
    /**
     * Request a new client id from the server and associate with controller scope.
     */
    pvt.create = function(scope, callback) {
    	this.talk({'type': 'request_id', data: {'controllerId': controllerId}}, function(messages)) {
            this.clients.push({
            	'scope': scope,
            	'id': message.data.id, 
            	'secret': message.data.secret
            });
    	}
    };
    /**
     * Process a response from the server.
     */
    pvt.response = function(messages) {
        for (var i in messages) {
        	var message = messages[i];
        	if (message.type == 'message') {
        		this.broadcastMessage(message);
        	}
        }
    };
    /**
     * Broadcast a message received from the server to the correct chat
     * controller.
     *
     * Controllers may listen for this with:
     * $scope.$on('chat', function(event, message) {});
     *
     * @param object message
     *   An message to broadcast to the appropriate chat controller.
     *     - type: (string) should be 'message'
     *     - data: (object):
     *       - to: (int) the message receiptiant, used to determine which
     *             controller to broadcast to.
     *
     * @return void
     */
    pvt.broadcastMessage = function(message) {
    	var client = this.getClientById(message.data.to);
        client.scope.$broadcast('chat', message);
    };
}]);
