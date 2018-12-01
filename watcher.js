const $ = require('cheerio');
const request = require('request');
const settings = require('./settings');

// Your accountSid and authToken from twilio.com/user/account
const accountSid = settings.accountSid;
const authToken = settings.authToken;
const twilio_number = settings.twilio_number;
const recipient_phone_number = settings.recipient_phone_number;
const crn = settings.crn;
const term = settings.term;
const client = require('twilio')(accountSid, authToken);

function gotHTML(err, resp, html) {
	if (err) return console.error(err)
	let parsedHTML = $.load(html);
	parsedHTML('.ddlabel').map(function (i, elem) {
		elem = $(elem);
		if (i == 0) //the first ddlabel is the course name
		{
			let coursename = elem.text();

			//get the number of spots
			parsedHTML('td').map(function (i, elem) {
				elem = $(elem);
				if (i == 10) //the 10th TD is the number of spots available
				{
					let spots = elem.text();
					let msg = coursename + " has " + spots + " spots";
					console.log(msg);
					if (spots != 0) {
						client.messages.create({
							body: msg,
							to: recipient_phone_number,
							from: twilio_number
						}, function (err, message) {
							process.stdout.write(message.sid);
						});
					}
				}
			});
		}
	});
}

crn.forEach(element => {
	let domain = 'https://selfservice.mypurdue.purdue.edu/prod/bwckschd.p_disp_detail_sched?term_in=' + term + '&crn_in=' + element;
	setInterval(function () { request(domain, gotHTML); }, 60000);
});
