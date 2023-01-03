import { TwitterApi, UserV1 } from 'twitter-api-v2';
import HttpStatus from 'http-status';
import { TwitterOAuthRequestToken, TwitterOAuthAccount } from './oauths';
import { ServerError } from '../types';
import prisma from '../../../lib/prisma';
import { TWITTER_API_KEY, TWITTER_API_SECRET } from '../../keys';
import { logToFile } from '../../logging/logging';
import { TwitterUser } from '../accounts/accounts';

export const getTwitterOAuthRequestToken = async (): Promise<TwitterOAuthRequestToken | ServerError> => {
	const client = new TwitterApi({
		appKey: <string>TWITTER_API_KEY,
		appSecret: <string>TWITTER_API_SECRET,
	});

	// TODO: replace callbackUrl with an env variable
	const callbackUrl = 'http://localhost:3000/twitter-oauth-callback';
	const authLink = await client.generateAuthLink(callbackUrl);

	if (authLink && authLink.oauth_token.length > 0) {
		return {
			oauthToken: authLink.oauth_token,
			oauthTokenSecret: authLink.oauth_token_secret,
		};
	}

	return new ServerError(HttpStatus.INTERNAL_SERVER_ERROR, 'Unable to generate request token.');
};

// need a better place for this method
export const getAdditionalUserFields = async (userId: string): Promise<UserV1> => {
	const client = new TwitterApi({
		appKey: <string>TWITTER_API_KEY,
		appSecret: <string>TWITTER_API_SECRET,
	});
	return client.v1.user({ user_id: userId });
};

export const getTwitterAccountByRequestToken = async (
	tempAuthDetails: TwitterOAuthRequestToken,
	oauthToken: string,
	oauthVerifier: string,
): Promise<TwitterOAuthAccount | ServerError> => {
	if (oauthToken !== tempAuthDetails.oauthToken) {
		return new ServerError(HttpStatus.INTERNAL_SERVER_ERROR, 'oAuth Tokens do not match.');
	}

	// set all credentials required to make oauth request
	const client = new TwitterApi({
		appKey: <string>TWITTER_API_KEY,
		appSecret: <string>TWITTER_API_SECRET,
		accessToken: tempAuthDetails?.oauthToken,
		accessSecret: tempAuthDetails?.oauthTokenSecret,
	});

	// using credentials, log into user's Twitter account to get access token and user details
	const loginResult = await client.login(oauthVerifier);

	if (loginResult && loginResult.accessSecret.length > 0) {
		// gather account credentials and information for store
		const { userId, screenName, accessToken, accessSecret } = loginResult;

		// get the user's profile image, may be better to perform this task later
		const { name, profile_image_url_https: profileImageUrl } = await getAdditionalUserFields(userId);

		const twitterUser: TwitterUser = {
			id: BigInt(userId),
			name,
			screenName,
			profileImageUrl,
		};

		// return TwitterAccount
		return {
			twitterUser,
			oauth: {
				accessToken,
				accessSecret,
			},
		};
	}

	return new ServerError(HttpStatus.INTERNAL_SERVER_ERROR, 'Unable to create access token.');
};

export const insertTwitterOAuth = async (
	accountId: number,
	accessToken: string,
	accessSecret: string,
): Promise<number | ServerError> => {
	try {
		const result = await prisma.twitterOAuth.create({
			data: {
				accountId,
				accessToken,
				accessSecret,
			},
		});
		return result.accountId;
	} catch (e) {
		console.log(e);
		console.log(logToFile(e));
		return new ServerError(HttpStatus.INTERNAL_SERVER_ERROR, 'Unable to add Twitter user due to server problem.');
	}
};
