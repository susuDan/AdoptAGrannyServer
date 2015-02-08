
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.post('/requestahelper', function(req, res) {
	console.log('params');
	console.log(req.params);
	console.log('body');
	console.log(req.body);
	console.log('sender');
	console.log(req.body.Sender);
	
	  var grannyEmail = "dancheung13@gmail.com"; // TODO: get granny email address
	  
	  // TODO: parse from body
	  var taskCategory = "Grocery";
	  var taskDurationHour = 1;
	  var taskDurationMin = 30;
	  var taskStartTimeHour = 12;
	  var taskStartTimeMin = 30;
	  var taskMessage="I need to get milk from the store.";
	  var taskSubject="Help Me";
	  // 
	  
	  var Granny = Parse.Object.extend("Granny");
	  var query = new Parse.Query(Granny);
	  query.equalTo("email", grannyEmail); 
	  query.find(
	  {
		 success: function(results) {
			var granny = results[0];
			var Task = Parse.Object.extend("Task");
			var task = new Task();

			task.save( 
			{ 
				category: taskCategory,
				durationHour: taskDurationHour,
				durationMin: taskDurationMin,
				distance: 5.2,
				grannyid: granny.id,
				status: "Active",
				startTimeHour: taskStartTimeHour,
				startTimeMin: taskStartTimeMin,
				message: taskMessage,
				subject: taskSubject,
				volunteerid: granny.id
				// inline more granny information
			}).then
			(
				function(test) 
				{
					res.send('Success');
				}, 
				function(error) 
				{
					res.status(500);
					res.send('Error could not save task');
				}
			);
		},
		error: function(error) 
		{
			res.status(500);
			res.send('Error could not find granny');
		}
	});
  
  		
//  message.save({ text: "message" }).then(function(message) {
//    res.send('Success');
//  }, function(error) {
//    res.status(500);
//    res.send('Error');
//  });
//category => subject or body/text through processing
//user => from mail, lookup user in DB, link them
//duration => parse from body/text (or default per category)
//   Task ( category, user, time, duration) => SAVE
});


// // Example reading from the request query string of an HTTP get request.
// app.get('/test', function(req, res) {
//   // GET http://example.parseapp.com/test?message=hello
//   res.send(req.query.message);
// });

// // Example reading from the request body of an HTTP post request.
// app.post('/test', function(req, res) {
//   // POST http://example.parseapp.com/test (with request body "message=hello")
//   res.send(req.body.message);
// });

// Attach the Express app to Cloud Code.
app.listen();
