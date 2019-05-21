import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Accounts } from 'meteor/accounts-base';

import './main.html';
import '../lib/collection.js';

Session.set('taskLimit', 30);
Session.set('userFilter', false);

lastScrollTop = 0; 
$(window).scroll(function(event){
	// test if we are near the bottom of the window
	if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
		// where are we in the page? 
		var scrollTop = $(this).scrollTop();
		// test if we are going down
		if (scrollTop > lastScrollTop){
			// yes we are heading down...
			Session.set('taskLimit', Session.get('taskLimit') + 3);
			
		}
		lastScrollTop = scrollTop;
	}
});

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_ONLY',
});

Template.task.helpers({
  MainAll() {
	if (Session.get("userFilter") == false){
		//Get time 15 seconds ago
		var prevTime = new Date() - 15000;
		var newResults = tasksDB.find({"createdOn":{$gte:prevTime}}).count();
		if (newResults > 0) {
			//if new images are found then sort by date first then ratings
			return tasksDB.find({}, {sort:{imgRate:-1}, limit:Session.get('taskLimit')});
		} else {
			//else sort by ratings then date
			return tasksDB.find({}, {sort:{createdOn:1}, limit:Session.get('taskLimit')});
		}
	} else {
		return tasksDB.find({postedBy:Session.get("userFilter")}, {sort:{createdOn:1}, limit:Session.get('taskLimit')});
	}
		
	},

	usersName(){
		var uId = tasksDB.findOne({_id:this._id}).postedby;
		return Meteor.users.findOne({_id:uId}).username;
	},

	userId(){
		return tasksDB.findOne({_id:this._id}).postedBy;		
	}
});


Template.add.events({
  'change .js-add'(event) {
	   var taskpath = $("#taskpath").val();
	   $("#taskpath").val('');
      	console.log ("Test");
      	tasksDB.insert({"Task":taskpath, "createdon":new Date().getTime(), "postedby":Meteor.user()._id});
  },
});

Template.task.events({
	'click .js-delete'(event, instance) {
		var taskID = this._id;
			console.log (taskID);
		$("#" + taskID).fadeOut("slow","swing", function(){
			console.log ("hi");
			tasksDB.remove({_id:taskID}); 	
		});
  	},

  	'click .js-showUser'(event){
		event.preventDefault();
		Session.set("userFilter", event.currentTarget.id);
	},

	'click .js-edit'(event, instance) {

	},

});
