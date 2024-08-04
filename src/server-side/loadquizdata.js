// Load the JSON file
const quizzes = cat('quizdata.json');
// Parse the JSON data
const quizArray = JSON.parse(quizzes);

// Insert each quiz into the collection
quizArray.forEach(function(quiz) {
    db.quizzes.insert(quiz);
});