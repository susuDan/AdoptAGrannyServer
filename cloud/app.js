
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body


app.post('/requestahelper', function(req, res) 
{
	var grannyEmail = req.body.Sender; 

	var taskMessage=req.body['Text-part'];
	var taskSubject=req.body.Subject;
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
			
			var taskStartTime = "12:30 PM";

			var Granny = Parse.Object.extend("Granny");
			var query = new Parse.Query(Granny);
			query.equalTo("email", grannyEmail); 
	  
			query.find(
			{
				 success: function(results) {
					var granny = results[0];
					var Task = Parse.Object.extend("Request");
					var task = new Task();

					task.save( 
					{ 
						requestName: taskCategory,
						distance: "5.2",
						grannyid: granny.id,
						grannieName: granny.get("firstname") + ' ' + granny.get("lastname"),
						img: "empty",
						status: "Active",
						startTime: taskStartTime,
						message: taskMessage,
						subject: taskSubject,
						volunteerid: granny.id
						
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

Parse.Cloud.afterSave("Request", function(request) {
	console.log("on save Request");
	if(request.object.get("status") == "Accepted")
	{
		query = new Parse.Query("Volunteer");
		query.get(request.object.get("volunteerid"), 
		{
			success: function(volunteer) 
			{
				console.log("Found volunteer");
			},
			error: function(error) 
			{
				console.error("Got an error ");
			}
		});
	}
});

// Attach the Express app to Cloud Code.
app.listen();
