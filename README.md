# SQL Feedback platform

## Learning platform for the automated analysis and evaluation of SQL queries.

### The goal of this project is to extend a learning platform with an evalution tool to provide individualized feedback and an LLM component to generate corresponding LLM-based learning tips.

## What to do before

1) Download Git
2) Download Docker
3) Install NPM

## How to clone the project

1) Create a target folder

2) Navigate to your folder

3) Clone the repository:
    git clone
    https://github.com/Emmelinaa/sqlfeedbackplatform.git


## Install the packages

1) Navigate to /client/ and /server/ and run:

    npm install

    **Note:** Navigate to cd /Docker-Project-NoSQLconcepts/client/ and cd /Docker-Project-NoSQLconcepts/server/


2) Navigate to /server/evaluation-tool/sql-query-distance/ folder and run:

    npm install

    **Note:** Navigate to cd /Docker-Project-NoSQLconcepts/server/evaluation-tool/sql-query-distance/


3) Navigate to /Docker-Project-NoSQLconcepts/ and run:

    cp .env.sample .env


## How to start

1) Navigate to /Docker-Project-NoSQLconcepts/ folder and run:

    docker-compose up --build

2) Navigate to /Docker-Project-NoSQLconcepts/ folder and run:

    docker compose exec ollama ollama pull gemma3:12b

3) Go to your browser and type in the following:

    https://localhost:3000

4) Log in using the test account.

    **User:** test
    **Password:** 1234

5) Create your own account under ''Manage users''.

5) Enter into any course area using the predefined passwords.

    **Note:** The login information are to be found in /Docker-Project-NoSQLconcepts/client/src/frontendComponents/pages/areaSelect.jsx