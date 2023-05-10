const express = require('express'); //Line 1
const server = express();

const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const jwtRouter = require("./server/routes/jwt");
const usersRouter = require("./server/routes/users");
const mapsRouter = require("./server/routes/maps");

// View engine setup
server.set("views", path.join(__dirname, "server/views"));
server.set("view engine", "jade");

server.use(logger("dev"));
server.use(express.json());
server.use(express.urlencoded({extended: false}));
server.use(cookieParser());

server.use(express.static(__dirname));
server.use(express.static(path.join(__dirname, 'client/build')));
server.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'client/build/index.html'));
});


server.get('/!*.js', function (req, res) {
	res.set('Content-Encoding', 'gzip');
	res.set('Content-Type', 'application/json');
	res.sendFile(path.join(__dirname, 'client/build', `${req.path}.gz`)); //serving build folder
});

server.use("/jwt", jwtRouter);
server.use("/users", usersRouter);
server.use("/maps", mapsRouter);

// Catch 404 and forward to error handler
server.use(function(req, res, next)
{
	next(createError(404));
});

// Error handler
server.use(function(err, req, res, next)
{
	// Set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// Render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = server;

console.log("Hello");

// This displays message that the server running and listening to specified port
server.listen(5555, () => console.log(`Listening on port ${5555}`)); //Line 6
