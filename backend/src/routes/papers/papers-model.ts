import { Paper, Papers, PaperSearchDB } from './papers';
import { logToFile } from '../../logging/logging';
import prisma from '../../../lib/prisma';
import { Tweet } from '../tweets/tweets';
import { ServerError } from '../types';

let papers: Papers;
let searchedPapers: Papers;

export async function getPapers(): Promise<Papers> {
	try {
		// get all Acm papers and all Researchr papers
		// https://github.com/prisma/prisma/discussions/4136 would be useful, but not possible here :(
		papers = await prisma.paper.findMany({}).then((papersArr) => <Papers>papersArr);
	} catch (e) {
		console.error(e);
		console.log(logToFile(e));
		papers = [];
	}
	return papers;
}

export async function getSearchedPapers(params: PaperSearchDB): Promise<Papers | []> {
	try {
		searchedPapers = await prisma.paper
			.findMany({
				where: {
					OR: [
						{
							title: {
								contains: params.title,
								mode: 'insensitive',
							},
							source: {
								equals: params.source,
							},
						},
					],
				},
			})
			.then((papersArr) => <Papers>papersArr);
	} catch (e) {
		console.error(e);
		console.log(logToFile(e));
		searchedPapers = [];
	}
	return searchedPapers;
}

export const insertTestPaper = async (acmPaper: Paper): Promise<Paper> =>
	// @ts-ignore
	prisma.paper.create({
		data: acmPaper,
	});

// export const updateTweetContent = async (paperId: number, title: string): Promise<AcmPaper | ServerError> => {
// 	try {
// 		return await prisma.acmPaper.update({
// 			where: {
// 				id: paperId,
// 			},
// 			data: {
// 				title,
// 			},
// 		});
// 	} catch (e) {
// 		if (e instanceof Prisma.PrismaClientKnownRequestError) {
// 			return new ServerError(HttpStatus.NOT_FOUND, `Tweet with ID ${tweetId} not found.`);
// 		}
// 		console.log(logToFile(e));
// 		return new ServerError(HttpStatus.INTERNAL_SERVER_ERROR, 'Unable to update tweet due to server problem.');
// 	}
// };
