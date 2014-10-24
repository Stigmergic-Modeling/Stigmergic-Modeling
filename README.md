# Stigmergic-modeling
Stigmergic-modeling helps you to model the conceptual diagram (in the form of class diagram) collaboratively with the help of massive developers all around the world. 
It helps you to learn the attitudes of the developers toward the construction of the model and helps you to generate a better one. 
The entire collaborative mode is web-based. All you need is a web browser to start modeling. 

## Components
```
foreground
	-- views			pages 
	-- public			attached files 
		-- images
		-- img
		-- javascrpts	
		-- stylesheets 	css
background
	-- models			
	-- routes			http request analyze
	-- app.js			main file
	-- package.json			the name and version of your project and dependencies.
	-- settings.js			db imformation
	--node_modules(not included)  Dependencies of the project. Modules can be installed by npm
```
## How to get it work

#### Prerequisites:
```
	1. install Node.js (version 0.10.25 recommended) 
	2. install Mongodb (version 2.4.9 recommend)
```

#### Running
```
Step.1 At the first time run the project, use npm to install node_modules file (“npm install”).
Step.2 run mongodb (“mongod –dbpath db_dir”)
Step.3 run nodejs (“node app.js”)
Step.4 go homepage (open the webbrowser and type in “localhost:3000” in Address bar).
```

## Resource to the Newcomers
```
http://www.nodejs.org/
http://www.npmjs.org/
http://www.mongodb.org/
```
