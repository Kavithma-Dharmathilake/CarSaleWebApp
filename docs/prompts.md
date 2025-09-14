# PROMPTS Used
This document will contain all the prompts that has been used through out this project

## 1. Initial Prompt - Create PRD
> I want to create Car Sales Web Application where users can list cars for sale (title, make, model, year, price, image URL) , View all available listings and Search/filter by make, model, and price. There will be mainly two users namely admin and customer. Both users can sign up and login to the system. customers can view car listings and purchase them. Admin can do everything that customer can do. Additionally admin can also create car listings. With this in mind, I want you to first evaluate the project template and think about a few possible PRD approaches before landing on the best one. Provide reasoning why this would be the best approach. Remember we're using MERN, a full-stack framework for web application.

## 2. Create Project Plan
 > From this PRD.md, create an actionable, step-by-step plan that we can use as a guide for LLM-assisted coding. Before you create the plan, think about a few different plan styles that would be suitable for this project and the implmentation style before selecting the best one. Give your reasoning for why you think we should use this plan style. Remember that we will constantly refer to this plan to guide our coding implementation so it should be well structured, concise, and actionable, while still providing enough information to guide the LLM.

## 3. Phase by Phase Implmentation

### 3.1. Phase 1
 >now by looking at the phase 1 in docs/prd-plan.md complete the milestone 1.1 set up the environment. consider the 1.2. Project Structure Creation given in docs/prd-plan.md for folder structure. Only implmenet server side given implmentations which is under ### 1.1 Environment Setup only, 4 the simple tasks

 >now by looking at the phase 1 in docs/prd-plan.md complete the milestone 1.1 set up the environment. consider the 1.2. Project Structure Creation given in docs/prd-plan.md for folder structure. Only implmenet tasks  which is under ### Backend Setup only, 4 the simple tasks 

 >i saw all the tokens, ports and mongodb strings are hardcoded to the code. i want you to put all these enviornment variables into .env file inlcude in .gitignore so that i can keep them secret. likewise please scan through @code and find all the screts envs that should be kept hidden and make it secure -> this was restored due to errors in envs.

 >now set up the frontend client section according to the folder strcture given only comlete the following steps. Initialize React application with Vite, Install dependencies: react-router-dom, axios, bootstrap, Set up basic component structure, Configure routing setup

 >likewise implemneted milestone by milestone



 ### 3.2. Phase 2 : Core Backend Development
 >now create the database model as per the instructions give in prd-plan.md

 >now create core authtentication system, core api endpoints along side with proper error handling as per the instructions give in prd-plan.md

 >testing the api in postman manually. i want to test these apis using postman. generate relevant curls with proper data

 ### 3.3 Phase 3 : Core Frontend Development

 >now bridge the created backend  apis with frontend componenets. Let's first start with login and register componenets. stop from thoese pages. do not go to other componenet. 

 >now bridge the backend api cars with frontend cars.jsx and cardetails.jsx  refer the api_testing_guide.md for the routes

 >now bride the backend api for transactions with frontend payment.jsx, payemtcance;.jsx and payemnsucess.jsx. refer the api testing routes

 ### 3.4. Phase 4: Advanced Features

 >now according to the prd.md and prd-plan.md bridge the core functions of customer and admin dashboard. In customer dashboard users needs to see the past transactions and download them. In admin dashboard admin can create new car listing, edit and update them. Relevant forms and UIs needs to be implemented.

 >ok something went wrong. first of all customer dashboard which dashboard.jsx it should display all the transactions done by that particular customer. i cannot see the such information. they should be abke to view each transaction and also able to dwonload the transaction pdf receipt as well. ui for view one trasnaction is not created yet.

 >now create the fucntions of admindashboard.jsx. It should include a table with all the cars, whether they are avaiable or not with their relevant status. I need a button to add new car to the system. This button should be a popup where i can input carlisting details. ui for the pop up form needs to designed as well. consider the relevant backend api routes car for the bridge backend and frontend.

 >