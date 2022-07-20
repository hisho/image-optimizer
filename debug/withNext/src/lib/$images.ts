/* eslint-disable */
// prettier-ignore
export const imagesPath = [
	{
		"width": 400,
		"height": 400,
		"original": "/images/sample.png",
		"paths": [
			{
				"size": 640,
				"original": "/images/sample-w640.png?20220328114923",
				"webp": "/images/sample-w640.png.webp?20220328114923"
			},
			{
				"size": 828,
				"original": "/images/sample-w828.png?20220328114923",
				"webp": "/images/sample-w828.png.webp?20220328114923"
			},
			{
				"size": 1080,
				"original": "/images/sample-w1080.png?20220328114923",
				"webp": "/images/sample-w1080.png.webp?20220328114923"
			},
			{
				"size": 1200,
				"original": "/images/sample-w1200.png?20220328114923",
				"webp": "/images/sample-w1200.png.webp?20220328114923"
			},
			{
				"size": 1920,
				"original": "/images/sample-w1920.png?20220328114923",
				"webp": "/images/sample-w1920.png.webp?20220328114923"
			}
		]
	}
] as const;
export type ImagesPath = typeof imagesPath
