var chat;
$(function () {
	function Chat() {
		var self = this;
		this.$text = $('#chat-text');
		this.$btnSend = $('#btnSend');
		this.$input = $('#input');

		this.$input.on('keypress', function(e) {
			var key = e.keyCode || e.which;
			if (key == 13) {
				self.$btnSend.trigger('click');
			}
		});

		this.$btnSend.on('click', function() {
			var text = self.$input.val();
			if (text && text != '') {
				text = $('<div/>').text(text).html();
				if (self.name) {
					self.sendText(text);
				}
				else {
					self.connect(text);
				}
			}

			self.$input.val('');
		});

	}

	Chat.prototype.connect = function(name) {
		var self = this;
		this.io = io();

		this.io.on('user-joined', function(name) {
			self.writeLine('<span class="text-primary">' + name + ' has joined the room.</span>')
		});

		this.io.on('user-left', function(name) {
			self.writeLine('<span class="text-primary">' + name + ' has left the room.</span>')
		});

		this.io.on('chat-message', function(text) {
			self.writeLine(text);
		});

		this.io.on('connect', function() {
			self.$text.html('');
			self.writeLine('<span class="text-success">Connected to server</span>');
			this.emit('set-name', {name: name});
			self.name = name;
		});

		this.io.on('disconnect', function(arg) {
			self.writeLine('<span class="text-danger">Disconnected from server</span>');
		});
	};

	Chat.prototype.sendText = function(text) {
		this.io.emit('chat-message', text);
		this.writeLine('<span class="text-muted">' + this.name + ': ' + text + '</span>');
	};

	Chat.prototype.write = function(html) {
		this.$text.append(html)
		this.$text.animate({ scrollTop: chat.$text.prop('scrollHeight') }, "slow");
	};

	Chat.prototype.writeLine = function(html) {
		this.$text.append('<div>' + html + '</div>')
		this.$text.animate({ scrollTop: chat.$text.prop('scrollHeight') }, "slow");
	};

	chat = new Chat();
});