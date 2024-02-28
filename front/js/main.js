window.onload = checkLoginForIndex;

let socket;
let gameSocket
export let gameRoomCode;

let inGame = false;

function checkLoginForIndex() {
	if (localStorage.getItem('isLogged') === "false" || localStorage.getItem('isLogged') === null) {
		updateNavbar();
		routeToLogin();
	}
	else if (localStorage.getItem('isLogged') === "true" && (window.location.pathname === "/login" || window.location.pathname === "/register")) {
		updateNavbar();
		routeToIndex();
	}
	else {

		updateNavbar();
		socketConnection();
	}
}

function routeToLogin() {
	const event = {
		target: {
			href: '/login'
		},
		preventDefault: () => { }
	};

	urlRoute(event);
}

function routeToRegister() {
	const event = {
		target: {
			href: '/register'
		},
		preventDefault: () => { }
	};

	urlRoute(event);
}

function routeToIndex() {
	const event = {
		target: {
			href: '/'
		},
		preventDefault: () => { }
	};

	urlRoute(event);

}

async function routeGame() {
	return new Promise((resolve, reject) => {
		const event = {
			target: {
				href: '/play'
			},
			preventDefault: () => { }
		};
		urlRoute(event);
		resolve();
	});
}

document.addEventListener("click", (e) => {
	const { target } = e;
	if (!target.matches("nav a")) {
		return;
	}
	e.preventDefault();
	urlRoute(e);
});

function updateNavbar() {
	const navbar = document.querySelector('nav');
	if (!navbar) {
		console.error('Navbar not found');
		return;
	}

	if (localStorage.getItem("isLogged") === "true") {
		navbar.style.display = 'block';
		document.getElementById('dropDownBtnMain').textContent = localStorage.getItem('user');
	} else {
		navbar.style.display = 'none';
	}
}

const urlRoutes = {
	404: {
		template: "./templates/404.html",
		title: "404",
		description: "",
		siteTitle: "404"
	},
	"/": {
		template: "./templates/index.html",
		title: "home",
		description: "",
		siteTitle: "Home Page"
	},
	"/chatRoom": {
		template: "./templates/chatRoom.html",
		title: "chatRoom",
		description: "",
		siteTitle: "Chat Room"
	},
	"/play": {
		template: "./templates/game.html",
		title: "play",
		description: "",
		// script: "./js/pong.js",
		siteTitle: "Game"
	},
	"/profile": {
		template: "./templates/profile.html",
		title: "profile",
		description: "",
		siteTitle: "Profile"
	},
	"/login": {
		template: "./templates/login.html",
		title: "login",
		description: "",
		siteTitle: "Login"
	},
	"/register": {
		template: "./templates/register.html",
		title: "register",
		description: "",
		siteTitle: "Register"
	},
	"/search": {
		template: "./templates/search.html",
		title: "search",
		description: "",
		siteTitle: "Search"
	},
	"/online": {
		template: "./templates/online.html",
		title: "online",
		description: "",
		siteTitle: "Online"
	},
	"/offline": {
		template: "./templates/offline.html",
		title: "offline",
		description: "",
		siteTitle: "Offline"
	},
	"/online_game": {
		template: "./templates/online_game.html",
		title: "online",
		description: "",
		siteTitle: "Online"
	},
	"/offline": {
		template: "./templates/offline.html",
		title: "offline",
		description: "",
		siteTitle: "Offline"
	},
	"/matchHistory": {
		template: "./templates/matchHistory.html",
		title: "matchHistory",
		description: "",
		siteTitle: "Match History"
	}
};

const pageNames = [
	"home",
	"matchHistory"
]

const urlRoute = (event) => {
	event.preventDefault();
	window.history.pushState({}, "", event.target.href);
	urlLocationHandler();
};

const urlLocationHandler = async () => {
	try {
		const location = window.location.pathname;
		if (location.length == 0) {
			location = "/";
		}
		if (location === "/play" && inGame === false) {
			const event = {
				target: {
					href: '/offline'
				},
				preventDefault: () => { }
			};
			urlRoute(event);
			return;
		}
		const route = urlRoutes[location] || urlRoutes[404];
		const html = await fetch(route.template).then((response) => response.text());
		let elm = document.getElementById("content");
		elm.innerHTML = html;
		for (let i = 0; i < pageNames.length; i++) {
			if (pageNames[i] === route.title) {
				if (route.title === "online" || route.title === "offline") {
					document.getElementById("btnDropDownPlay").classList.add("active");
					document.getElementById("siteTitle").innerText = route.siteTitle;
				}
				else {
					document.querySelector("#" + route.title + "").classList.add("active");
					document.getElementById("siteTitle").innerText = route.siteTitle;
				}
			} else {
				if (pageNames[i] === "online" || pageNames[i] === "offline") {
					document.getElementById("btnDropDownPlay").classList.remove("active");
				}
				else {
					document.querySelector("#" + pageNames[i] + "").classList.remove("active");
				}
			}
		}
		if (route.script) {
			await loadScript(route.script);
		}
		if (route.title === "profile") {
			getProfile();
			fillProfile();
		}
		if (route.title === "home") {
			fetchFriends();
		}
		if (route.title === "matchHistory") {
			fetchMatchHistory("all");
		}
		if (gameSocket) {
			if (gameSocket.readyState === 1 || gameSocket.readyState === 0) {
				gameSocket.close();
			}
		}
	} catch (error) {
		console.error('Error(UrlLocationHandler):', error);
	}
};

// Helper function to dynamically load script
const loadScript = async (scriptPath) => {
	try {
		return new Promise((resolve, reject) => {
			const nav = document.getElementById("nav");


			const content = document.getElementById("content");

			content.innerHTML = "";
			content.innerHTML = nav.innerHTML;


			const script = document.createElement("script");
			script.src = scriptPath;
			script.onload = resolve;
			script.onerror = reject;
			document.body.appendChild(script);
		});
	} catch (error) {
		console.error('Error(loadScript):', error);
	}
};

window.onpopstate = urlLocationHandler;
window.route = urlRoute;
urlLocationHandler();

document.body.addEventListener('click', function (event) {
	if (event.target.id === 'login') {
		loginFunction();
	}
	else if (event.target.id === 'register') {
		const email = document.getElementById('mail_reg').value;
		if (validatePasswordFunc() && document.getElementById('mail_reg').value.length > 0 && document.getElementById('username_reg').value.length > 0 && email.includes('@') && email.endsWith('.com')) {
			registerFunction();
		}
	}
	else if (event.target.id === 'logOut') {
		logOut();
	}
	else if (event.target.id === 'registerRouteBtn') {
		routeToRegister();
	}
	else if (event.target.id === 'LoginRegisterA') {
		routeToLogin();
	}
	else if (event.target.id === 'inviteGame') {
		inviteGame();
	}
	else if (event.target.id === 'addFriendBtn') {
		var username = event.target.parentElement.querySelector('h4 b').textContent;
		console.log(username);
		friendRequests(username);
	}
	else if (event.target.id === 'messageBtn') {
		sendMessage();
	}
	else if (event.target.id === 'createRoom') {
		fetchInvite();
	}
	else if (event.target.id === 'joinRoom') {
		let joinRoomCode = document.getElementById('roomCode').value;
		joinRoom(joinRoomCode);
		document.getElementById('roomCode').value = '';
	}
	else if (event.target.id === 'PlayVs') {
		document.getElementById('offlineMainDiv').style.display = 'none';
		document.getElementById('offlineVsDiv').style.display = 'block';
	}
	else if (event.target.id === 'PlayTournament') {
		document.getElementById('offlineMainDiv').style.display = 'none';
		document.getElementById('offlineTournamentDiv').style.display = 'block';
	}
	else if (event.target.id === 'PlayAi') {
		document.getElementById('offlineMainDiv').style.display = 'none';
		document.getElementById('offlineAiDiv').style.display = 'block';
	}
	else if (event.target.id === 'backToMainVs') {
		document.getElementById('offlineVsDiv').style.display = 'none';
		document.getElementById('offlineMainDiv').style.display = 'block';
	}
	else if (event.target.id === 'backToMainAi') {
		document.getElementById('offlineAiDiv').style.display = 'none';
		document.getElementById('offlineMainDiv').style.display = 'block';
	}
	else if (event.target.id === 'backToMainTournament') {
		document.getElementById('offlineTournamentDiv').style.display = 'none';
		document.getElementById('offlineMainDiv').style.display = 'block';
		document.getElementById('player5Div').style.display = 'none';
		document.getElementById('player6Div').style.display = 'none';
		document.getElementById('player7Div').style.display = 'none';
		document.getElementById('player8Div').style.display = 'none';
		document.getElementById('addPlayer').style.display = 'block';
	}
	else if (event.target.id === 'listRequest') {
		getFriendRequests();
	}
	else if (event.target.id === 'acceptFriendBtn') {
		var username = event.target.parentElement.querySelector('.message-data').textContent;
		var data = {
			'username_sender': username,
			'username_receiver': localStorage.getItem('user')
		};
		event.target.parentElement.remove();
		acceptFriendRequest(data);
	}
	else if (event.target.id === 'refreshRequest') {
		document.getElementById('friend-request-list').innerHTML = '';
		getFriendRequests();
	}
	else if (event.target.id === '2faLoginInput') {
		login2fa();
	}
});

//
//login js
//
let FaModalElement;
async function loginFunction() {
	// Kullanıcı bilgilerini al
	FaModalElement = document.getElementById('2faCodeModal');
	const email = document.getElementById('typeEmailX').value;
	const password = document.getElementById('typePasswordX').value;

	var data = {
		"email": email,
		"password": password
	};

	var user;

	try {
		let response = await fetch('https://127.0.0.1:8000/login/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		let responseData = await response.json();

		if (responseData && responseData.message === 'Success' && responseData.username) {
			const username = responseData.username;
			console.log('Username:', username);
			user = {
				"username": username,
				"password": password
			};
			if (responseData.fa === true) {
				await show2fa();
				localStorage.setItem('2fa', true);
				await document.body.addEventListener('click', async function (event) {
					if (event.target.id === '2faLoginSendCodeBtn'){}
				});
			}
			await getJwt(user);
			saveData(responseData);
			window.location.href = '/';
		} else {
			document.getElementById('wrongLogin').innerHTML = "Wrong email or password";
		}
	} catch (error) {
		document.getElementById('wrongLogin').innerHTML = "Wrong email or password";
	}
}


// FaModalElement.addEventListener('hidden.bs.modal', function () {
// 	let backdrop = document.querySelector('.modal-backdrop');
// 	if (backdrop) {
// 		backdrop.remove();
// 	}
// });

async function show2fa() {
	let modal = new bootstrap.Modal(FaModalElement);
	modal.show();
}

async function login2fa() {
	const code = document.getElementById('2faCode').value;
	const data = {
		"username": localStorage.getItem('user'),
		"code": code
	};
	try {
		let response = await fetch('https://127.0.0.1:8000/2fa/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		let responseData = await response.json();

		if (responseData && responseData.message === 'Success') {
			return true;
		} else {
			document.getElementById('wrong2fa').innerHTML = "Wrong code";
		}
	} catch (error) {
		document.getElementById('wrong2fa').innerHTML = "Wrong code";
	}
}

function socketConnection() {
	socket = new WebSocket('wss://' + '127.0.0.1:8000' + '/ws/online_status/?username=' + localStorage.getItem('user') + '/');

	socket.onopen = function (e) {
		console.log("Connection established!");
	};

	socket.onclose = function (event) {
		if (event.wasClean) {
			console.log('Connection closed!');
		} else {
			console.log('Connection broken!');
		}
	}
	socket.onerror = function (error) {
		console.log('Error:', error);
	}
}

//
//jwt handler
//

async function getJwt(userData) {
	await fetch('https://127.0.0.1:8000/api/token/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(userData)
	})
		.then(response => response.json())
		.then(data => {
			if (data.access && data.refresh) {
				sessionStorage.setItem('accessToken', data.access);
				sessionStorage.setItem('refreshToken', data.refresh);
			}
		})
		.catch(error => console.error('Error:', error));
}

async function fetchWithRefresh(url, options) {
	try {
		let response = await fetch(url, options);

		if (!response.ok && response.status === 401) {
			// Eğer 401 hatası alırsak, refresh token işlemi yap
			const refreshToken = sessionStorage.getItem('refreshToken');
			var data = {
				"refresh": refreshToken
			};
			const refreshResponse = await fetch('https://127.0.0.1:8000/api/token/refresh/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			const refreshData = await refreshResponse.json();
			sessionStorage.setItem('accessToken', refreshData.access);

			// İsteği tekrar yap
			options.headers['Authorization'] = 'Bearer ' + refreshData.access;
			response = await fetch(url, options);
		}

		return response;
	} catch (error) {
		console.error('Error:', error);
	}
}

//
//register js
//

document.body.addEventListener('input', function (event) {
	if (event.target.id === 'pass_reg1') {
		validatePasswordFunc();
	}
});


function validatePasswordFunc() {
	var password = document.getElementById('pass_reg1').value;
	try {
		validatePassword(password);
		document.getElementById('wrongPassArea').innerHTML = "";
		return true;
	} catch (error) {
		document.getElementById('wrongPassArea').innerHTML = error.message;
		return false;
	}
}

function validatePassword(value) {
	// Add strong password rules here
	if (!/[A-Z]/.test(value)) {
		throw new Error("Password must contain at least one uppercase letter.");
	}
	else if (!/[a-z]/.test(value)) {
		throw new Error("Password must contain at least one lowercase letter.");
	}
	else if (!/[0-9]/.test(value)) {
		throw new Error("Password must contain at least one digit.");
	}
	else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
		throw new Error("Password must contain at least one special character.");
	}
	else if (value.length < 8) {
		throw new Error("Password must be at least 8 characters long.");
	}
	return value;
}

async function registerFunction() {
	const username = document.getElementById('username_reg').value;
	const email = document.getElementById('mail_reg').value;
	const password = document.getElementById('pass_reg1').value;

	var user = {
		"email": email,
		"password": password,
		"username": username
	};

	fetch("https://127.0.0.1:8000/signup/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(user)
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.message === 'Signup successful') {
				routeToLogin();	//redirect to login page
			} else {
				alert(data.message, "danger");
			}
		});
}


//
//LogOut js
//

function logOut() {
	logOutFetch();
	localStorage.clear();
	sessionStorage.clear();
	checkLoginForIndex()
}

function logOutFetch() {
	var data = {
		"username": localStorage.getItem('user')
	};

	fetch('https://127.0.0.1:8000/logout/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);

		})
		.catch(error => console.error('Error:', error));
}


//
//Profile js
//

document.body.addEventListener('click', function (event) {
	if (event.target.id === 'updateProfileBtn') {
		updateProfile();
	}
});


//fill profile areas with localstorage data
function fillProfile() {
	document.getElementById('userName').textContent = localStorage.getItem('user');
	document.getElementById('profileBio').textContent = localStorage.getItem('bio');
	document.getElementById('winCount').setAttribute('aria-valuenow', (localStorage.getItem('win_count') / (localStorage.getItem('win_count') + localStorage.getItem('lose_count'))) * 100);
	document.getElementById('loseCount').setAttribute('aria-valuenow', (localStorage.getItem('lose_count') / (localStorage.getItem('win_count') + localStorage.getItem('lose_count'))) * 100);
}

document.body.addEventListener('change', function (e) {
	if (e.target.id === 'inputProfilePic') {
		var file = e.target.files[0];

		if (file.size > 2 * 1024 * 1024) {
			alert('File size must be less than 2MB');
			document.getElementById('inputProfilePic').value = '';
			document.getElementById('preview').style.display = 'none';
			return;
		}

		readURL(e.target);
		document.getElementById('preview').style.display = 'block';
	}
});

function readURL(input) {
	console.log(input.files);
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function (e) {
			document.getElementById('preview').src = e.target.result;
		}

		reader.readAsDataURL(input.files[0]);
	}
}


function updateProfile() {
	const input = document.getElementById('inputProfilePic');
	const file = input.files[0];
	const formData = new FormData();
	const data = {
		"username": localStorage.getItem('user'),
		"new_username": document.getElementById('inputProfileUsername').value,
		"bio": document.getElementById('bio').value
	};
	if (file) {
		formData.append('avatar', file);
	}
	formData.append('data', JSON.stringify(data));

	fetchWithRefresh('https://127.0.0.1:8000/update_profile/', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
		},
		body: formData,
	})
		.then(response => response.json())
		.then(data => {
			if (document.getElementById('inputProfileUsername').value) {
				localStorage.setItem('user', document.getElementById('inputProfileUsername').value);
			}
			if (document.getElementById('bio').value) {
				localStorage.setItem('bio', document.getElementById('bio').value);
			}
			if (file) {
				localStorage.setItem('avatar', URL.createObjectURL(file));
				document.getElementById('profileAvatar').src = URL.createObjectURL(file);
			}
			document.getElementById('inputProfileUsername').value = '';
			document.getElementById('bio').value = '';
			document.getElementById('inputProfilePic').value = '';
			document.getElementById('preview').style.display = 'none';
		})
		.catch(error => console.error('Error:', error));
}

function saveData(data) {
	localStorage.setItem('user', data.username);
	localStorage.setItem('bio', data.bio);
	localStorage.setItem('win_count', data.win_count);
	localStorage.setItem('lose_count', data.lose_count);
	// localStorage.setItem('2fa', data.2fa);
	//localStorage.setItem('id', data.id);
	//localStorage.setItem('score', data.score);
	//localStorage.setItem('rank', data.rank);
	//localStorage.setItem('draws', data.draws);
	//localStorage.setItem('avatar', data.avatar);
	localStorage.setItem('isLogged', true);
}

async function getProfile() {
	var data = {
		"username": localStorage.getItem('user')
	};

	try {
		const profileResponse = await fetchWithRefresh('https://127.0.0.1:8000/show_profile/', {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		const profileData = await profileResponse.json();
		if (profileData && profileData.message != "No username provided") {
			console.log(profileData);
			localStorage.setItem('user', profileData.username);
			localStorage.setItem('bio', profileData.profile.bio);
			localStorage.setItem('win_count', profileData.profile.win_count);
			localStorage.setItem('lose_count', profileData.profile.lose_count);
			const isOnline = profileData.profile.online_status;
		}
	} catch (error) {
		console.error('Error:', error);
	}

	try {
		const avatarResponse = await fetchWithRefresh('https://127.0.0.1:8000/get_avatar/', {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		const avatarData = await avatarResponse.blob();
		if (avatarData) {
			const img = document.getElementById('profileAvatar');
			//img.src = URL.createObjectURL(avatarData);
			localStorage.setItem('avatar', URL.createObjectURL(avatarData));
			img.src = localStorage.getItem('avatar');
		}
	} catch (error) {
		console.error('Error:', error);
	}
	fillProfile();
}

function getAvatar() {
	var data = {
		"username": localStorage.getItem('user')
	};
	fetchWithRefresh('https://127.0.0.1:8000/get_avatar/', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
		})
		.catch(error => console.error('Error:', error));
}

//
//ChatRoom js
//


function fetchFriends() {
	var data = {
		"username": localStorage.getItem('user')
	};
	console.log(data);
	fetchWithRefresh("https://127.0.0.1:8000/list_friends/", {
		method: "POST",
		headers: {
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
			"Content-Type": "application/json"
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			const chatList = document.querySelector('.chat-list');
			if (data && data.friends) {
				console.log(data);
				chatList.innerHTML = '';
				data.friends.forEach(friend => {
					const li = document.createElement('li');
					li.classList.add('clearfix', 'friendArea');

					const divAbout = document.createElement('div');
					divAbout.classList.add('about');

					const divName = document.createElement('div');
					divName.classList.add('name', 'friendName');
					divName.textContent = friend.username;
					divAbout.appendChild(divName);

					const divStatus = document.createElement('div');
					divStatus.classList.add('status');
					divStatus.innerHTML = friend.online == true ? '<i class="fa fa-circle online"></i> online' : '<i class="fa fa-circle offline"></i> offline';
					divAbout.appendChild(divStatus);

					chatList.appendChild(divAbout);
					chatList.appendChild(li);
				});
			}
		})
		.catch(error => console.error('Error:', error));
}

function fetchMessages() {
	var data = {
		"user_sender": localStorage.getItem('user'),
		"user_receiver": document.getElementById('aboutChatUser').textContent
	};
	fetch('https://127.0.0.1:8000/room/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			const messageList = document.querySelector('.message-list');
			messageList.innerHTML = '';

			data.messages.forEach(message => {
				const li = document.createElement('li');
				li.className = 'clearfix';
				if (message.user_sender === localStorage.getItem('user') && message.user_receiver === document.getElementById('aboutChatUser').textContent) {
					li.innerHTML = '<div class="message-data float-right">' + message.user_sender + '</div><div class="message other-message float-right">' + message.content + '</div>';
				}
				else if (message.user_sender === document.getElementById('aboutChatUser').textContent && message.user_receiver === localStorage.getItem('user')) {
					li.innerHTML = '<div class="message-data">' + message.user_sender + '</div><div class="message my-message">' + message.content + '</div>';
				}
				messageList.appendChild(li);
			});
		})
		.catch(error => console.error('Error:', error));
}

//Denenecek inş çalışır
//setInterval(fetchMessages, 5000);

//
//Invite game js
//

function inviteGame() {
	var username = document.getElementById('aboutChatUser').textContent;
	var data = {
		"username": username
	};

	fetchWithRefresh('invite', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
		})
		.catch(error => console.error('Error:', error));
}


//
//Add Friend and Requests js
//

document.body.addEventListener('keydown', async function (event) {

	if (event.key === 'Enter' && event.target.id === 'addFriendUsername') {
		event.preventDefault();
		routeToSearch();
		searchUser();
	}
	else if (event.key === 'Enter' && window.location.pathname === "/login")
		loginFunction();
	else if (event.key === 'Enter' && window.location.pathname === "/register")
		registerFunction();
});

async function routeToSearch() {
	const event = {
		target: {
			href: '/search' // yönlendirme yapmak istediğiniz URL
		},
		preventDefault: () => { } // bu fonksiyonun varlığı gereklidir, ancak burada bir işlem yapmasına gerek yoktur
	};
	urlRoute(event);
}


function searchUser() {
	var username = document.getElementById('addFriendUsername').value;
	var data = {
		"username": username,
		"username_sender": localStorage.getItem('user')
	};
	console.log(data);
	fetchWithRefresh(`https://127.0.0.1:8000/find_user/`, {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			if (data && data.success === true) {
				console.log(data);
				const profileCards = document.getElementById('profileCards');
				document.getElementById('notFoundSearch').style.display = 'none';
				data.user_infos.forEach(user => {
					const card = document.createElement('div');
					card.classList.add('card');

					card.innerHTML = '<div class="container"><h4><b>' + user.username + '</b></h4><p>' + user.bio + '</p><button id="addFriendBtn" class="btn btn-primary">Add Friend</button></div>';
					profileCards.appendChild(card);
				});
			}
			else {
				document.getElementById('notFoundSearch').style.display = 'block';
			}
		})
		.catch(error => console.error('Error:', error));
	document.getElementById('addFriendUsername').value = '';
}

function friendRequests(username) {
	var data = {
		'username_sender': localStorage.getItem('user'),
		'username_receiver': username
	};
	console.log(data);
	fetchWithRefresh('https://127.0.0.1:8000/send_friend_request/', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
		})
		.catch(error => console.error('Error:', error));
}


function getFriendRequests() {
	var data = {
		"username": localStorage.getItem('user')
	};
	fetchWithRefresh('https://127.0.0.1:8000/get_friend_requests/', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			const friendRequests = document.getElementById('friend-request-list');
			//friendRequests.innerHTML = '';
			if (data.message === "No friend requests") {
				document.getElementById('zeroRequest').style.display = 'block';
			}
			else {
				data.friend_requests.forEach(request => {
					document.getElementById('zeroRequest').style.display = 'none';
					const li = document.createElement('li');
					li.className = 'clearfix';
					li.innerHTML = '<div class="message-data">' + request.username + '</div><button id="acceptFriendBtn" class="btn btn-primary">Add Friend</button>';
					friendRequests.appendChild(li);
				});
			}
		})
		.catch(error => console.error('Error:', error));
}

function acceptFriendRequest(data) {
	fetchWithRefresh('https://127.0.0.1:8000/accept_friend_request/', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
		.then(response => response)
		.then(data => {
		})
		.catch(error => console.error('Error:', error));
}

//
//Send Message js
//

document.body.addEventListener('keydown', function (event) {

	if (event.key === 'Enter' && event.target.id === 'messageInput') {
		event.preventDefault();
		sendMessage();
	}
});

function sendMessage() {
	var username = document.getElementById('aboutChatUser').textContent;
	var message = document.getElementById('messageInput').value;
	if (message.length === 0) {
		return;
	}
	var data = {
		"user_sender": localStorage.getItem('user'),
		"user_receiver": username,
		"content": message
	};
	socket.send(JSON.stringify(data));

	document.getElementById('messageInput').value = '';
}


//
//online js
//

function fetchInvite() {
	var data = {
		"username": localStorage.getItem('user')
	};
	fetchWithRefresh('https://127.0.0.1:8000/create_room/',
		{
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(response => response.json())
		.then(data => {
			if (data && data.room) {
				console.log(data.room);
				document.getElementById('inviteDiv').style.display = 'none';
				document.getElementById('inviteCodeDiv').style.display = 'block';
				document.getElementById('roomCodeSpan').textContent = data.room;
				inGame = true;
				routeGame();
				connectGameSocket(data.room);
			}
		})
		.catch(error => console.error('Error:', error));
}

async function connectGameSocket(roomCode) {
	await urlLocationHandler();
	document.getElementById('matchup').textContent = 'Room Code: ' + roomCode;
	const canvas = document.getElementById('gameCanvas');
	const ctx = canvas.getContext('2d');
	let gameStarted = false;
	const roomName = roomCode;
	gameSocket = new WebSocket('wss://' + "127.0.0.1:8000" + '/ws/game/' + roomName + '/');
	// document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', handleKeyDown);

	let paddle1Y = 250;
	let paddle2Y = 250;
	let ballX = 450;
	let ballY = 300;
	let score1 = 0;
	let score2 = 0;

	function handleKeyDown(e) {
		if (e.key === 'w' && paddle1Y > 0) {
			paddle1Y -= 50;
		} else if (e.key === 's' && paddle1Y < canvas.height - 100) {
			paddle1Y += 50;
		} else if (e.key === 'ArrowUp' && paddle2Y > 0) {
			paddle2Y -= 50;
		} else if (e.key === 'ArrowDown' && paddle2Y < canvas.height - 100) {
			paddle2Y += 50;
		}

		sendPaddlePositions();
	}

	function sendPaddlePositions() {
		const data = {
			'paddle1Y': paddle1Y,
			'paddle2Y': paddle2Y,
		};
		gameSocket.send(JSON.stringify(data));
	}

	gameSocket.onmessage = function (event) {
		const data = JSON.parse(event.data);

		console.log(data);
		if (data.start_game === true) {
			gameStarted = true;
		}
		if (window.location.pathname != '/play') {
			gameSocket.close();
		}
		if (!gameStarted) {
			return;
		}
		if (data.game_end === true) {
			alert('Game end!');
			gameSocket.close();
			history.replaceState(null, null, '/');
			inGame = false;
			routeToOnline();
			return;
		}
		if (data.AFK === true) {
			gameSocket.close();
			history.replaceState(null, null, '/');
			inGame = false;
			routeToOnline();
			alert('Your opponent is AFK');
			return;
		}

		paddle1Y = data.paddle1Y;
		paddle2Y = data.paddle2Y;
		ballX = data.ballX;
		ballY = data.ballY;
		score1 = data.score1;
		score2 = data.score2;

		drawGame();
	};

	function drawGame() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillRect(0, paddle1Y, 10, 100);
		ctx.fillRect(canvas.width - 10, paddle2Y, 10, 100);

		ctx.beginPath();
		ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
		ctx.fill();

		ctx.font = '24px Arial';
		ctx.fillText('Score: ' + score1 + ' - ' + score2, canvas.width / 2 - 70, 30);
	}
}
function routeToOnline() {
	const event = {
		target: {
			href: '/online'
		},
		preventDefault: () => { }
	};
	urlRoute(event);
}

function joinRoom(joinRoomCode) {

	var data = {
		"username": localStorage.getItem('user'),
		"room": joinRoomCode
	};
	fetchWithRefresh('https://127.0.0.1:8000/join_room/',
		{
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(response => response.json())
		.then(data => {
			if (data && data.success === true) {
				inGame = true;
				routeGame();
				connectGameSocket(joinRoomCode);
			}
		})
		.catch(error => console.error('Error:', error));
}

//
//tournament
//

let tourPlayerCount = 0;

document.body.addEventListener('click', function (event) {
	if (event.target.id === 'addPlayer') {
		if (document.getElementById('player5Div').style.display === 'none') {
			document.getElementById('player5Div').style.display = 'block';
			document.getElementById('player6Div').style.display = 'block';
			document.getElementById('player7Div').style.display = 'block';
			document.getElementById('player8Div').style.display = 'block';
			document.getElementById('addPlayer').style.display = 'none';
		}
	}
	else if (event.target.id === 'startTournament') {

		if (controlTournament()) {
			drawTournament();
			startTournament();
		}
	}
});

function controlTournament() {
	var players = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'];
	var playerNames = [];
	let count = 0;

	for (var i = 0; i < players.length; i++) {
		var playerName = document.getElementById(players[i]).value;

		if (playerName.length > 0) {
			count++;
		}

		if ((playerName.length === 0) && (i < 4)) {
			alert("Please fill all the players");
			return false;
		} else if ((playerNames.includes(playerName)) && (playerName.length > 0)) {
			alert("Player names must be unique");
			return false;
		} else {
			playerNames.push(playerName);
		}
	}
	if (count == 5 || count == 7) {
		alert("There must be 4 or 8 players");
		return false;
	}
	if (playerNames.length < 4) {
		alert("There must be at least 4 players");
		return false;
	}
	tourPlayerCount = count;
	return true;
}


async function drawTournament() {
	var players = [];
	for (var i = 1; i <= tourPlayerCount; i++) {
		var playerInput = document.getElementById('player' + i);
		if (playerInput && playerInput.value) {
			players.push(playerInput.value);
		}
	}

	var tournament = document.getElementById('tournament');
	tournament.innerHTML = ''; // Şemayı temizle

	var round = document.createElement('ul');
	round.className = 'round round-1';

	for (var i = 0; i < players.length; i += 2) {
		var spacer = document.createElement('li');
		spacer.className = 'spacer';
		round.appendChild(spacer);

		var gameTop = document.createElement('li');
		gameTop.className = 'game game-top';
		gameTop.textContent = players[i];
		round.appendChild(gameTop);

		var gameSpacer = document.createElement('li');
		gameSpacer.className = 'game game-spacer';
		round.appendChild(gameSpacer);

		if (players[i + 1]) {
			var gameBottom = document.createElement('li');
			gameBottom.className = 'game game-bottom';
			gameBottom.textContent = players[i + 1];
			round.appendChild(gameBottom);
		}

		var spacer = document.createElement('li');
		spacer.className = 'spacer';
		round.appendChild(spacer);
	}

	tournament.appendChild(round);
}

async function startTournament() {
	var players = [];
	for (var i = 1; i <= tourPlayerCount; i++) {
		var playerInput = document.getElementById('player' + i);
		if (playerInput && playerInput.value) {
			players.push(playerInput.value);
		}
	}

	if (tourPlayerCount == 4) {
		for (var i = 1; i <= 2; i++) {
			console.log('Round ' + i);
			var winners = [];
			for (var j = 0; j < players.length; j += 2) {
				var player1 = players[j];
				var player2 = players[j + 1];
				inGame = true;
				await routeGame();
				await urlLocationHandler();
				var winner = await simulateGame(player1, player2);
				winners.push(winner);
			}
			players = winners;
		}
	}
	else if (tourPlayerCount == 8) {
		for (var i = 1; i <= 3; i++) {
			console.log('Round ' + i);
			var winners = [];
			for (var j = 0; j < players.length; j += 2) {
				var player1 = players[j];
				var player2 = players[j + 1];
				inGame = true;
				await routeGame();
				await urlLocationHandler();
				var winner = await simulateGame(player1, player2);
				winners.push(winner);
			}
			players = winners;
		}
	}
	resultTournament(winners);
	history.replaceState(null, null, '/');
	inGame = false;
}

function simulateGame(player1, player2) {
	return new Promise((resolve, reject) => {

		const matchup = document.getElementById('matchup');
		matchup.textContent = player1 + ' VS ' + player2;

		const pressEnterForStart = document.getElementById('pressEnterForStart');
		pressEnterForStart.textContent = "Press Enter to start the game";

		function handleEnter(e) {
			if (e.key === 'Enter') {
				document.removeEventListener('keydown', handleEnter);
				matchup.textContent = '';
				pressEnterForStart.textContent = '';
				gameLoop();
			}
		}

		document.addEventListener('keydown', handleEnter);

		function endGame() {
			document.removeEventListener('keydown', handleKeyDown);
			resolve(winner);
		}


		const canvas = document.getElementById('gameCanvas');
		const ctx = canvas.getContext('2d');

		let paddle1Y = 250;
		let paddle2Y = 250;
		let ballX = 450;
		let ballY = 300;
		let ballSpeedX = 2;
		let ballSpeedY = 2;
		let score1 = 0;
		let score2 = 0;
		let winner = null;

		function handleKeyDown(e) {
			if (e.key === 'w' && paddle1Y > 0) {
				paddle1Y -= 50;
			} else if (e.key === 's' && paddle1Y < canvas.height - 100) {
				paddle1Y += 50;
			} else if (e.key === 'ArrowUp' && paddle2Y > 0) {
				paddle2Y -= 50;
			} else if (e.key === 'ArrowDown' && paddle2Y < canvas.height - 100) {
				paddle2Y += 50;
			}
		}

		document.addEventListener('keydown', handleKeyDown);

		function updateBall() {
			ballX += ballSpeedX;
			ballY += ballSpeedY;

			if (ballX - 10 < 0) {
				if (ballY > paddle1Y && ballY < paddle1Y + 100) {
					ballSpeedX = -ballSpeedX;
				} else {
					score2++;
					checkScore();
					resetBall();
				}
			}

			if (ballX + 10 > canvas.width) {
				if (ballY > paddle2Y && ballY < paddle2Y + 100) {
					ballSpeedX = -ballSpeedX;
				} else {
					score1++;
					checkScore();
					resetBall();
				}
			}

			if (ballY < 0 || ballY > canvas.height) {
				ballSpeedY = -ballSpeedY;
			}
		}

		function checkScore() {
			if (score1 >= 1 && score1 > score2) {
				winner = player1;
				endGame();
			} else if (score2 >= 1 && score2 > score1) {
				winner = player2;
				endGame();
			}
		}

		function endGame() {
			document.removeEventListener('keydown', handleKeyDown);
			console.log(winner + " won the game!");
			resolve(winner);
		}

		function resetBall() {
			ballX = canvas.width / 2;
			ballY = canvas.height / 2;
		}

		function drawGame() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.fillRect(0, paddle1Y, 10, 100);
			ctx.fillRect(canvas.width - 10, paddle2Y, 10, 100);

			ctx.beginPath();
			ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
			ctx.fill();

			ctx.font = '24px Arial';
			ctx.fillText(player1 + ': ' + score1, 10, 30);
			ctx.fillText(player2 + ': ' + score2, canvas.width - 100, 30);
		}

		function gameLoop() {
			if (window.location.pathname != '/play') {
				return;
			}
			if (!winner) {
				updateBall();
				drawGame();
				requestAnimationFrame(gameLoop);
			}
		}

		//gameLoop();
	});
}

function resultTournament(winner) {
	const jsConfetti = new JSConfetti();

	const content = document.getElementById('content');
	content.innerHTML = '';
	content.classList.add('bodyForConfetti');

	const canvas = document.createElement('canvas');
	canvas.id = 'confetti';

	const h1 = document.createElement('h1');
	h1.classList.add('justify-content-center');
	h1.classList.add('d-flex');
	h1.classList.add('mt-4');
	h1.classList.add('pt-4');
	h1.textContent = winner + ' won the tournament!';
	content.appendChild(h1);
	content.appendChild(canvas);

	jsConfetti.addConfetti({
		emojis: ['⚡️', '💥', '✨', '💫', '🌸'],
	}).then(() => jsConfetti.addConfetti())
}


//
//42 Auth
//

document.body.addEventListener('click', function (event) {
	if (event.target.id === '42login') {
		const authUrl = `httpss://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-ec9580a9d2a604f71608dbe83604f9b8758cf1f4f80d7b200930a00a269ca58f&redirect_uri=https%3A%2F%2Flocalhost%3A5500%2Flogin&response_type=code`;
		window.location.href = authUrl;
	}
})

document.addEventListener('DOMContentLoaded', async function () {
	const code = new URLSearchParams(window.location.search).get('code');
	if (code) {
		try {
			const response = await fetch("https://localhost:8000/deneme/?code=" + encodeURIComponent(code));
			const data = await response.json();
			if (data && data.message === 'Success') {
				const username = data.username;
				var user = {
					"username": username,
					"password": "42_jwt"
				};
				saveData(data);
				await getJwt(user);
				window.location.href = '/';
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}
}
);

//
//Match History
//

document.body.addEventListener('click', async function (event) {
	if (event.target.id === 'allMatchHistory') {
		document.getElementById('matchHistoryTbody').innerHTML = '';
		fetchMatchHistory("all");
	}
	else if (event.target.id === 'winMatchHistory') {
		document.getElementById('matchHistoryTbody').innerHTML = '';
		fetchMatchHistory("win");
	}
	else if (event.target.id === 'loseMatchHistory') {
		document.getElementById('matchHistoryTbody').innerHTML = '';
		fetchMatchHistory("lose");
	}
});

function fetchMatchHistory(filter) {
	var data = {
		"username": localStorage.getItem('user')
	};
	fetchWithRefresh('https://127.0.0.1:8000/matchmaking_history/',
		{
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			if (data && data.match_history) {
				if (filter === "all") {
					listAllMatchHistory(data);
				}
				else if (filter === "win") {
					listWinMatchHistory(data);
				}
				else if (filter === "lose") {
					listLoseMatchHistory(data);
				}
			}
			else {
				document.getElementById('matchHistoryTbody').innerHTML = '';
				const tr = document.createElement('tr');
				tr.innerHTML = '<td>No match history</td>';
				document.getElementById('matchHistoryTbody').appendChild(tr);
			}
		})
		.catch(error => console.error('Error:', error));
}

function listAllMatchHistory(data) {
	let opponent;
	let myScore;
	let opponentScore;

	const matchHistory = document.getElementById('matchHistoryTbody');
	data.match_history.forEach(match => {
		if (match.user_host === localStorage.getItem('user')) {
			opponent = match.user_guest;
			myScore = match.score_host;
			opponentScore = match.score_guest;
		}
		else {
			opponent = match.user_host;
			myScore = match.score_guest;
			opponentScore = match.score_host;
		}
		const tr = document.createElement('tr');
		tr.innerHTML = '<td>' + match.created_at + '</td><td>' + opponent + '</td><td>' + myScore + '/' + opponentScore + '</td>';
		matchHistory.appendChild(tr);
	});
}


function listWinMatchHistory(data) {
	let opponent;
	let myScore;
	let opponentScore;

	const matchHistory = document.getElementById('matchHistoryTbody');
	data.match_history.forEach(match => {
		if (match.user_host === localStorage.getItem('user')) {
			opponent = match.user_guest;
			myScore = match.score_host;
			opponentScore = match.score_guest;
		}
		else {
			opponent = match.user_host;
			myScore = match.score_guest;
			opponentScore = match.score_host;
		}
		if (myScore > opponentScore) {
			const tr = document.createElement('tr');
			tr.innerHTML = '<td>' + match.created_at + '</td><td>' + opponent + '</td><td>' + myScore + '/' + opponentScore + '</td>';
			matchHistory.appendChild(tr);
		}
	});
}

function listLoseMatchHistory(data) {
	let opponent;
	let myScore;
	let opponentScore;

	const matchHistory = document.getElementById('matchHistoryTbody');
	data.match_history.forEach(match => {
		if (match.user_host === localStorage.getItem('user')) {
			opponent = match.user_guest;
			myScore = match.score_host;
			opponentScore = match.score_guest;
		}
		else {
			opponent = match.user_host;
			myScore = match.score_guest;
			opponentScore = match.score_host;
		}
		if (myScore < opponentScore) {
			const tr = document.createElement('tr');
			tr.innerHTML = '<td>' + match.created_at + '</td><td>' + opponent + '</td><td>' + myScore + '/' + opponentScore + '</td>';
			matchHistory.appendChild(tr);
		}
	});
}

//
//AI implementation
//

document.body.addEventListener('click', function (event) {
	if (event.target.id === 'PlayVs') {
		AiGameInit();
	}
});


async function AiGameInit() {
	inGame = true;
	await routeGame();
	await urlLocationHandler();
	await simulateGameAI();
}


async function simulateGameAI() {
	return new Promise((resolve, reject) => {
		const canvas = document.getElementById("gameCanvas");
		const context = canvas.getContext("2d");
		const paddleWidth = 10;
		const paddleHeight = 100;
		const ballSize = 10;

		let paddle1Y = canvas.height / 2 - paddleHeight / 2;
		let paddle2Y = canvas.height / 2 - paddleHeight / 2;
		let paddleSpeed = 3;

		let ballX = canvas.width / 2;
		let ballY = canvas.height / 2;
		let aiBallX = canvas.width / 2;
		let aiBallY = canvas.height / 2;
		let ballSpeedX = 3;
		let ballSpeedY = 3;

		let scorePlayer = 0;
		let scoreAI = 0;

		const player1Name = localStorage.getItem('user');
		const player2Name = "AI";

		function draw() {
			context.clearRect(0, 0, canvas.width, canvas.height);

			context.fillStyle = "#ffffff";
			context.fillRect(10, paddle1Y, paddleWidth, paddleHeight);
			context.fillRect(canvas.width - paddleWidth - 10, paddle2Y, paddleWidth, paddleHeight);

			context.beginPath();
			context.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
			context.fill();
			context.closePath();

			context.font = "16px Arial";
			context.fillText(`${player1Name}: ${scorePlayer}`, 40, 20);
			context.fillText(`${player2Name}: ${scoreAI}`, canvas.width - 100, 20);

			ballX += ballSpeedX;
			ballY += ballSpeedY;

			if (ballY + ballSize > canvas.height || ballY - ballSize < 0) {
				ballSpeedY = -ballSpeedY;
			}

			if (
				(ballX - ballSize < (paddleWidth + 10) && ballY > paddle1Y && ballY < paddle1Y + paddleHeight) ||
				(ballX + ballSize > canvas.width - (paddleWidth + 10) &&
					ballY > paddle2Y &&
					ballY < paddle2Y + paddleHeight)
			) {
				ballSpeedX = -ballSpeedX;
			}

			if (ballX - ballSize + 5 < 0) {
				scorePlayer++;
				resetBall();
			} else if (ballX + ballSize - 5 > canvas.width) {
				scoreAI++;
				resetBall();
			}

			if (scorePlayer >= 10) {
				resolve(`${player1Name} won!`);
				return;
			} else if (scoreAI >= 10) {
				resolve(`${player2Name} won!`);
				return;
			}
			// Move the paddles
			movePaddle1();
			movePaddle2();
		}

		function movePaddle1() {
			// Player controls
			if (keysPressed.ArrowUp && paddle1Y > 0) {
				paddle1Y -= paddleSpeed;
			}
			if (keysPressed.ArrowDown && paddle1Y + paddleHeight < canvas.height) {
				paddle1Y += paddleSpeed;
			}
		}

		function movePaddle2() {
			// AI controls
			let paddleCenter = paddle2Y + paddleHeight / 2;

			// Calculate the predicted ball position after reaching the AI's side
			let predictedBallY = aiBallY + ballSpeedY * (canvas.width - aiBallX) / ballSpeedX;

			// Adjust the AI's paddle movement based on the predicted ball position
			if (predictedBallY < paddleCenter - paddleHeight * 0.2) {
				paddle2Y -= paddleSpeed;
			} else if (predictedBallY > paddleCenter + paddleHeight * 0.2) {
				paddle2Y += paddleSpeed;
			}

			// Ensure the paddle stays within the canvas boundaries
			paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
		}

		function resetBall() {
			ballX = canvas.width / 2;
			ballY = canvas.height / 2;
			ballSpeedX = -ballSpeedX;
		}

		const keysPressed = {};
		window.addEventListener("keydown", function (event) {
			keysPressed[event.code] = true;
		});

		window.addEventListener("keyup", function (event) {
			keysPressed[event.code] = false;
		});

		// Game loop
		function gameLoop() {
			draw();
			requestAnimationFrame(gameLoop);
		}

		gameLoop();
	}
	);
}

//
//2FA
//


document.body.addEventListener('click', function (event) {
	if (event.target.id === '2FaEnableBtn') {
		enable2FA();
	}
	else if (event.target.id === 'enable2FA') {
		verify2FA();
	}
	else if (event.target.id === '2FaDisableBtn') {
		disable2FA();
	}
});

function enable2FA() {
	var data = {
		"username": localStorage.getItem('user')
	};
	fetchWithRefresh('https://127.0.0.1:8000/get_qr/',
		{
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);

			document.getElementById('qrCode').src = data.qr;
			document.getElementById('secret').textContent = data.secret;
		}
		)
		.catch(error => console.error('Error:', error));
}

function verify2FA() {
	var data = {
		"username": localStorage.getItem('user'),
		"code": document.getElementById('2FaCode').value
	};
	fetchWithRefresh('https://127.0.0.1:8000/validate_qr/',
		{
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);

			document.getElementById('2FaEnableBtn').style.display = "none";
		})
		.catch(error => console.error('Error:', error));
}

function disable2FA() {
	var data = {
		"username": localStorage.getItem('user')
	};
	fetchWithRefresh('https://127.0.0.1:8000/get_qr/',
		{
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);

			document.getElementById("2FaDisableBtn").style.display = "none";
			document.getElementById("2FaEnableBtn").style.display = "block";
		})
		.catch(error => console.error('Error:', error));
}
