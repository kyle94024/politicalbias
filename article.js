const fs = require('fs');
const { parse } = require('csv-parse');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: 'sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', //api key here
});

async function processArticles() {
    const parser = fs.createReadStream('NEWSDATA.csv').pipe(parse({
        columns: true,
        skip_empty_lines: true,
    }));

    const records = [];

    for await (const record of parser) {
        records.push(record);
    }

    const newsSources = Object.keys(records[0]);
    console.log(`Found news sources: ${newsSources.join(', ')}`);

    // loop through each news source
    for (const source of newsSources) {
        console.log(`Processing articles for: ${source}`);

        for (const [index, record] of records.entries()) {
            const article = record[source];
            if (!article) continue; 

            try {
                
                const response = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "Rate the political bias of the following article. 0N is neutral, free of political bias. Then there are 1R,2R,3R,4R, and 5R, which represents that the article is biased towards the right with 1...5 representing severity from least to most. Similarly, there is 1L, 2L, 3L, 4L, 5L for left bias. Return a number (e.g., 0,1,2,3,4,5) followed by a letter (N,R,L)." },
                        { role: "user", content: article }
                    ],
                });
                console.log(`${source} article ${index + 1}: ${response.choices[0].message.content.trim()}`);
                

                // Log the article
                //console.log(`${source} article ${index + 1}: ${article.substring(0, 50)}...`); 
            } catch (error) {
                console.error(`Error processing article ${index + 1} from ${source}: ${error}`);
            }
        }
    }
}

processArticles();
