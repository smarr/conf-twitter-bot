/**
 * Model for creating/reading/updating/deleting stored Twitter accounts
 * TODO: Convert from JSON store to DB Object
 */
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { TwitterAccount, TwitterAccounts } from '../types/twitter-types';

let twitterAccounts: TwitterAccounts;
const pathToFile = path.relative(process.cwd(), 'data/twitter-accounts.json');

const getAccounts = (): TwitterAccounts => {
	try {
		const fileContent = readFileSync(pathToFile).toString();
		twitterAccounts = <TwitterAccounts>JSON.parse(fileContent);
	} catch (e) {
		console.error(e);
		twitterAccounts = [];
	}
	return twitterAccounts;
};

const getAccount = (userId: string): TwitterAccount => {
	twitterAccounts = getAccounts();
	return twitterAccounts.find((account) => account.userId === userId);
};

const accountExists = (userId: string): boolean => {
	twitterAccounts = getAccounts();
	return twitterAccounts.some((account) => account.userId === userId);
};

const updateAccount = (): boolean => {
	console.error('UPDATE NOT IMPLEMENTED');
	return false;
};

const insertAccount = (twitterAccount: TwitterAccount): boolean => {
	twitterAccounts.push(twitterAccount);
	try {
		writeFileSync(pathToFile, JSON.stringify(twitterAccounts));
		return true;
	} catch (e) {
		console.log(e);
		return false;
	}
};

// eslint-disable-next-line
const insertOrUpdateAccount = (twitterAccount: TwitterAccount): boolean => {
	return accountExists(twitterAccount.userId) ? updateAccount() : insertAccount(twitterAccount);
};

export { updateAccount, insertAccount, insertOrUpdateAccount, getAccount, getAccounts };
