1. Users must login before they create quizzes
2. User's inputs are ascii characters (e.g. they would not choose the words of their name included in Unicode but not in ascii)
3. The logged in user in the adminQuizList and adminQuizCreate function is the authUserId the user pass to the function
4. The timeLastEdited and timeCreated in the object quiz is counted as Unix timestamp
5. In the process of the adminQuizNameUpdate and adminQuizDescriptionUpdate functions, the timeLastEdited shoud be updated
6. Every existing user Id and quiz Id is unique. However, onece the user or the quiz is being removed from the dataStore, their id could be re-used by other new-added users or quizzes (as long as their id is unique)