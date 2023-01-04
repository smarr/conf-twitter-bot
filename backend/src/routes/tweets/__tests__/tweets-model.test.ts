import HttpStatus from 'http-status';
import {
	deleteTweet,
	getTweet,
	getTweets,
	insertTweet,
	updateTweetContent,
	updateTweetScheduledTime,
	updateTweetSent,
} from '../tweets-model';
import { Tweet, Tweets } from '../tweets';
import { ServerError } from '../../types';
import { TestHarness } from '../../../tests/TestHarness';

const harness = new TestHarness();

let tweet: Tweet;

// before any tests are run
beforeAll(async () => {
	await harness.createStandard();
});

// after all tests complete
afterAll(async () => {
	await TestHarness.deleteAll();
});

it('get tweet should return status of not found', async () => {
	const result = <ServerError>await getTweet('1');

	expect(result).toBeInstanceOf(ServerError);
	expect(result.getStatusCode()).toEqual(HttpStatus.NOT_FOUND);
});

it('insert tweet should create one new tweet', async () => {
	const httpTweet = harness.createHttpTweet();

	tweet = <Tweet>await insertTweet(httpTweet);

	expect(tweet.id).toBeGreaterThan(0);
	expect(tweet).toEqual(
		expect.objectContaining({
			accountId: +httpTweet.accountId,
			twitterUserId: BigInt(httpTweet.twitterUserId),
			updatedAt: null,
			// @ts-ignore
			scheduledTimeUTC: new Date(httpTweet.dateTime),
			content: httpTweet.content,
			sent: false,
		}),
	);
});

it('get tweet should return inserted tweet', async () => {
	const result = <Tweet>await getTweet(tweet.id.toString());

	expect(result.id).toEqual(tweet.id);
	expect(result.content).toEqual(tweet.content);
});

it('get tweets should return an array with one tweet', async () => {
	const result = <Tweets>await getTweets(harness.getTwitterUser().id);

	expect(result.length).toEqual(1);
	result.map((result: Tweet) => expect(result.id).toEqual(tweet.id));
});

it('get tweets should return error', async () => {
	const result = <ServerError>await getTweets(BigInt(738));

	expect(result).toBeInstanceOf(ServerError);
	expect(result.getStatusCode()).toEqual(HttpStatus.NOT_FOUND);
});

it('update tweet should update content', async () => {
	const content = 'Meow meow meow';
	const result = await updateTweetContent(tweet.id.toString(), content);

	expect(result).toEqual(
		expect.objectContaining({
			...tweet,
			content,
		}),
	);

	tweet.content = content;
});

describe('update non-existent tweet content should return not found', () => {
	it('content', async () => {
		const result = <ServerError>await updateTweetContent('101', 'I should error');

		expect(result).toBeInstanceOf(ServerError);
		expect(result.getStatusCode()).toEqual(HttpStatus.NOT_FOUND);
	});

	it('dateTime', async () => {
		const result = <ServerError>await updateTweetScheduledTime('101', new Date());

		expect(result).toBeInstanceOf(ServerError);
		expect(result.getStatusCode()).toEqual(HttpStatus.NOT_FOUND);
	});

	it('sent', async () => {
		const result = <ServerError>await updateTweetSent('101', true);

		expect(result).toBeInstanceOf(ServerError);
		expect(result.getStatusCode()).toEqual(HttpStatus.NOT_FOUND);
	});
});

it('get tweet should return tweet with updated content', async () => {
	const result = <Tweet>await getTweet(tweet.id.toString());

	expect(result.id).toEqual(tweet.id);
	expect(result.content).toEqual(tweet.content);
});

it('update tweet should update scheduled datetime', async () => {
	const scheduledTimeUTC = new Date('2022-10-29T21:48:54.738Z');
	const result = await updateTweetScheduledTime(tweet.id.toString(), scheduledTimeUTC);

	expect(result).toEqual(
		expect.objectContaining({
			...tweet,
			scheduledTimeUTC,
		}),
	);

	tweet.scheduledTimeUTC = scheduledTimeUTC;
});

it('get tweet should return tweet with updated scheduled datetime', async () => {
	const result = <Tweet>await getTweet(tweet.id.toString());

	expect(result.id).toEqual(tweet.id);
	expect(result.scheduledTimeUTC).toEqual(tweet.scheduledTimeUTC);
});

it('update tweet should change sent to true', async () => {
	const sent = true;
	const result = await updateTweetSent(tweet.id.toString(), sent);

	expect(result).toEqual(
		expect.objectContaining({
			...tweet,
			sent,
		}),
	);

	tweet.sent = sent;
});

it('get tweet should return tweet with sent true', async () => {
	const result = <Tweet>await getTweet(tweet.id.toString());

	expect(result.id).toEqual(tweet.id);
	expect(result.sent).toEqual(tweet.sent);
});

it('delete tweet should delete tweet with id', async () => {
	const result = <Tweet>await deleteTweet(tweet.id.toString());

	expect(result.id).toEqual(tweet.id);
});

it('get deleted tweet should return status of not found', async () => {
	const result = <ServerError>await getTweet(tweet.id.toString());

	expect(result).toBeInstanceOf(ServerError);
	expect(result.getStatusCode()).toEqual(HttpStatus.NOT_FOUND);
});

it('delete tweet should return status of not found', async () => {
	const result = <ServerError>await deleteTweet('101');

	expect(result).toBeInstanceOf(ServerError);
	expect(result.getStatusCode()).toEqual(HttpStatus.NOT_FOUND);
});
