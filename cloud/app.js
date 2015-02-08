
var Mailjet = require('cloud/mailjet.js');
var mailjet = new Mailjet('0ad8eeffdecad5a851ecca2495db032e', '94cdf2db5cac440d458c94e5e461fed8');

// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body

function CreateRequest(category, grannyEmail, message, subject, startTime, res)
{
	console.log('CreateRequest');
	
	var Granny = Parse.Object.extend("Granny");
	var query = new Parse.Query(Granny);
	query.equalTo("email", grannyEmail); 

	query.find(
	{
		 success: function(results) {
			var granny = results[0];
			var Request = Parse.Object.extend("Request");
			var request = new Request();

			request.save( 
			{ 
				requestName: category,
				distance: "5.2",
				grannyid: granny.id,
				grannieName: granny.get("firstname") + ' ' + granny.get("lastname"),
				img: granny.get("profilePicture").name(),
				status: "Active",
				startTime: startTime,
				message: message,
				subject: subject,
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
}

app.post('/requestahelper', function(req, res) 
{
	var grannyEmail = req.body.Sender; 

	var message=req.body['Text-part'];
	var subject=req.body.Subject;
	var startTime = "12:30 PM";
	var category = "other";
	console.log(req.body);
	
	Parse.Cloud.httpRequest(
	{
		url: 'https://api.idolondemand.com/1/api/sync/querytextindex/v1', 
		params: 
		{
			text : message,
			apikey: 'a8b4944c-d2c0-4454-982f-6235ed5e5988',
			indexes: 'task',
			print: 'all'
		},
		success: function(httpResponse) 
		{
			console.log(httpResponse);
			if(httpResponse.status == 200 && httpResponse.data != null && httpResponse.data.documents != null && httpResponse.data.documents.length > 0)
			{
				var category = httpResponse.data.documents[0].title;
				console.log('found a match: ' + category);
			}
			else
			{
				console.log('no match found');
			}
			
			CreateRequest(category, grannyEmail, message, subject, startTime, res);
		},
		error: function(httpResponse) 
		{
			console.error('Request failed with response code ' + httpResponse.status);
			CreateRequest(category, grannyEmail, message, subject, startTime, res);
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
				mailjet.sendContent(volunteer.get("email"), 'dancheung13@gmail.com', 'test', 'text', 'body');
			},
			error: function(error) 
			{
				console.error("Got an error " + error.Code);
			}
		});
	}
});

// Attach the Express app to Cloud Code.
app.listen();
