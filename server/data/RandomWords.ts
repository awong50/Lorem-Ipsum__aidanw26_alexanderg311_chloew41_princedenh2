import fs from 'fs';
import path from 'path'
import _ from 'lodash';

const RandomWords = () => {
// Define the path to the JSON file
const filePath = path.join(__dirname, 'common.json');

// Read the file synchronously and parse JSON
try {
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const words = JSON.parse(jsonData)['commonWords'];
  console.log(words);
  return words;
  
} catch (error) {
  console.error('Error reading JSON file:', error);
}


}
export default RandomWords;