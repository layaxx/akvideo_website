export type Collection = {
	getAll: () => Array<{
		url: string
		data: {
			title: string
			sitemap: { ignore: boolean; category?: string }
			nopage?: boolean
		}
		template: { read: () => Promise<{ content: string }> }
	}>
	getFilteredByTag: (tag: string) => Array<{ data: { year: number } }>
}
