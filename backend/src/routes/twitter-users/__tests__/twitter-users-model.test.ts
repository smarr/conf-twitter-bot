import HttpStatus from 'http-status';
import { deleteTwitterUser, getTwitterUser, insertTwitterUser, twitterUserExists } from '../twitter-users-model';
import { TwitterUser } from '../../accounts/accounts';
import prisma from '../../../../lib/prisma';
import { TestHarness } from '../../../tests/TestHarness';
import { ServerError } from '../../types';

const harness = new TestHarness();

beforeAll(async () => {
	await harness.createUser();
});

// after all tests complete
afterAll(async () => {
	await prisma.tweet.deleteMany({});
	await prisma.account.deleteMany({});
	await prisma.twitterUser.deleteMany({});
	await prisma.user.deleteMany({});
	await prisma.$disconnect();
});

const twitterUser = harness.generateTwitterUser();

it('insert twitter user should create and return a twitter user', async () => {
	const result = <TwitterUser>await insertTwitterUser(twitterUser);

	expect(result).toEqual(twitterUser);
});

it('get twitter user should return twitter user', async () => {
	const result = <TwitterUser>await getTwitterUser(twitterUser.id);

	expect(result).toEqual(twitterUser);
});

it('check twitter user exists should return true', async () => {
	const result = await twitterUserExists(twitterUser.id);

	expect(result).toBe(true);
});

it('check twitter user exists should return false', async () => {
	const result = await twitterUserExists(BigInt(999));

	expect(result).toBe(false);
});

it('get twitter user should return not found error', async () => {
	const result = <ServerError>await getTwitterUser(BigInt(999));

	expect(result).toBeInstanceOf(ServerError);
	expect(result.getStatusCode()).toEqual(HttpStatus.NOT_FOUND);
});

describe('delete twitter user', () => {
	it('delete twitter user should return deleted twitter user', async () => {
		const result = await deleteTwitterUser(twitterUser.id);

		expect(result).toEqual(twitterUser);
	});

	it('check deleted twitter user exists should return false', async () => {
		const result = await twitterUserExists(twitterUser.id);

		expect(result).toBe(false);
	});

	it('get deleted twitter user should return not found error', async () => {
		const result = <ServerError>await getTwitterUser(twitterUser.id);

		expect(result).toBeInstanceOf(ServerError);
		expect(result.getStatusCode()).toEqual(HttpStatus.NOT_FOUND);
	});
});
