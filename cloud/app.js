
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
	
	
	var grannyEmail = req.body.Sender; // TODO: get granny email address

	// TODO: parse from body
	var taskMessage=req.body['Text-part'];
	var taskSubject=req.body.Subject;
	console.log('body');
	console.log(req.body);
	
	Parse.Cloud.httpRequest(
	{
		url: 'https://api.idolondemand.com/1/api/sync/querytextindex/v1', 
		params: 
		{
			text : taskMessage,
			apikey: 'a8b4944c-d2c0-4454-982f-6235ed5e5988',
			indexes: 'task',
			print: 'all'
		},
		success: function(httpResponse) 
		{
			console.log(httpResponse);
			var taskCategory = "other";
			if(httpResponse.status == 200 && httpResponse.data != null && httpResponse.data.documents != null && httpResponse.data.documents.length > 0)
			{
				console.log('found a match');
				var taskCategory = httpResponse.data.documents[0].title;
				console.log(taskCategory);
			}
			else
			{
				console.log('no match found');
			}
			
			var taskDurationHour = 1;
			var taskDurationMin = 30;
			var taskStartTimeHour = 12;
			var taskStartTimeMin = 30;

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
		},
		error: function(httpResponse) 
		{
			console.error('Request failed with response code ' + httpResponse.status);
		}
	});
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
