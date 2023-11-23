const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const PublicGoogleSheetsParser = require('public-google-sheets-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const mps = new PublicGoogleSheetsParser()
const nhcta = new PublicGoogleSheetsParser()
const nhcso = new PublicGoogleSheetsParser()
const msp = new PublicGoogleSheetsParser()
const lpd = new PublicGoogleSheetsParser()
const ppd = new PublicGoogleSheetsParser()
const nhcfd = new PublicGoogleSheetsParser()
const mpbs = new PublicGoogleSheetsParser()
const { MongoClient } = require('mongodb');
const noblox = require("noblox.js")
const url = `mongodb+srv://${process.env.mongouser}:${process.env.mongopass}@cluster1.gh2rkpw.mongodb.net/`;
const client = new MongoClient(url);
const dbName = 'investigations';
client.connect();
const db = client.db(dbName);
const collection = db.collection('users');
setTimeout(() => {
	console.log('Connected to Database');
}, 2000);

const logsactive = false;

const listener = app.listen(3000, () => {
	console.log('Your app is currently listening on port: ' + listener.address().port);
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/form.html');
});
app.get('/adduser', (req, res) => {
	res.sendFile(__dirname + '/addUser.html');
});
app.get('/robot', (req, res) => {
	res.sendStatus(200)
})

async function checkDatabaseUser (user) {
	var userid
	try {
	userid = await noblox.getIdFromUsername(user)
	} catch {
		return undefined;
	}
	if (userid == undefined) return undefined;
	if (!userid) return undefined;
	const result = await collection.findOne({ "userID": `${userid}`})
	if (result) {
		return result
	} else {
		return undefined
	}
}
async function checkDatabasePlate (plate) {
	const result = await collection.findOne({ "plate.plate": `${plate}`})
	if (result) {
		return result
	} else {
		return undefined
	}
}

async function addUser(username,plate,source){
	var res;
	try {
	var userid = await noblox.getIdFromUsername([`${username}`])
	} catch {
		return res = `An Error Occurred. I could not find their userID!<button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>`
	}
	if (!userid || userid == null) return res = `An Error Occurred. I could not find their userID!<button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>`
	var doc = {
			username: `${username}`,
			userID: `${userid}`,
			"plate": {
					"plate": `${plate}`,
					"found": `${source ? source : 'UNKNOWN'}`
			},
			"knownCriminal": false,
			"isVerified": false,
			"notes": [],
			"groups": [],
			"knownAlts": [],
			"foid": {
					"isActive": false,
					"asOf": "UNKNOWN"
			},
			"location": {
					"lastLocation": "UNKNOWN",
					"asOf": "UNKNOWN"
			},
		}
	try {
		await collection.insertOne(doc);
		return res = `<h1>User Added to Database</h1><h2>${username} : ${plate}</h2><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>`
	} catch (err) {
		return res = `An Error occurred with the Database.<button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>`
	} 
}

async function checkMPSplate(searchterm){
	try {
		var founduser;
				var plate3 = searchterm.toLowerCase()
				await mps.parse(`1rnwbNKvusIxKkw4fNUr2BLjZl8UCq9xzkgXK92iWoLY`, 'Employee Records').then((items) => {
						items.forEach(item => {
				var itemplate = item['LICENSE PLATE'] ? item['LICENSE PLATE'].toLowerCase() : undefined
				if (itemplate === `${plate3}`){
				founduser = `${item.USERNAME}`
				} else {}
			})

				});
		if (!founduser){
				await mps.parse(`1rnwbNKvusIxKkw4fNUr2BLjZl8UCq9xzkgXK92iWoLY`, 'Former Employee Records').then((items) => {
						items.forEach(item => {
				var itemplate = item['LICENSE PLATE'] ? item['LICENSE PLATE'].toLowerCase() : undefined
				if (itemplate === `${plate3}`){
				founduser = `${item.USERNAME}`
				} else {}
			})

						});
		}
		const ret = founduser ? founduser : undefined
		return ret;
} catch (err) {
		console.log(`MPS Error: ` + err)
		return undefined;
}
}

async function checkMPSusername(searchterm){
	try {
		var foundplate2;
				var user3 = searchterm.toLowerCase()
				await mps.parse(`1rnwbNKvusIxKkw4fNUr2BLjZl8UCq9xzkgXK92iWoLY`, 'Employee Records').then((items) => {
						items.forEach(item => {
						var itemuser = item.USERNAME ? item.USERNAME.toLowerCase() : undefined
						if (itemuser === `${user3}`){
						if (item['LICENSE PLATE'] == 'N/A') return
						foundplate2 = item['LICENSE PLATE']
						} else {}
				})

				});
		if (!foundplate2){
				await mps.parse(`1rnwbNKvusIxKkw4fNUr2BLjZl8UCq9xzkgXK92iWoLY`, 'Former Employee Records').then((items) => {
						items.forEach(item => {
								var itemuser = item.USERNAME ? item.USERNAME.toLowerCase() : undefined
								if (itemuser === `${user3}`){
								if (item['LICENSE PLATE'] == 'N/A') return
								foundplate2 = item['LICENSE PLATE']
								} else {}
						})

						});
		}
		if (foundplate2 == 'REDACTED') { foundplate2 = undefined }
		const ret = foundplate2 ? foundplate2 : undefined
		return ret;
} catch (err) {
	console.log(`MPS Error: ` + err)
	return undefined;
}
}

async function checkTAusername(searchterm){
	try {
		var foundplate;
		var user3 = searchterm.toLowerCase()
		await nhcta.parse(`1XVqLekiMDJmI2f4a1DCxplUcAdb47F6uwotcoY4FzSs`, 'Records').then((items) => {
				items.forEach(item => {
						var itemuser = item['USERNAME '] ? item['USERNAME '].toLowerCase() : undefined
						if (itemuser === `${user3}`){
						foundplate = `${item['LICENSE PLATE ']}`
						} else return
				})
		})
		if (foundplate == 'REDACTED') { foundplate = undefined }
		const ret = foundplate ? foundplate : undefined
		return ret;
} catch (err) {
	console.log(`TA Error: ` + err)
	return undefined;
}
}

async function checkTAplate(searchterm){
	try {
		var founduser;
		var plate3 = searchterm.toLowerCase()
		await nhcta.parse(`1XVqLekiMDJmI2f4a1DCxplUcAdb47F6uwotcoY4FzSs`, 'Records').then((items) => {
				items.forEach(item => {
						var itemplate = item['LICENSE PLATE '] ? item['LICENSE PLATE '].toLowerCase() : 'undefined'
						if (itemplate === `${plate3}`){
						founduser = `${item['USERNAME ']}`
						} else return
				})
		});
		const ret = founduser ? founduser : undefined
		return ret;
} catch (err) {
	console.log(`TA Error: ` + err)
	return undefined;
}
} 

async function checkSOusername(searchterm){
	try {
		var foundplate;
		var user3 = searchterm.toLowerCase()
		await nhcso.parse(`1XyhwQ2wWEQXLHGrLgnQO96eVizpBzfSqBP3EzsLjh0w`, 'Employment Records').then((items) => {
				items.forEach(item => {
						var itemuser = item['NEW HAVEN COUNTY Sheriff robloxwolf123 EMPLOYEE NAME '] ? item['NEW HAVEN COUNTY Sheriff robloxwolf123 EMPLOYEE NAME '].toLowerCase() : undefined
						if (itemuser === `${user3}`){
						foundplate = `${item['PLATE ']}`
						} else return
				})
		})
		const ret = foundplate ? foundplate : undefined
		return ret;
		} catch (err) {
			console.log(`SO Error: ` + err)
			return undefined;
		}
}

async function checkSOplate(searchterm){
	try {
		var founduser;
		var plate3 = searchterm.toLowerCase()
		await nhcso.parse(`1XyhwQ2wWEQXLHGrLgnQO96eVizpBzfSqBP3EzsLjh0w`, 'Employment Records').then((items) => {
				items.forEach(item => {
						var itemplate = item['PLATE '] ? item['PLATE '].toLowerCase() : undefined
						if (itemplate === `${plate3}`){
						founduser = `${item['NEW HAVEN COUNTY Sheriff robloxwolf123 EMPLOYEE NAME ']}`
						} else return
				})
		});
		const ret = founduser ? founduser : undefined
		return ret;
		} catch (err) {
			console.log(`SO Error: ` + err)
			return undefined;
		}
}

async function checkMSPusername(searchterm){
	try {
		var foundplate;
		var user3 = searchterm.toLowerCase()
		await msp.parse(`104YnB3sVB2lV-ePgivc36Ru6QtU0vHrbptyBhF3Dz5w`, 'Employee Information').then((items) => {
				items.forEach(item => {
						var itemuser = item['USERNAME '] ? item['USERNAME '].toLowerCase() : undefined
						if (itemuser === `${user3}`){
							if (item[' EMPLOYEE INFOMATION VEHICLE PLATE '] === '-') { return };
						foundplate = `${item[' EMPLOYEE INFOMATION VEHICLE PLATE ']}`
						} else return
				})
		})
		const ret = foundplate ? foundplate : undefined
		return ret;
	} catch (err) {
		console.log(`MSP Error: ` + err)
		return undefined;
	}
} 

async function checkMSPplate(searchterm){
	try {
		var founduser;
		var plate3 = searchterm.toLowerCase()
		await msp.parse(`104YnB3sVB2lV-ePgivc36Ru6QtU0vHrbptyBhF3Dz5w`, 'Employee Information').then((items) => {
				items.forEach(item => {
						var itemplate = item[' EMPLOYEE INFOMATION VEHICLE PLATE '] ? item[' EMPLOYEE INFOMATION VEHICLE PLATE '].toLowerCase() : undefined
						if (itemplate === `${plate3}`){
						founduser = `${item['USERNAME ']}`
						} else return
				})
		});
		const ret = founduser ? founduser : undefined
		return ret;
	} catch (err) {
		console.log(`MSP Error: ` + err)
		return undefined;
	}
}

async function checkLPDusername(searchterm){
	try {
		var foundplate;
		var user3 = searchterm.toLowerCase()
		await lpd.parse(`123z-0yWEpR7ak1oamV5Jzr80lTWxuR92fVOrxAb5awM`, 'Employee Roster').then((items) => {
				items.forEach(item => {
						var itemuser = item['CITY OF LANDER POLICE DEPARTMENT\nEmployee Roster USERNAME'] ? item['CITY OF LANDER POLICE DEPARTMENT\nEmployee Roster USERNAME'].toLowerCase() : undefined
						if (itemuser === `${user3}`){
						if (!item['VEHICLE PLATE']) return
						foundplate = `${item['VEHICLE PLATE']}`
						} else return
				})
		})
	if (foundplate == '-') { foundplate = undefined }
		const ret = foundplate ? foundplate : undefined
		return ret;
		} catch (err) {
			console.log(`LPD Error: ` + err)
			return undefined;
		}
}

async function checkLPDplate(searchterm){
	try {
		var founduser;
		var plate3 = searchterm.toLowerCase()
		await lpd.parse(`123z-0yWEpR7ak1oamV5Jzr80lTWxuR92fVOrxAb5awM`, 'Employee Roster').then((items) => {
				items.forEach(item => {
						var itemplate = item['VEHICLE PLATE'] ? item['VEHICLE PLATE'].toLowerCase() : undefined
						if (itemplate === `${plate3}`){
						founduser = `${item['CITY OF LANDER POLICE DEPARTMENT\nEmployee Roster USERNAME']}`
						} else return
				})
		});
		const ret = founduser ? founduser : undefined
		return ret;
		} catch (err) {
			console.log(`LPD Error: ` + err)
			return undefined;
		}
}

async function checkPPDusername(searchterm){
	try {
		var foundplate;
		var user3 = searchterm.toLowerCase()
		await ppd.parse(`1EaV0BYwLzdcFtnjkL5GDfhSd1Xa-3_07aeGh4ErsN-A`, 'DATA').then((items) => {
				items.forEach(item => {
						var itemuser = item['USERNAME'] ? item['USERNAME'].toLowerCase() : undefined
						if (itemuser === `${user3}`){
						if (item['LICENSE PLATE'] === '████████') return;
						foundplate = `${item['LICENSE PLATE']}`
						} else return
				})
		})
		const ret = foundplate ? foundplate : undefined
		return ret;
		} catch (err) {
			console.log(`PPD Error: ` + err)
			return undefined;
		}
}

async function checkPPDplate(searchterm){
	try {
		var founduser;
		var plate3 = searchterm.toLowerCase()
		await ppd.parse(`1EaV0BYwLzdcFtnjkL5GDfhSd1Xa-3_07aeGh4ErsN-A`, 'DATA').then((items) => {
				items.forEach(item => {
						var itemplate = item['LICENSE PLATE'] ? item['LICENSE PLATE'].toLowerCase() : undefined
						if (itemplate === `${plate3}`){
						founduser = `${item['USERNAME']}`
						} else return
				})
		});
		const ret = founduser ? founduser : undefined
		return ret;
		} catch (err) {
			console.log(`PPD Error: ` + err)
			return undefined;
		}
}

async function checkFDusername(searchterm){
	try {
		var foundplate;
		var user3 = searchterm.toLowerCase()
		await nhcfd.parse(`1q94VLQMzn8hzPvHSVHs5hauyRjZf47b7F8AjUC_sDEU`, 'Employment Records').then((items) => {
				items.forEach(item => {
						var itemuser = item['\n\n New Haven County Fire Department  Username  Employment Records as of 1/26/2022'] ? item['\n\n New Haven County Fire Department  Username  Employment Records as of 1/26/2022'].toLowerCase() : undefined
						if (itemuser === `${user3}`){
						if (item['License Plate '] === 'Redacted' || item['License Plate '] === '-') return;
						foundplate = `${item['License Plate ']}`
						} else return
				})
		})
		const ret = foundplate ? foundplate : undefined
		return ret;
	} catch (err) {
			console.log(`FD Error: ` + err)
			return undefined;
		}
}

async function checkFDplate(searchterm){
	try {
		var founduser;
		var plate3 = searchterm.toLowerCase()
		await nhcfd.parse(`1q94VLQMzn8hzPvHSVHs5hauyRjZf47b7F8AjUC_sDEU`, 'Employment Records').then((items) => {
				items.forEach(item => {
						var itemplate = item['License Plate '] ? item['License Plate '].toLowerCase() : undefined
						if (itemplate === `${plate3}`){
						founduser = `${item['\n\n New Haven County Fire Department  Username  Employment Records as of 1/26/2022']}`
						} else return
				})
		});
		const ret = founduser ? founduser : undefined
		return ret;
	} catch (err) {
			console.log(`FD Error: ` + err)
			return undefined;
		}
}

async function checkMPBSusername(searchterm){
	try {
		var foundplate;
		var user3 = searchterm.toLowerCase()
		await mpbs.parse(`1UrnPYNP3hg8eaXHtfqkH3YltpjzkRNImyZ7DKXHQr34`, 'Records').then((items) => {
						items.forEach(item => {
								var itemuser = item['USERNAME '] ? item['USERNAME '].toLowerCase() : undefined
										if (itemuser === `${user3}`){
										if (item['MAYFLOWER PUBLIC BROADCASTING SERVICE\t\t\t\t\t\t\t EMPLOYEE RECORDS PLATE '] === '-') return;
										foundplate = `${item['MAYFLOWER PUBLIC BROADCASTING SERVICE\t\t\t\t\t\t\t EMPLOYEE RECORDS PLATE ']}`
										} else return
						})
		})
		const ret = foundplate ? foundplate : undefined
		return ret;
		} catch (err) {
			console.log(`MPBS Error: ` + err)
			return undefined;
		}
}

async function checkMPBSplate(searchterm){
	try {
		var founduser;
		var plate3 = searchterm.toLowerCase()
		await mpbs.parse(`1UrnPYNP3hg8eaXHtfqkH3YltpjzkRNImyZ7DKXHQr34`, 'Records').then((items) => {
						items.forEach(item => {
										var itemplate = item['MAYFLOWER PUBLIC BROADCASTING SERVICE\t\t\t\t\t\t\t EMPLOYEE RECORDS PLATE '] ? item['MAYFLOWER PUBLIC BROADCASTING SERVICE\t\t\t\t\t\t\t EMPLOYEE RECORDS PLATE '].toLowerCase() : undefined
										if (itemplate === `${plate3}`){
										founduser = `${item['USERNAME ']}`
										} else return
						})
		});
		const ret = founduser ? founduser : undefined
		return ret;
		} catch (err) {
			console.log(`MPBS Error: ` + err)
			return undefined;
		}
}




app.post('/form-results', urlencodedParser, async (req, res) => {
  var username = req.body.user_name;
  var plate = req.body.license_plate;
	var foundplate,founduser;
	if (!plate && !username) return res.send(`<h1> You did not enter anything! </h1>`)
	if (username && plate) {
		searchterm = 'username'
	} else if (username && !plate) {
		searchterm = 'username'
	} else if (plate && !username){
		searchterm = 'plate'
	}
	
	if (searchterm == 'username'){
	var datauser = await checkDatabaseUser(username)
	if (datauser) {
		//return res.send(datauser)
		return res.send(`<h1>User Found in Database</h1><h2>Username: ${datauser.username}</h2><h2>License Plate: ${datauser.plate.plate}</h2><h3>Source: ${datauser.plate.found}</h3> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>`)
	}
	foundplate = await checkMPSusername(username)
	if (foundplate){
		if (logsactive) { console.log('MPS') }
		var response = await addUser(username, foundplate,'MPS')
		return res.send(`<h1>Username: ${username}</h1><h1>License Plate: ${foundplate}</h1> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
	} else {
	foundplate = await checkTAusername(username)
	if (foundplate){
		if (logsactive) { console.log('TA') }
		var response = await addUser(username, foundplate,'NHCTA')
		return res.send(`<h1>Username: ${username}</h1><h1>License Plate: ${foundplate}</h1> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
	} else { 
		foundplate = await checkSOusername(username)
		if (foundplate) {
			if (logsactive) { console.log('SO') }
			var response = await addUser(username, foundplate,'NHCSO')
			return res.send(`<h1>Username: ${username}</h1><h1>License Plate: ${foundplate}</h1> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
		} else {
		foundplate = await checkMSPusername(username)
			if (foundplate) {
				if (logsactive) { console.log('MSP') }
				var response = await addUser(username, foundplate,'MSP')
				return res.send(`<h1>Username: ${username}</h1><h1>License Plate: ${foundplate}</h1> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
			} else {
			foundplate = await checkLPDusername(username)
			if (foundplate) {
				if (logsactive) { console.log('LPD') }
				var response = await addUser(username, foundplate,'LPD')
					return res.send(`<h1>Username: ${username}</h1><h1>License Plate: ${foundplate}</h1> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
				} else {
				foundplate = await checkPPDusername(username)
				if (foundplate) {
					if (logsactive) { console.log('PPD') }
					var response = await addUser(username, foundplate,'PPD')
						return res.send(`<h1>Username: ${username}</h1><h1>License Plate: ${foundplate}</h1> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
					} else {
				foundplate = await checkFDusername(username)
					if (foundplate) {
						if (logsactive) { console.log('FD') }
						var response = await addUser(username, foundplate,'NHCFD')
						return res.send(`<h1>Username: ${username}</h1><h1>License Plate: ${foundplate}</h1> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
						} else {
				foundplate = await checkMPBSusername(username)
						if (foundplate) {
							var response = await addUser(username, foundplate,'MPBS')
							if (logsactive) { console.log('MPBS') }
						return res.send(`<h1>Username: ${username}</h1><h1>License Plate: ${foundplate}</h1> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
							} else {


								return res.send(`<h1>Username: ${username}</h1><h1>License Plate: Not Found</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button><button onclick="window.location.href='https://clearplate.unknown342.repl.co/adduser';"style="border-color:red">MANUALLY ADD USER</button>`);
						}
					}
				}
			}
				
		}
			
		}
	}
		
	} 
	} else if (searchterm == 'plate'){
		var dataplate = await checkDatabasePlate(plate)
		if (dataplate) {
			//return res.send(datauser)
			return res.send(`<h1>Plate Found in Database</h1><h2>Username: ${dataplate.username}</h2><h2>License Plate: ${plate}</h2><h3>Source: ${dataplate.plate.found}</h3> <button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>`)
		}
		founduser = await checkMPSplate(plate)
	if (founduser){
		if (logsactive) { console.log('MPS') }
		var response = await addUser(founduser, plate,'MPS')
		return res.send(`<h1>License Plate: ${plate}</h1><h1>Username: ${founduser}</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
	} else {
		founduser = await checkTAplate(plate)
		if (founduser){
			if (logsactive) { console.log('TA') }
			var response = await addUser(founduser, plate,'NHCTA')
			return res.send(`<h1>License Plate: ${plate}</h1><h1>Username: ${founduser}</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`);
		} else {
		founduser = await checkSOplate(plate)
		if (founduser){
			if (logsactive) { console.log('SO') }
			var response = await addUser(founduser, plate,'NHCSO')
			return res.send(`<h1>License Plate: ${plate}</h1><h1>Username: ${founduser}</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`)
		} else {
			founduser = await checkMSPplate(plate)
			if (founduser){
				if (logsactive) { console.log('MSP') }
				var response = await addUser(founduser, plate,'MSP')
				return res.send(`<h1>License Plate: ${plate}</h1><h1>Username: ${founduser}</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`)
			} else {
			founduser = await checkLPDplate(plate)
				if (founduser){
					if (logsactive) { console.log('LPD') }
					var response = await addUser(founduser, plate,'LPD')
						return res.send(`<h1>License Plate: ${plate}</h1><h1>Username: ${founduser}</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`)
					} else {
				founduser = await checkPPDplate(plate)
					if (founduser){
						if (logsactive) { console.log('PPD') }
						var response = await addUser(founduser, plate,'PPD')
							return res.send(`<h1>License Plate: ${plate}</h1><h1>Username: ${founduser}</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`)
						} else {
					founduser = await checkFDplate(plate)
						if (founduser){
							if (logsactive) { console.log('FD') }
							var response = await addUser(founduser, plate,'NHCFD')
								return res.send(`<h1>License Plate: ${plate}</h1><h1>Username: ${founduser}</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`)
							} else {
						founduser = await checkMPBSplate(plate)
							if (founduser){
								var response = await addUser(founduser, plate,'MPBS')
								if (logsactive) { console.log('MPBS') }
									return res.send(`<h1>License Plate: ${plate}</h1><h1>Username: ${founduser}</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>${response}`)
								} else {


									return res.send(`<h1>License Plate: ${plate}</h1><h1>Username: Not Found</h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button><button onclick="window.location.href='https://clearplate.unknown342.repl.co/adduser';"style="border-color:red">MANUALLY ADD USER</button>`);

							}
						}
					}
				}
			
		}
		}	
	}
		
	}
		
} else {
		return res.send(`An error occurred!`)
	}
});

app.get('/form-results', (req, res) => {
	res.redirect('https://clearplate.unknown342.repl.co/');
});

app.post('/add-user', urlencodedParser, async (req, res) => {
	var username = req.body.user_name;
	var plate = req.body.license_plate;
	var foundplate,founduser;
	if (!plate && !username) return res.send(`<h1> You did not enter anything! </h1><button onclick="window.location.href='https://clearplate.unknown342.repl.co/';">DONE</button>`)
	let response = await addUser(username,plate,`Unknown's Investigations`)
	res.send(response)
});