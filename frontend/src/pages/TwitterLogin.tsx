import axios from 'axios';
import { useEffect, useState } from 'react';

interface TwitterAccount {
	userId: string;
	screenName: string;
	profileImageUrl: string;
}

const TwitterLogin = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	// temp
	const [userId, setUserId] = useState('');
	const [screenName, setScreenName] = useState('');
	const [profileImageUrl, setProfileImageUrl] = useState('');

	useEffect(() => {
		console.log('hello there');
		const windowFeatures = 'left=100,top=100,width=320,height=320';
		const handle = window.open('https://www.mozilla.org/', '', windowFeatures);

		setTimeout(() => {
			if (handle) handle.close();
		}, 5000);
	}, []);

	// OAuth Step 1: get request token from backend
	const getOAuthRequestToken = async () => {
		try {
			const response = await axios.get('/api/oauths/twitter/request_token');
			const { oauthToken: oAuthToken } = response.data;

			if (oAuthToken.length > 0) {
				navigateToTwitterLogin(oAuthToken);
				return;
			}
		} catch (error) {
			console.error(error);
		}

		setErrorMessage('Unable to authenticate with server, please try again.');
	};

	// Oauth Step 2: direct user to Twitter's login page
	const navigateToTwitterLogin = (oAuthToken: string) => {
		window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oAuthToken}`;
	};

	// Oauth Step 3: parse access token from url and post to backend
	// if successful the user details will be returned
	// const processAccessToken = async () => {
	// 	const { oauth_token, oauth_verifier } = queryString.parse(window.location.search);
	// 	if (oauth_token && oauth_verifier) {
	// 		try {
	// 			const config = { withCredentials: true };
	// 			const payload = { oauth_token, oauth_verifier };
	// 			const response = await axios.post('/api/oauths/twitter/access_token', payload, config);
	//
	// 			if (response.status === HttpStatus.CREATED) {
	// 				const twitterAccount = response.data;
	// 				logUserIn(twitterAccount);
	// 				return;
	// 			}
	//
	// 			setErrorMessage('Unable to log into Twitter account.');
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	}
	//
	// 	setErrorMessage('Failed to authenticate with Twitter, please try again.');
	// };

	// User has been logged in, store account details from response
	// const logUserIn = (twitterAccount: TwitterAccount) => {
	// 	if (twitterAccount.userId.length > 0) {
	// 		setUserId(twitterAccount.userId);
	// 		setScreenName(twitterAccount.screenName);
	// 		setProfileImageUrl(twitterAccount.profileImageUrl);
	// 		setIsLoggedIn(true);
	// 	}
	// 	setErrorMessage('User details missing from response.');
	// };

	const login = async () => {};

	const logout = async () => {
		try {
			await axios({
				url: '/api/sessions/logout',
				method: 'POST',
			});
			setIsLoggedIn(false);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div>
			{errorMessage.length > 0 && <p className="text-red-600">{errorMessage}</p>}
			{!isLoggedIn && (
				<img
					className="signin-btn"
					onClick={login}
					alt="Twitter login button"
					src="https://assets.klaudsol.com/twitter.png"
				/>
			)}
			{isLoggedIn && (
				<div>
					<div>
						<img alt="User profile" src={profileImageUrl} />
					</div>
					<button className="signout-btn" onClick={logout}>
						Sign Out
					</button>
				</div>
			)}
		</div>
	);
};

export default TwitterLogin;
