const express = require('express'); //Line 1
const server = express();

const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const jwtRouter = require("./routes/jwt");
const usersRouter = require("./routes/users");
const mapsRouter = require("./routes/maps");

// View engine setup
server.set("views", path.join(__dirname, "views"));
server.set("view engine", "jade");

server.use(logger("dev"));
server.use(express.json());
server.use(express.urlencoded({extended: false}));
server.use(cookieParser());
server.use(express.static(path.join(__dirname, "public")));

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


// This displays message that the server running and listening to specified port
server.listen(5555, () => console.log(`Listening on port ${5555}`)); //Line 6
