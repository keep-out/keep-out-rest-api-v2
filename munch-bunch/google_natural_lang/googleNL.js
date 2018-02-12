// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Instantiates a client
const client = new language.LanguageServiceClient();

// The text to analyze
const text = 'Hello, world!';

const document = {
  content: text,
  type: 'PLAIN_TEXT',
};

// Detects the sentiment of the text
client
  .analyzeSentiment({document: document})
  .then(results => {
    const sentiment = results[0].documentSentiment;

    console.log(`Text: ${text}`);
    console.log(`Sentiment score: ${sentiment.score}`);
    console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });


  function analyzeSentimentInFile(bucketName, fileName) {
  // [START language_sentiment_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Detects the sentiment of the document
  client
    .analyzeSentiment({document: document})
    .then(results => {
      const sentiment = results[0].documentSentiment;
      console.log(`Document sentiment:`);
      console.log(`  Score: ${sentiment.score}`);
      console.log(`  Magnitude: ${sentiment.magnitude}`);

      const sentences = results[0].sentences;
      sentences.forEach(sentence => {
        console.log(`Sentence: ${sentence.text.content}`);
        console.log(`  Score: ${sentence.sentiment.score}`);
        console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_sentiment_file]
}

function analyzeEntitiesOfText(text) {
  // [START language_entities_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects entities in the document
  client
    .analyzeEntities({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log('Entities:');
      entities.forEach(entity => {
        console.log(entity.name);
        console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        if (entity.metadata && entity.metadata.wikipedia_url) {
          console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
        }
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_entities_string]
}

function analyzeEntitiesInFile(bucketName, fileName) {
  // [START language_entities_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Detects entities in the document
  client
    .analyzeEntities({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log('Entities:');
      entities.forEach(entity => {
        console.log(entity.name);
        console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
        if (entity.metadata && entity.metadata.wikipedia_url) {
          console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
        }
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_entities_file]
}

function analyzeSyntaxOfText(text) {
  // [START language_syntax_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects syntax in the document
  client
    .analyzeSyntax({document: document})
    .then(results => {
      const syntax = results[0];

      console.log('Tokens:');
      syntax.tokens.forEach(part => {
        console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
        console.log(`Morphology:`, part.partOfSpeech);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_syntax_string]
}

function analyzeSyntaxInFile(bucketName, fileName) {
  // [START language_syntax_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Detects syntax in the document
  client
    .analyzeSyntax({document: document})
    .then(results => {
      const syntax = results[0];

      console.log('Parts of speech:');
      syntax.tokens.forEach(part => {
        console.log(`${part.partOfSpeech.tag}: ${part.text.content}`);
        console.log(`Morphology:`, part.partOfSpeech);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_syntax_file]
}

function analyzeEntitySentimentOfText(text) {
  // [START language_entity_sentiment_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects sentiment of entities in the document
  client
    .analyzeEntitySentiment({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log(`Entities and sentiments:`);
      entities.forEach(entity => {
        console.log(`  Name: ${entity.name}`);
        console.log(`  Type: ${entity.type}`);
        console.log(`  Score: ${entity.sentiment.score}`);
        console.log(`  Magnitude: ${entity.sentiment.magnitude}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_entity_sentiment_string]
}

function analyzeEntitySentimentInFile(bucketName, fileName) {
  // [START language_entity_sentiment_file]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Detects sentiment of entities in the document
  client
    .analyzeEntitySentiment({document: document})
    .then(results => {
      const entities = results[0].entities;

      console.log(`Entities and sentiments:`);
      entities.forEach(entity => {
        console.log(`  Name: ${entity.name}`);
        console.log(`  Type: ${entity.type}`);
        console.log(`  Score: ${entity.sentiment.score}`);
        console.log(`  Magnitude: ${entity.sentiment.magnitude}`);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_entity_sentiment_file]
}

function classifyTextOfText(text) {
  // [START language_classify_string]
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');

  // Creates a client
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following line to run this code.
   */
  // const text = 'Your text to analyze, e.g. Hello, world!';

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Classifies text in the document
  client
    .classifyText({document: document})
    .then(results => {
      const classification = results[0];

      console.log('Categories:');
      classification.categories.forEach(category => {
        console.log(
          `Name: ${category.name}, Confidence: ${category.confidence}`
        );
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_classify_string]
}

function classifyTextInFile(bucketName, fileName) {
  // [START language_classify_file]
  // Imports the Google Cloud client library.
  const language = require('@google-cloud/language');

  // Creates a client.
  const client = new language.LanguageServiceClient();

  /**
   * TODO(developer): Uncomment the following lines to run this code
   */
  // const bucketName = 'Your bucket name, e.g. my-bucket';
  // const fileName = 'Your file name, e.g. my-file.txt';

  // Prepares a document, representing a text file in Cloud Storage
  const document = {
    gcsContentUri: `gs://${bucketName}/${fileName}`,
    type: 'PLAIN_TEXT',
  };

  // Classifies text in the document
  client
    .classifyText({document: document})
    .then(results => {
      const classification = results[0];

      console.log('Categories:');
      classification.categories.forEach(category => {
        console.log(
          `Name: ${category.name}, Confidence: ${category.confidence}`
        );
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END language_classify_file]
}
